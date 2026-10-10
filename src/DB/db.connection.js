import mongoose from 'mongoose';
import mongoConfig from '../Config/mongodb.config.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoConfig.uri, mongoConfig.options);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
