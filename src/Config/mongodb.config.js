import dotenv from 'dotenv';
dotenv.config();

export default {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/alma_academy',
  options: {
    autoIndex: true
  }
};
