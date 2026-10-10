import { MongoClient } from "mongodb";
import { mongoConfig } from "../Config/mongodb.config.js";

const client = new MongoClient(mongoConfig.uri);
export const db = client.db(mongoConfig.dbName);

export const database_connect = async () => {
  try {
    await client.connect();
    console.log("Database connected");
  } catch (error) {
    console.log("DB connection error", error);
  }
};
