import Blog from "../models/Blog.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// GET ALL BLOGS
export const getAllBlogs = async (req, res) => {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// GET SINGLE BLOG
export const getBlogById = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Blog not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blog" });
  }
};

// GET BLOGS (ROLE BASED)
export const getBlogs = async (req, res) => {
  try {
    let blogs;

    if (req.user.role === "admin") {
      blogs = await Blog.find().populate("author", "username");
    } else {
      blogs = await Blog.find({ author: req.user.id });
    }

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching blogs" });
  }
};

// CREATE BLOG
export const createBlog = async (req, res) => {
  try {
    const { title, content, topic } = req.body;

    const newBlog = new Blog({
      title,
      content,
      topic,
      author: req.user.name,
      authorId: req.user.id,
      coverImage: req.file ? req.file.path : "", // ✅ Cloudinary
    });

    await newBlog.save();
    res.json(newBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE BLOG
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    const isOwner = String(blog.authorId) === String(req.user.id);

    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Not allowed" });
    }

    blog.title = req.body.title;
    blog.content = req.body.content;
    blog.topic = req.body.topic;

    // ✅ FIXED (Cloudinary)
    if (req.file) {
      blog.coverImage = req.file.path;
    }

    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Failed to update blog" });
  }
};

// DELETE BLOG
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    const isOwner = String(blog.authorId) === String(req.user.id);

    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await blog.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete blog" });
  }
};

// LIKE BLOG
export const likeBlog = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    const userId = req.user.id;

    const liked = post.likes.some((id) => id.toString() === userId);

    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ message: "Like failed" });
  }
};

// SAVE/UNSAVE BLOG
export const saveBlog = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;

    const alreadySaved = post.saves.some((id) => id.toString() === userId);

    if (alreadySaved) {
      post.saves = post.saves.filter((id) => id.toString() !== userId);
    } else {
      post.saves.push(userId);
    }

    await post.save();

    res.json({
      message: alreadySaved ? "Post unsaved" : "Post saved",
      saves: post.saves,
    });
  } catch (err) {
    res.status(500).json({ message: "Save failed" });
  }
};

// GET SAVED POSTS
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedPosts = await Blog.find({
      saves: { $in: [userId] },
    }).sort({ createdAt: -1 });

    res.json(savedPosts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching saved posts" });
  }
};

// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);

    post.comments.push({
      user: req.user.id,
      username: req.user.username,
      text: req.body.text,
    });

    await post.save();
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);

    comment.deleteOne();
    await post.save();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
};