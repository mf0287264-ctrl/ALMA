import { randomBytes } from "node:crypto";
import { database_connect, db } from "../DB/db.connection.js";
import { hashPassword } from "../Utils/argon2.util.js";
import { createAdminSchema } from "../Validation/Admin.validation.js";

// Provision the first administrator from environment variables, never command-line passwords.
try {
  const data = createAdminSchema.parse({
    email: process.env.BOOTSTRAP_ADMIN_EMAIL,
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
    first_name: process.env.BOOTSTRAP_ADMIN_FIRST_NAME || "Platform",
    last_name: process.env.BOOTSTRAP_ADMIN_LAST_NAME || "Administrator",
  });
  await database_connect();
  if (await db.collection("admins").findOne({}))
    throw new Error(
      "An administrator already exists. Use an authenticated administrator account to create additional administrators.",
    );
  const password_hash = await hashPassword(data.password);
  delete data.password;
  await db
    .collection("admins")
    .insertOne({
      ...data,
      admin_code: `ADM-${randomBytes(12).toString("hex")}`,
      role: "admin",
      permissions: ["all"],
      is_active: true,
      auth_version: 0,
      password_hash,
      created_at: new Date(),
      updated_at: new Date(),
    });
  console.log(
    "Initial administrator created. Sign in through the regular login form.",
  );
  process.exit(0);
} catch (error) {
  console.error(
    error.name === "ZodError"
      ? "Provide a valid administrator email and a password of 12–128 characters through BOOTSTRAP_ADMIN_* environment variables."
      : error.message,
  );
  process.exit(1);
}
