import { ObjectId } from "mongodb";
import { db } from "../DB/db.connection.js";
import { authenticate } from "../Middleware/auth.middleware.js";
import { isPublishedLesson } from "../Whiteboard/lessonSummary.js";
import coursesRepository from "../Module/Courses/Courses.repository.js";
import { httpError, protectAccountInput } from "./input.js";
import { canReadPost } from "./postPrivacy.js";

const write = (method) => !["GET", "HEAD", "OPTIONS"].includes(method);
const sameId = (a, b) =>
  Boolean(a && b && String(a._id || a) === String(b._id || b));
const forms = (value) =>
  ObjectId.isValid(String(value))
    ? [new ObjectId(String(value)), String(value)]
    : [value];
const collectionNames = {
  courses: "courses",
  modules: "modules",
  lessons: "lessons",
  "lesson-generations": "lesson_generations",
  assessments: "assessments",
  quizzes: "quizzes",
  achievements: "achievements",
  "teacher-groups": "teachergroups",
  students: "students",
  teachers: "teachers",
  parents: "parents",
  admins: "admins",
  posts: "posts",
};
const publicCredential = (req) =>
  req.method === "POST" &&
  (/^\/(students|teachers|parents)$/.test(req.path) ||
    /^\/(students|teachers|parents|admins)\/login$/.test(req.path) ||
    /^\/auth\/(refresh-token|logout)$/.test(req.path));
const published = (document) =>
  document.status
    ? document.status === "published"
    : document.versions
      ? isPublishedLesson(document)
      : true;

async function loadResource(kind, id) {
  if (kind === "courses") return await coursesRepository.findById(id);
  if (kind === "lesson-generations" && !ObjectId.isValid(id))
    return await db.collection("lesson_generations").findOne({ job_id: id });
  if (!ObjectId.isValid(id))
    throw httpError(400, "Invalid resource identifier.");
  return await db
    .collection(collectionNames[kind])
    .findOne({ _id: new ObjectId(id) });
}

async function ownsResource(user, resource) {
  if (user.role === "admin") return true;
  if (
    sameId(
      resource.created_by || resource.requested_by || resource.teacher_id,
      user._id,
    )
  )
    return true;
  if (resource.course_id) {
    const course = await coursesRepository.findById(String(resource.course_id));
    return course && sameId(course.created_by, user._id);
  }
  return false;
}

export async function canStudyLesson(user, lesson) {
  if (user.role === "admin") return true;
  if (user.role === "teacher")
    return (
      (await ownsResource(user, lesson)) ||
      (!lesson.created_by && published(lesson))
    );
  if (user.role !== "student" || !published(lesson)) return false;
  if (
    lesson.course_id &&
    (user.enrolled_courses || []).some((id) => sameId(id, lesson.course_id))
  )
    return true;
  if (lesson.created_by && sameId(lesson.created_by, user.teacher_id))
    return true;
  return Boolean(
    await db
      .collection("teachergroups")
      .findOne(
        {
          students: { $in: forms(user._id) },
          "lessons.lesson_id": String(lesson._id),
        },
        { projection: { _id: 1 } },
      ),
  );
}

function addScope(req, constraint) {
  req.query.$and = [...(req.query.$and || []), constraint];
}

async function scopeCollection(req, kind) {
  const user = req.authUser;
  if (user.role === "admin") return;
  if (kind === "courses") {
    if (user.role === "teacher")
      addScope(req, {
        $or: [
          { created_by: { $in: forms(user._id) } },
          { status: "published" },
        ],
      });
    else req.query.status = "published";
  } else if (kind === "lesson-generations")
    req.query.requested_by = String(user._id);
  else if (["modules", "lessons", "assessments", "quizzes"].includes(kind)) {
    if (user.role === "student") {
      const enrollment = (user.enrolled_courses || []).flatMap(forms);
      const choices = [{ course_id: { $in: enrollment } }];
      if (kind === "lessons") {
        if (user.teacher_id)
          choices.push({ created_by: { $in: forms(user.teacher_id) } });
        const groups = await db
          .collection("teachergroups")
          .find(
            { students: { $in: forms(user._id) } },
            { projection: { "lessons.lesson_id": 1 } },
          )
          .limit(100)
          .toArray();
        const ids = groups
          .flatMap((group) =>
            (group.lessons || [])
              .map((lesson) => lesson.lesson_id)
              .filter(Boolean),
          )
          .flatMap(forms);
        choices.push({ _id: { $in: ids } });
      } else req.query.status = "published";
      addScope(req, { $or: choices });
    } else if (user.role === "teacher") {
      const courses = await db
        .collection("courses")
        .find(
          { created_by: { $in: forms(user._id) } },
          { projection: { _id: 1 } },
        )
        .limit(100)
        .toArray();
      addScope(req, {
        $or: [
          { created_by: { $in: forms(user._id) } },
          {
            course_id: { $in: courses.flatMap((course) => forms(course._id)) },
          },
        ],
      });
    } else
      throw httpError(
        403,
        "This library is available to students and teachers.",
      );
  } else if (kind === "students" && user.role === "teacher") {
    const groups = await db
      .collection("teachergroups")
      .find(
        { teacher_id: { $in: forms(user._id) } },
        { projection: { students: 1 } },
      )
      .limit(100)
      .toArray();
    addScope(req, {
      $or: [
        { teacher_id: { $in: forms(user._id) } },
        {
          _id: {
            $in: groups.flatMap((group) =>
              (group.students || []).flatMap(forms),
            ),
          },
        },
      ],
    });
  }
}

