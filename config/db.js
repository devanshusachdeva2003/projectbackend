const mongoose = require("mongoose");

const mongoOptions = {
  maxPoolSize: 3, // Reduced for Render
  minPoolSize: 1,
  maxIdleTimeMS: 45000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  family: 4, // Use IPv4
};

const userConn = mongoose.connect(process.env.MONGO_URI, mongoOptions);
const blogConn = mongoose.connect(process.env.MONGO_URI, mongoOptions);

module.exports = { userConn, blogConn };
