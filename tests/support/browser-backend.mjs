import { randomBytes } from "node:crypto";
import { MongoClient } from "mongodb";
import { writeFile, rm, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const uri = process.env.ALMA_E2E_MONGODB_URI || "mongodb://127.0.0.1:27017";
const destination = new URL(uri);
if (destination.protocol !== "mongodb:" || !["localhost", "127.0.0.1", "[::1]"].includes(destination.hostname))
  throw new Error("Browser tests require a local MongoDB instance.");

const database = `ALMA_e2e_${randomBytes(8).toString("hex")}`;
const scratch = await mkdtemp(join(tmpdir(), "alma-e2e-uploads-"));
process.chdir(scratch);
Object.assign(process.env, {
  MONGODB_URI: uri,
  DB_NAME: database,
  NODE_ENV: "test",
  JWT_SECRET: randomBytes(32).toString("hex"),
  JWT_REFRESH_SECRET: randomBytes(32).toString("hex"),
});

const cleanupClient = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
await cleanupClient.connect();
const { database_connect, db } = await import("../../src/DB/db.connection.js");
const { createApp } = await import("../../src/app.js");
const { PYTHON_COURSE, PYTHON_LESSON_PLANS, toLessonDocument } = await import("../../src/Seed/lessonDocuments.js");
await database_connect();
const { default: auth } = await import("../../src/Module/Auth/Auth.service.js");
const { hashPassword } = await import("../../src/Utils/argon2.util.js");
const administrator = await db.collection("admins").insertOne({
  email: "browser-administrator@example.test",
  first_name: "Browser",
  last_name: "Administrator",
  role: "admin",
  admin_code: "ADM-BROWSER-TEST",
  auth_version: 0,
  is_active: true,
  password_hash: await hashPassword(randomBytes(24).toString("hex")),
});
const tokens = await auth.generateTokenPair({ id: String(administrator.insertedId), role: "admin", auth_version: 0 });
const fixturePath = process.env.ALMA_E2E_FIXTURE_PATH;
if (!fixturePath) throw new Error("Run browser tests through the Playwright configuration.");
await writeFile(fixturePath, JSON.stringify({ administratorAccessToken: tokens.accessToken }), { mode: 0o600 });
const course = await db.collection("courses").insertOne({ ...PYTHON_COURSE });
for (const plan of PYTHON_LESSON_PLANS) {
  const module = await db.collection("modules").insertOne({
    course_id: String(course.insertedId),
    title: plan.module.title,
    description: plan.module.description,
    order: plan.module.order,
    status: "published",
  });
  await db.collection("lessons").insertOne(toLessonDocument(plan, String(course.insertedId), String(module.insertedId)));
}
const server = createApp().listen(5100, "127.0.0.1", () => console.log("Isolated browser-test API ready."));
let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  server.closeAllConnections();
  server.close();
  await cleanupClient.db(database).dropDatabase();
  await cleanupClient.close();
  await rm(fixturePath, { force: true });
  await rm(scratch, { recursive: true, force: true });
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
