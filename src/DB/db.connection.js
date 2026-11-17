import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { mongoConfig } from "../Config/mongodb.config.js";

const client = new MongoClient(mongoConfig.uri);
export const db = client.db(mongoConfig.dbName);

export const database_connect = async () => {
  try {
    await client.connect();
    await mongoose.connect(mongoConfig.uri, { dbName: mongoConfig.dbName });
    console.log("Database connected");

    await db.collection("admins").createIndex({ email: 1 }, { unique: true });
    await db.collection("students").createIndex({ email: 1 }, { unique: true });
    await db.collection("teachers").createIndex({ email: 1 }, { unique: true });
    await db.collection("parents").createIndex({ email: 1 }, { unique: true });
    await db.collection("parent_messages").createIndex({ from_parent_id: 1 });
    await db.collection("parent_messages").createIndex({ to_teacher_id: 1 });
    await db.collection("posts").createIndex({ author_id: 1 });
    await db.collection("posts").createIndex({ created_at: -1 });
  } catch (error) {
    console.log("DB connection error", error);
  }
};
