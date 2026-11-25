import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import fs from "node:fs";
import express from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { MemoryStore } from "express-rate-limit";
import { createApp } from "../src/app.js";
import {
  inspectInput,
  protectAccountInput,
  sanitizeResponse,
  protectResponse,
  escapeSearch,
} from "../src/Security/input.js";
import { createApiAccessGuard } from "../src/Security/access.js";
import { validateSecurityConfig } from "../src/Security/config.js";
import {
  gradeAssessment,
  gradeQuiz,
  questionsForViewer,
} from "../src/Security/grading.js";
import { canReadPost } from "../src/Security/postPrivacy.js";
import { validateGenerationInput } from "../src/Security/generation.js";
import {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
} from "../src/Utils/jwt.util.js";
import { authenticate } from "../src/Middleware/auth.middleware.js";
import sessions from "../src/Module/Auth/AuthSessions.repository.js";
import auth from "../src/Module/Auth/Auth.service.js";
import students from "../src/Module/Students/Students.repository.js";
import assessmentRepo from "../src/Module/Assessments/Assessments.repository.js";
import assessmentService from "../src/Module/Assessments/Assessments.service.js";
import quizRepo from "../src/Module/Quizzes/Quizzes.repository.js";
import quizService from "../src/Module/Quizzes/Quizzes.service.js";
import achievements from "../src/Module/Achievements/Achievements.service.js";
import { db } from "../src/DB/db.connection.js";
import { multerUpload } from "../src/Middleware/multer.middleware.js";
import {
  publishedLessonDocument,
  isPublishedLesson,
} from "../src/Whiteboard/lessonSummary.js";
import {
  allowedRequestOrigin,
  readLimitedBody,
  safeBackendJson,
} from "../alma_frontend/src/lib/request-security.ts";

process.env.JWT_SECRET = randomBytes(32).toString("hex");
process.env.JWT_REFRESH_SECRET = randomBytes(32).toString("hex");
const id = new ObjectId().toHexString();
const other = new ObjectId().toHexString();
const identity = { id, role: "student", auth_version: 0, sid: "test-session" };
const assessment = {
  _id: new ObjectId(),
  title: "Loops",
  passing_score: 60,
  questions: [
    {
      _id: "q1",
      question_type: "mcq",
      question_text: "What is printed?",
      options: ["1", "2"],
      correct_answer: "2",
      points: 10,
      explanation: "The loop runs twice.",
    },
  ],
};
const quiz = {
  _id: new ObjectId(),
  questions: [
    {
      _id: "q1",
      question: "Pick the output.",
      options: ["1", "2"],
      correct_option_index: 1,
      explanation: "Two iterations.",
    },
  ],
};

async function serve(t, app) {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  return `http://127.0.0.1:${server.address().port}`;
}
const middleware = (fn, req) =>
  new Promise((resolve) => fn(req, {}, (error) => resolve(error)));
async function guard(user, path, method = "GET", body = {}, resource = {}) {
  const req = {
    path,
    method,
    body,
    query: {},
    headers: { authorization: "Bearer test" },
  };
  const check = createApiAccessGuard({
    authenticateRequest(req, res, next) {
      req.authUser = user;
      next();
    },
    load: async () => resource,
  });
  return { error: await middleware(check, req), req };
}

test("authentication secrets have no defaults and access/refresh keys must differ", () => {
  const saved = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    assert.throws(validateSecurityConfig, /JWT_SECRET/);
    process.env.JWT_SECRET = process.env.JWT_REFRESH_SECRET;
    assert.throws(validateSecurityConfig, /different/);
  } finally {
    process.env.JWT_SECRET = saved;
  }
});

test("JWTs expire after 15 minutes and reject tampering, wrong algorithms and token types", () => {
  const token = generateToken(identity);
  const decoded = verifyToken(token);
  assert.equal(decoded.exp - decoded.iat, 900);
  assert.throws(() => verifyRefreshToken(token));
  assert.throws(() => verifyToken(generateRefreshToken(identity)));
  assert.throws(() => verifyToken(token.slice(0, -3) + "bad"));
  const wrong = jwt.sign(
    { ...identity, tokenType: "access" },
    process.env.JWT_SECRET,
    { algorithm: "HS384", issuer: "alma-api", audience: "alma-web" },
  );
  assert.throws(() => verifyToken(wrong));
});

