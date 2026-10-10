const mongoose = require('mongoose');
const mongoConfig = require('../Config/mongodb.config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoConfig.uri, mongoConfig.options);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
