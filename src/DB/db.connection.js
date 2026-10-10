import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "ALMA";

const client = new MongoClient(mongoUri);
export const db = client.db(dbName);

export const database_connect = async () => {
  try {
    await client.connect();
    console.log("Database connected");
  } catch (error) {
    console.log("DB connection error", error);
  }
};