export function createApiAccessGuard({
  authenticateRequest = authenticate,
  load = loadResource,
} = {}) {
  return async (req, res, next) => {
    const proceed = async () => {
      try {
        const segments = req.path.replace(/\/$/, "").split("/").filter(Boolean);
        const kind = segments[0],
          methodWrite = write(req.method),
          user = req.authUser;
        if (
          !collectionNames[kind] &&
          !["auth", "users", "messages", "health"].includes(kind)
        )
          throw httpError(404, "Resource not found.");
        if (publicCredential(req)) {
          protectAccountInput(req);
          return next();
        }
        if (req.path === "/health") return next();
        if (!user) {
          if (kind !== "courses" || methodWrite)
            throw httpError(401, "Authentication required.");
          req.query.status = "published";
          if (segments[1]) {
            const course = await load(kind, segments[1]);
            if (!course || !published(course))
              throw httpError(404, "Course not found.");
          }
          return next();
        }
        if (kind === "admins" && user.role !== "admin")
          throw httpError(403, "Administrator access is required.");
        if (kind === "parents" && !["parent", "admin"].includes(user.role))
          throw httpError(403, "Parent access is required.");
        if (
          kind === "lesson-generations" &&
          !["teacher", "admin"].includes(user.role)
        )
          throw httpError(403, "Only teachers can generate lessons.");
        if (
          user.role === "teacher" &&
          !user.is_verified &&
          ((methodWrite &&
            [
              "courses",
              "modules",
              "lessons",
              "assessments",
              "quizzes",
              "teacher-groups",
              "lesson-generations",
            ].includes(kind)) ||
            kind === "teacher-groups" ||
            (kind === "students" && segments[1] !== "search"))
        )
          throw httpError(
            403,
            "Your teacher account needs administrator verification before accessing students or authoring lessons.",
          );
        if (kind === "messages" && user.role !== "student")
          throw httpError(403, "Student access is required.");
        if (user.role === "student" && ["teacher-groups", "messages"].includes(kind)) req.publicProfiles = true;
        if (
          kind === "students" &&
          !["student", "teacher", "admin", "parent"].includes(user.role)
        )
          throw httpError(403, "Access denied.");
        if (kind === "teacher-groups") {
          if (!["student", "teacher", "admin"].includes(user.role))
            throw httpError(403, "Access denied.");
          if (req.path.endsWith("/join") && user.role !== "student")
            throw httpError(403, "Only students can join a class.");
          if (
            methodWrite &&
            !req.path.endsWith("/join") &&
            !req.path.endsWith("/messages") &&
            !["teacher", "admin"].includes(user.role)
          )
            throw httpError(403, "Teacher access is required.");
        }
        const completion =
          /\/(enroll|complete|submit|attempt)$/.test(req.path) ||
          /^\/achievements\/(courses|lessons)\//.test(req.path);
        if (completion && user.role !== "student")
          throw httpError(403, "Student access is required.");
        if (completion && req.body?.force)
          throw httpError(403, "Completion is verified by the server.");
        if (
          ["courses", "modules", "lessons", "assessments", "quizzes"].includes(
            kind,
          ) &&
          methodWrite &&
          !completion &&
          !["teacher", "admin"].includes(user.role)
        )
          throw httpError(403, "Teacher access is required.");
        if (
          kind === "achievements" &&
          methodWrite &&
          !completion &&
          user.role !== "admin"
        )
          throw httpError(403, "Administrator access is required.");
        if (
          kind === "lesson-generations" &&
          ["PUT", "PATCH"].includes(req.method) &&
          user.role !== "admin"
        )
          throw httpError(403, "Job state is managed by the server.");
        if (
          kind === "students" &&
          methodWrite &&
          /friend|follow/.test(req.path) &&
          user.role !== "student"
        )
          throw httpError(403, "Student access is required.");
        protectAccountInput(req);
        if (
          [
            "courses",
            "modules",
            "lessons",
            "assessments",
            "quizzes",
            "lesson-generations",
          ].includes(kind) &&
          ["POST", "PUT", "PATCH"].includes(req.method) &&
          !completion
        ) {
          if (user.role !== "admin" && req.body?.course_id) {
            const course = await load("courses", req.body.course_id);
            if (!course || !(await ownsResource(user, course)))
              throw httpError(403, "You cannot author content in this course.");
          }
          if (req.body?.module_id) {
            const module = await load("modules", req.body.module_id);
            if (
              !module ||
              !(await ownsResource(user, module)) ||
              (req.body.course_id &&
                !sameId(module.course_id, req.body.course_id))
            )
              throw httpError(
                403,
                "The module does not belong to this course.",
              );
          }
          if (
            kind === "lesson-generations" &&
            req.method === "POST" &&
            segments.length === 1
          ) {
            req.body.requested_by = String(user._id);
            req.body.model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
            for (const key of [
              "_id",
              "job_id",
              "status",
              "current_step",
              "progress_percent",
              "lesson_id",
              "error",
            ])
              delete req.body[key];
          } else if (
            user.role !== "admin" &&
            req.method === "POST" &&
            segments.length === 1
          )
            req.body.created_by = String(user._id);
        }
        if (methodWrite && req.body) {
          delete req.body._id;
          delete req.body.created_at;
          delete req.body.updated_at;
          if (req.method !== "POST" && user.role !== "admin") {
            delete req.body.created_by;
            delete req.body.requested_by;
          }
        }
        const detailId =
          kind === "lesson-generations" && segments[1] === "job"
            ? segments[2]
            : segments[1];
        const specials = new Set([
          "profile",
          "name",
          "profile-picture",
          "my-lessons",
          "dashboard-summary",
          "search",
          "friends",
          "my-groups",
          "join",
          "feed",
          "home-feed",
          "share",
          "me",
          "courses",
          "lessons",
          "messages",
          "children",
          "link-child",
          "unlink-child",
          "child",
          "threads",
          "guardian-links",
          "teacher-approvals",
          "list",
          "friend-request",
          "accept-friend-request",
          "reject-friend-request",
        ]);
        if (detailId && collectionNames[kind] && !specials.has(detailId)) {
          const resource = await load(kind, detailId);
          if (!resource) throw httpError(404, "Resource not found.");
          req.securityResource = resource;
          if (kind === "posts" && !canReadPost(user, resource))
            throw httpError(404, "Post not found.");
          if (["students", "teachers", "parents", "admins"].includes(kind)) {
            if (
              methodWrite &&
              !/friend|follow/.test(req.path) &&
              user.role !== "admin" &&
              (!sameId(resource._id, user._id) || kind !== user.role + "s")
            )
              throw httpError(403, "You can only change your own account.");
            if (!methodWrite) {
              if (
                kind === "parents" &&
                !sameId(resource._id, user._id) &&
                user.role !== "admin"
              )
                throw httpError(
                  403,
                  "You can only view your own parent account.",
                );
              req.publicProfiles =
                user.role !== "admin" && !sameId(resource._id, user._id);
              if (
                kind === "students" &&
                user.role === "parent" &&
                (!sameId(resource.parent_id, user._id) ||
                  !resource.guardian_verified_at)
              )
                throw httpError(
                  403,
                  "This student is not linked to your parent account.",
                );
            }
          } else if (kind === "lessons") {
            if (
              methodWrite && !completion
                ? !(await ownsResource(user, resource))
                : !(await canStudyLesson(user, resource))
            )
              throw httpError(403, "You do not have access to this lesson.");
          } else if (["modules", "assessments", "quizzes"].includes(kind)) {
            const enrolled = (user.enrolled_courses || []).some((id) =>
              sameId(id, resource.course_id),
            );
            if (user.role === "student" && (!published(resource) || !enrolled))
              throw httpError(
                403,
                "Enroll in the course to access this content.",
              );
            if (
              user.role === "teacher" &&
              !(await ownsResource(user, resource))
            )
              throw httpError(403, "You do not own this content.");
          } else if (kind === "courses") {
            if (
              methodWrite &&
              !completion &&
              !(await ownsResource(user, resource))
            )
              throw httpError(403, "You do not own this course.");
            if (user.role === "student" && !published(resource))
              throw httpError(404, "Course not found.");
          } else if (
            kind === "lesson-generations" &&
            !(await ownsResource(user, resource))
          )
            throw httpError(403, "You do not own this generation job.");
          else if (
            kind === "achievements" &&
            user.role !== "admin" &&
            !sameId(resource.student_id, user._id)
          )
            throw httpError(
              403,
              "This achievement belongs to another account.",
            );
        }
        if (segments.length === 1 && req.method === "GET")
          await scopeCollection(req, kind);
        if (
          kind === "students" &&
          !methodWrite &&
          (["search", "friends"].includes(detailId) ||
            /\/(followers|following)$/.test(req.path) ||
            (segments.length === 1 && user.role !== "admin"))
        )
          req.publicProfiles = true;
        if (
          kind === "teachers" &&
          !methodWrite &&
          (segments.length === 1 ||
            (detailId !== "profile" && !sameId(detailId, user._id)))
        )
          req.publicProfiles = user.role !== "admin";
        next();
      } catch (error) {
        next(error);
      }
    };
    const publicRequest =
      publicCredential(req) ||
      req.path === "/health" ||
      (req.path.startsWith("/courses") && !write(req.method));
    if (publicRequest && !req.headers.authorization) return proceed();
    return authenticateRequest(req, res, (error) =>
      error ? next(error) : proceed(),
    );
  };
}
export const apiAccessGuard = createApiAccessGuard();
