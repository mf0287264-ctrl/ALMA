import dotenv from "dotenv";
dotenv.config();

export const mongoConfig = {
  uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
  dbName: process.env.DB_NAME || "ALMA"
};

export default mongoConfig;
