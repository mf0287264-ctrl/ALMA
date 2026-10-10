require('dotenv').config();

module.exports = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/alma_academy',
  options: {
    autoIndex: true,
  }
};
