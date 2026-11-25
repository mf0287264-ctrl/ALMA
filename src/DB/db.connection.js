import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { mongoConfig } from "../Config/mongodb.config.js";

const client = new MongoClient(mongoConfig.uri, { serverSelectionTimeoutMS: 10000 });
export const db = client.db(mongoConfig.dbName);

export const database_connect = async () => {
  try {
    await client.connect();

    await mongoose.connect(mongoConfig.uri, { dbName: mongoConfig.dbName, serverSelectionTimeoutMS: 10000 });
    console.log("Database connected");

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
  } catch (error) {
    throw new Error('Database connection failed. The API was not started.');
  }
};