test("refresh rotates once; replay revokes the family and its current access token", async (t) => {
  let current,
    revoked = false;
  t.mock.method(sessions, "create", async (sid, uid, role, refresh) => {
    current = refresh;
  });
  t.mock.method(sessions, "findActive", async () =>
    revoked ? null : { auth_version: 0 },
  );
  t.mock.method(sessions, "rotate", async (sid, old, next) => {
    if (old !== current) return false;
    current = next;
    return true;
  });
  t.mock.method(sessions, "revoke", async () => {
    revoked = true;
  });
  t.mock.method(students, "findById", async () => ({
    _id: id,
    is_active: true,
    auth_version: 0,
  }));
  const initial = await auth.generateTokenPair(identity);
  const rotated = await auth.refresh(initial.refreshToken);
  assert.notEqual(rotated.refreshToken, initial.refreshToken);
  await assert.rejects(auth.refresh(initial.refreshToken), { statusCode: 401 });
  assert.equal(revoked, true);
  const error = await middleware(authenticate, {
    headers: { authorization: `Bearer ${rotated.accessToken}` },
  });
  assert.equal(error.statusCode, 401);
});

test("disabled accounts, credential revisions and revoked sessions deny access", async (t) => {
  let user = { _id: id, auth_version: 1, is_active: true };
  t.mock.method(sessions, "findActive", async () => ({ auth_version: 0 }));
  t.mock.method(students, "findById", async () => user);
  const req = () => ({
    headers: { authorization: `Bearer ${generateToken(identity)}` },
  });
  assert.equal((await middleware(authenticate, req())).statusCode, 401);
  user = { ...user, auth_version: 0, is_active: false };
  assert.equal((await middleware(authenticate, req())).statusCode, 401);
  user = { ...user, is_active: true, role: "admin", password_hash: "secret" };
  const accepted = req();
  assert.equal(await middleware(authenticate, accepted), undefined);
  assert.equal(accepted.authUser.role, "student");
  assert.equal(accepted.authUser.password_hash, undefined);
});

test("an authentication database outage fails closed with 503", async (t) => {
  t.mock.method(sessions, "findActive", async () => {
    throw new Error("database outage");
  });
  const error = await middleware(authenticate, {
    headers: { authorization: `Bearer ${generateToken(identity)}` },
  });
  assert.equal(error.statusCode, 503);
});

test("logout revokes the whole family using refresh proof", async (t) => {
  let sid;
  t.mock.method(sessions, "revoke", async (value) => {
    sid = value;
  });
  await auth.logout(null, generateRefreshToken(identity));
  assert.equal(sid, identity.sid);
});

test("anonymous requests cannot register admins or read protected resources", async (t) => {
  const url = await serve(
    t,
    createApp({ storeFactory: () => new MemoryStore() }),
  );
  assert.equal(
    (
      await fetch(`${url}/api/v1/admins`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      })
    ).status,
    401,
  );
  assert.equal((await fetch(`${url}/api/v1/lessons`)).status, 401);
  assert.equal(
    (
      await fetch(`${url}/api/v1/health`, {
        headers: { origin: "https://attacker.example" },
      })
    ).status,
    403,
  );
  const health = await fetch(`${url}/api/v1/health`);
  assert.equal(health.headers.get("x-powered-by"), null);
  assert.equal(health.headers.get("x-content-type-options"), "nosniff");
});

test("teacher ownership, account ownership and administrator-only verification are enforced", async () => {
  const teacher = { _id: id, role: "teacher", is_verified: true };
  assert.equal(
    (
      await guard(
        teacher,
        `/lessons/${other}`,
        "PUT",
        {},
        { _id: other, created_by: other },
      )
    ).error.statusCode,
    403,
  );
  assert.equal(
    (await guard(teacher, `/teachers/${other}`, "PUT", {}, { _id: other }))
      .error.statusCode,
    403,
  );
  assert.equal(
    (
      await guard(teacher, "/admins/teacher-approvals", "POST", {
        teacher_id: other,
      })
    ).error.statusCode,
    403,
  );
  assert.equal(
    (
      await guard(
        { ...teacher, is_verified: false },
        "/lesson-generations",
        "POST",
        { topic: "Loops" },
      )
    ).error.statusCode,
    403,
  );
  assert.equal(
    (
      await guard(
        teacher,
        `/lessons/${other}`,
        "PUT",
        { course_id: other },
        { created_by: other },
      )
    ).error.statusCode,
    403,
  );
});

test("students cannot alter privileges, relationships or learning rewards", () => {
  for (const field of [
    "role",
    "teacher_id",
    "parent_id",
    "is_verified",
    "auth_version",
    "xp",
    "completed_lessons",
  ]) {
    assert.throws(
      () =>
        protectAccountInput({
          method: "PUT",
          path: "/students",
          body: { [field]: "forged" },
          authUser: { role: "student" },
        }),
      { statusCode: 400 },
    );
  }
  assert.doesNotThrow(() =>
    protectAccountInput({
      method: "POST",
      path: "/admins/teacher-approvals",
      body: { teacher_id: other },
      authUser: { role: "admin" },
    }),
  );
});

