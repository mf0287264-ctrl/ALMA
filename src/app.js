import express from "express";
import cors from "cors";
import helmet from "helmet";
import { validateSecurityConfig } from "./Security/config.js";
import { requestSecurity, makeLimiter } from "./Security/http.js";
import { validateRequestInput, protectResponse } from "./Security/input.js";
import { apiAccessGuard } from "./Security/access.js";
import errorHandler from "./Middleware/error.middleware.js";
import authRoutes from "./Module/Auth/Auth.routes.js";
import usersRoutes from "./Module/Users/Users.routes.js";
import parentsRoutes from "./Module/Parents/Parents.routes.js";
import studentsRoutes from "./Module/Students/Students.routes.js";
import teachersRoutes from "./Module/Teachers/Teachers.routes.js";
import adminsRoutes from "./Module/Admins/Admins.routes.js";
import coursesRoutes from "./Module/Courses/Courses.routes.js";
import modulesRoutes from "./Module/Modules/Modules.routes.js";
import lessonsRoutes from "./Module/Lessons/Lessons.routes.js";
import generationRoutes from "./Module/LessonGenerations/LessonGenerations.routes.js";
import assessmentsRoutes from "./Module/Assessments/Assessments.routes.js";
import quizzesRoutes from "./Module/Quizzes/Quizzes.routes.js";
import achievementsRoutes from "./Module/Achievements/Achievements.routes.js";
import postsRoutes from "./Module/Posts/Posts.routes.js";
import messagesRoutes from "./Module/Messages/Messages.routes.js";
import groupsRoutes from "./Module/TeacherGroups/TeacherGroups.routes.js";

export function createApp({ storeFactory, accessGuard = apiAccessGuard } = {}) {
  validateSecurityConfig();
  const app = express();
  app.disable("x-powered-by");
  app.set("query parser", "simple");
  app.set(
    "trust proxy",
    process.env.TRUST_PROXY === "loopback" ? "loopback" : false,
  );
  const origins = (
    process.env.CORS_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000"
  )
    .split(",")
    .map((value) => value.trim());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "same-site" },
      referrerPolicy: { policy: "no-referrer" },
    }),
  );
  app.use(
    cors({
      origin(origin, done) {
        if (!origin || origins.includes(origin)) return done(null, true);
        done(
          Object.assign(new Error("Request origin is not allowed."), {
            statusCode: 403,
          }),
        );
      },
      credentials: false,
      methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(requestSecurity);
  app.use(express.json({ limit: "2mb", inflate: false, strict: true }));
  app.use(validateRequestInput);
  app.use(protectResponse);
  const options = { storeFactory };
  const globalLimit = makeLimiter("global:", 60000, 600, options);
  const loginLimit = makeLimiter("login:", 15 * 60000, 15, {
    ...options,
    credentials: true,
  });
  const accountLimit = makeLimiter("login-account:", 15 * 60000, 30, {
    ...options,
    credentials: true,
    accountOnly: true,
  });
  const refreshLimit = makeLimiter("refresh:", 60000, 120, options);
  const classJoinLimit = makeLimiter("class-join:", 15 * 60000, 15, options);
  const registrationLimit = makeLimiter("register:", 3600000, 40, options);
  const generationLimit = makeLimiter("generation:", 3600000, 5, options);
  const uploadLimit = makeLimiter("uploads:", 3600000, 5, options);
  app.use("/api/v1", globalLimit);
  app.use("/api/v1", (req, res, next) =>
    /\/login$/.test(req.path)
      ? loginLimit(req, res, (error) =>
          error ? next(error) : accountLimit(req, res, next),
        )
      : next(),
  );
  app.use("/api/v1/auth/refresh-token", refreshLimit);
  app.use("/api/v1", (req, res, next) =>
    req.method === "POST" && /^\/(students|teachers|parents)\/?$/.test(req.path)
      ? registrationLimit(req, res, next)
      : next(),
  );
  app.use("/api/v1", accessGuard);
  app.use("/api/v1/teacher-groups/join", classJoinLimit);
  app.use("/api/v1", (req, res, next) =>
    req.method === "POST" && /^\/lesson-generations\/?$/.test(req.path)
      ? generationLimit(req, res, next)
      : next(),
  );
  app.use("/api/v1", (req, res, next) =>
    req.path.endsWith("/profile-picture")
      ? uploadLimit(req, res, next)
      : next(),
  );
  const imagesOnly = (req, res, next) =>
    /\.(png|jpe?g|webp)$/i.test(req.path) ? next() : res.status(404).end();
  app.use(
    "/uploads",
    imagesOnly,
    express.static("uploads", {
      dotfiles: "deny",
      index: false,
      setHeaders(res) {
        res.setHeader("Content-Security-Policy", "sandbox; default-src 'none'");
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    }),
  );
  app.use(
    "/uploaded",
    imagesOnly,
    express.static("uploaded", { dotfiles: "deny", index: false }),
  );
  const routes = {
    auth: authRoutes,
    users: usersRoutes,
    parents: parentsRoutes,
    students: studentsRoutes,
    teachers: teachersRoutes,
    admins: adminsRoutes,
    courses: coursesRoutes,
    modules: modulesRoutes,
    lessons: lessonsRoutes,
    "lesson-generations": generationRoutes,
    assessments: assessmentsRoutes,
    quizzes: quizzesRoutes,
    achievements: achievementsRoutes,
    posts: postsRoutes,
    messages: messagesRoutes,
    "teacher-groups": groupsRoutes,
  };
  for (const [prefix, router] of Object.entries(routes))
    app.use(`/api/v1/${prefix}`, router);
  app.get("/api/v1/health", (req, res) => res.json({ status: "healthy" }));
  app.use((req, res) => res.status(404).json({ error: "Resource not found." }));
  app.use(errorHandler);
  return app;
}
