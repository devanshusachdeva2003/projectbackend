const mongoose = require("mongoose");
const { blogConn } = require("../config/db");

const blogSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    topic: String,
    author: String,

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coverImage: String,

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Blog = blogConn.model("Blog", blogSchema);

module.exports = Blog;