test("database/prototype injection, nested queries and oversized input are rejected", () => {
  for (const value of [
    JSON.parse('{"__proto__":{"admin":true}}'),
    { email: { $ne: null } },
    { "a.b": "x" },
  ])
    assert.throws(() => inspectInput(value));
  assert.throws(() => inspectInput({ id: ["a", "b"] }, { query: true }));
  assert.throws(() => inspectInput({ text: "x".repeat(100001) }));
  assert.equal(new RegExp(escapeSearch("(a+)+$")).test("(a+)+$"), true);
});

test("nested routers retain legitimate login tokens but redact profile credentials and PII", async (t) => {
  const app = express();
  app.use(protectResponse);
  const router = express.Router();
  router.post("/login", (req, res) =>
    res.json({
      data: {
        accessToken: "access",
        refreshToken: "refresh",
        password_hash: "secret",
      },
    }),
  );
  router.get("/profile", (req, res) =>
    res.json({ accessToken: "access", password_hash: "secret" }),
  );
  app.use("/api/v1/students", router);
  const url = await serve(t, app);
  const login = await (
    await fetch(`${url}/api/v1/students/login`, { method: "POST" })
  ).json();
  assert.equal(login.data.accessToken, "access");
  assert.equal(login.data.password_hash, undefined);
  assert.deepEqual(
    await (await fetch(`${url}/api/v1/students/profile`)).json(),
    {},
  );
  const profile = sanitizeResponse(
    {
      _id: other,
      first_name: "Student",
      email: "private@example.com",
      student_code: "STU-12345",
      parent_phone: "private",
    },
    { publicProfiles: true, userId: id },
  );
  assert.equal(profile.email, undefined);
  assert.equal(profile.parent_phone, undefined);
});

test("assessment and quiz grading ignore forged client scores", async (t) => {
  let savedAssessment, savedQuiz;
  t.mock.method(assessmentRepo, "findById", async () => assessment);
  t.mock.method(assessmentRepo, "saveSubmission", async (doc) => {
    savedAssessment = doc;
    return doc;
  });
  t.mock.method(quizRepo, "findById", async () => quiz);
  t.mock.method(quizRepo, "saveAttempt", async (doc) => {
    savedQuiz = doc;
    return doc;
  });
  await assessmentService.submitAssessment("assessment", id, {
    answers: { q1: "1" },
    score_percent: 100,
    passed: true,
    earned_points: 1000,
    student_id: other,
  });
  await quizService.recordAttempt("quiz", id, {
    answers: { q1: 0 },
    score: 100,
    score_percent: 100,
  });
  assert.equal(savedAssessment.score_percent, 0);
  assert.equal(savedAssessment.passed, false);
  assert.equal(savedAssessment.student_id, id);
  assert.equal(savedQuiz.score, 0);
  assert.equal(savedQuiz.score_percent, 0);
  assert.equal(gradeAssessment(assessment, { q1: "2" }).score_percent, 100);
  assert.equal(gradeQuiz(quiz, { q1: 1 }).score, 1);
});

test("unknown, duplicate and invalid answer submissions are rejected", () => {
  assert.throws(() => gradeAssessment(assessment, { unknown: "2" }));
  assert.throws(() =>
    gradeAssessment(assessment, [
      { question_id: "q1", answer: "2" },
      { question_id: "q1", answer: "2" },
    ]),
  );
  assert.throws(() => gradeQuiz(quiz, { q1: 9 }));
  assert.throws(() => gradeQuiz(quiz, { q1: "1" }));
  assert.equal(gradeQuiz(quiz, {}).score, 0);
});

test("student question responses omit answer keys and feedback while author views retain them", () => {
  const student = questionsForViewer(assessment, { role: "student" });
  assert.equal(student.questions[0].correct_answer, undefined);
  assert.equal(student.questions[0].explanation, undefined);
  assert.equal(
    questionsForViewer(quiz, { role: "student" }).questions[0]
      .correct_option_index,
    undefined,
  );
  assert.equal(
    questionsForViewer(quiz, { role: "teacher" }).questions[0]
      .correct_option_index,
    1,
  );
});

