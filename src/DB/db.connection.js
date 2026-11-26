import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { mongoConfig } from "../Config/mongodb.config.js";

const client = new MongoClient(mongoConfig.uri, { serverSelectionTimeoutMS: 10000 });
export const db = client.db(mongoConfig.dbName);

export const database_connect = async () => {
  let operation = "connecting";
  try {
    await client.connect();

    await mongoose.connect(mongoConfig.uri, { dbName: mongoConfig.dbName, serverSelectionTimeoutMS: 10000 });

    operation = "creating required indexes";
    await db.collection("admins").createIndex({ email: 1 }, { unique: true });
    await db.collection("students").createIndex({ email: 1 }, { unique: true });
    await db.collection("students").createIndex({ student_code: 1 }, { unique: true, sparse: true });
    await db.collection("teachers").createIndex({ email: 1 }, { unique: true });
    await db.collection("parents").createIndex({ email: 1 }, { unique: true });
    await db.collection("parent_messages").createIndex({ from_parent_id: 1 });
    await db.collection("parent_messages").createIndex({ to_teacher_id: 1 });
    await db.collection("posts").createIndex({ author_id: 1 });
    await db.collection("posts").createIndex({ created_at: -1 });
    await db.collection("auth_sessions").createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
    await db.collection("auth_sessions").createIndex({ user_id: 1, revoked: 1 });
    await db.collection("rate_limits").createIndex({ resetTime: 1 }, { expireAfterSeconds: 0 });
    console.log("Database connected");
  } catch (error) {
    // Driver error messages can include connection details or document values.
    const codes = [error?.name, error?.code, error?.cause?.code, error?.cause?.cause?.code]
      .filter((code) => typeof code === "number" || (typeof code === "string" && /^\w+$/.test(code)));
    const details = codes.length ? ` (${[...new Set(codes)].join(", ")})` : "";
    throw new Error(`MongoDB startup failed while ${operation}${details}. The API was not started.`);
  }
};
