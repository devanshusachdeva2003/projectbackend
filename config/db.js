const mongoose = require("mongoose");

const userConn = mongoose.createConnection("mongodb://127.0.0.1:27017/contact");
const blogConn = mongoose.createConnection("mongodb://127.0.0.1:27017/blogpost");

module.exports = { userConn, blogConn };
