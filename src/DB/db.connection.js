import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { mongoConfig } from "../Config/mongodb.config.js";

const client = new MongoClient(mongoConfig.uri);
export const db = client.db(mongoConfig.dbName);

export const database_connect = async () => {
  try {
    await client.connect();
    await mongoose.connect(mongoConfig.uri, { dbName: mongoConfig.dbName });
    console.log("Database connected (MongoDB Client & Mongoose)");

    // Indexes
    await db.collection("admins").createIndex({ email: 1 }, { unique: true });
    await db.collection("students").createIndex({ email: 1 }, { unique: true });
    await db.collection("students").createIndex({ student_code: 1 }, { unique: true });
    await db.collection("teachers").createIndex({ email: 1 }, { unique: true });
    await db.collection("lesson_generations").createIndex({ job_id: 1 }, { unique: true });
    await db.collection("student_lesson_sessions").createIndex({ session_id: 1 }, { unique: true });
    await db.collection("student_lesson_sessions").createIndex({ student_id: 1 });
    await db.collection("student_lesson_sessions").createIndex({ lesson_id: 1 });
  } catch (error) {
    console.log("DB connection error", error);
  }
};

export default { db, database_connect };