test("lesson completion checks approved checkpoints and concurrent repeats award XP once", async (t) => {
  const lessonId = new ObjectId(),
    teacherId = new ObjectId();
  const lesson = {
    _id: lessonId,
    created_by: teacherId,
    versions: [
      {
        version_no: 1,
        state: "APPROVED",
        sections: [{ diagnostic_check: { correct_answer: "2" } }],
      },
    ],
  };
  const student = { _id: id, teacher_id: teacherId, completed_lessons: [] };
  let xp = 0;
  t.mock.method(students, "findById", async () => student);
  t.mock.method(db, "collection", (name) =>
    name === "lessons"
      ? { findOne: async () => lesson }
      : name === "students"
        ? {
            updateOne: async (filter, update) => {
              assert.ok(
                filter.completed_lessons.$nin.some(
                  (value) => String(value) === String(lessonId),
                ),
              );
              if (student.completed_lessons.length) return { modifiedCount: 0 };
              student.completed_lessons.push(lessonId);
              xp += update.$inc.xp;
              return { modifiedCount: 1 };
            },
          }
        : { updateOne: async () => ({ modifiedCount: 1 }) },
  );
  await assert.rejects(
    achievements.completeLesson(id, String(lessonId), {
      version_no: 1,
      answers: { 0: "wrong" },
    }),
    { statusCode: 422 },
  );
  await assert.rejects(
    achievements.completeLesson(id, String(lessonId), {
      version_no: 2,
      answers: { 0: "2" },
    }),
    { statusCode: 409 },
  );
  const results = await Promise.all(
    [1, 2, 3].map(() =>
      achievements.completeLesson(id, String(lessonId), {
        version_no: 1,
        answers: { 0: "2" },
      }),
    ),
  );
  assert.equal(xp, 50);
  assert.equal(results.filter((r) => !r.already_completed).length, 1);
});

test("student lesson documents exclude newer drafts", () => {
  const lesson = {
    current_version_no: 2,
    versions: [
      { version_no: 2, state: "DRAFT", sections: [{ title: "secret draft" }] },
      { version_no: 1, state: "APPROVED", sections: [{ title: "published" }] },
    ],
  };
  const safe = publishedLessonDocument(lesson);
  assert.equal(safe.current_version_no, 1);
  assert.equal(safe.versions.length, 1);
  assert.equal(isPublishedLesson({ ...lesson, status: "archived" }), false);
});

test("private post visibility is restricted to the relevant social relationship", () => {
  assert.equal(
    canReadPost(
      { _id: id, following: [] },
      { author_id: other, visibility: "followers" },
    ),
    false,
  );
  assert.equal(
    canReadPost(
      { _id: id, following: [other] },
      { author_id: other, visibility: "followers" },
    ),
    true,
  );
  assert.equal(
    canReadPost(
      { _id: id, friends: [] },
      { author_id: other, visibility: "friends" },
    ),
    false,
  );
});

test("uploads reject dangerous extensions, mismatched MIME, extra files and destination traversal", async (t) => {
  const folder = `security-${randomBytes(5).toString("hex")}`;
  const destination = `uploads/${folder}`;
  t.after(() => fs.rmSync(destination, { recursive: true, force: true }));
  assert.throws(() => multerUpload({ desiredPath: "../outside" }));
  const app = express();
  app.post(
    "/",
    multerUpload({ desiredPath: folder }).single("profile"),
    (req, res) => res.json({ success: true }),
  );
  app.use((error, req, res, next) =>
    res.status(400).json({ error: "Rejected" }),
  );
  const url = await serve(t, app);
  const png = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d840000000049454e44ae426082",
    "hex",
  );
  for (const [name, type, count] of [
    ["attack.html", "image/png", 1],
    ["image.png", "image/jpeg", 1],
    ["image.png", "image/png", 2],
  ]) {
    const form = new FormData();
    form.append("profile", new Blob([png], { type }), name);
    if (count === 2) form.append("avatar", new Blob([png], { type }), name);
    assert.equal(
      (await fetch(url, { method: "POST", body: form })).status,
      400,
    );
    assert.deepEqual(fs.readdirSync(destination), []);
  }
});

test("browser API proxy helpers reject cross-origin writes and redact nested credentials", async () => {
  assert.equal(
    allowedRequestOrigin(
      "https://attacker.example",
      "http://localhost:3000/api/proxy/students",
    ),
    false,
  );
  const configured = process.env.NEXTAUTH_URL || "http://localhost:3000";
  assert.equal(
    allowedRequestOrigin(configured, configured + "/api/proxy/students"),
    true,
  );
  assert.deepEqual(
    safeBackendJson({
      data: {
        accessToken: "a",
        refreshToken: "r",
        password_hash: "p",
        title: "safe",
      },
    }),
    { data: { title: "safe" } },
  );
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(11));
      controller.close();
    },
  });
  await assert.rejects(readLimitedBody(stream, 10), /BODY_TOO_LARGE/);
});

test("generation requests reject unbounded instructions and arbitrary input structures", () => {
  assert.throws(() =>
    validateGenerationInput({
      topic: "Loops",
      objectives: Array(21).fill("objective"),
    }),
  );
  assert.throws(() =>
    validateGenerationInput({ topic: "Loops", duration: 1000 }),
  );
  assert.doesNotThrow(() =>
    validateGenerationInput({
      topic: "Loops",
      objectives: ["Trace a loop."],
      prerequisites: "Variables",
      target_duration_minutes: 15,
    }),
  );
});
