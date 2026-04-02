const Blog = require("../models/Blog");
const Notification = require("../models/Notification");
const User = require("../models/User");

// GET ALL BLOGS
exports.getAllBlogs = async (req, res) => {
  try {
    const posts = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// GET SINGLE BLOG
exports.getBlogById = async (req, res) => {
  try {
    const post = await Blog.findOne({
  _id: req.params.id,
  isPublished: true,
});
    if (!post) return res.status(404).json({ message: "Blog not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blog" });
  }
};

// GET BLOGS (ROLE BASED)
exports.getBlogs = async (req, res) => {
  try {
    let blogs;

    if (req.user.role === "admin") {
      blogs = await Blog.find().sort({ createdAt: -1 });
    } else {
      blogs = await Blog.find({ authorId: req.user.id }).sort({ createdAt: -1 });
    }

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching blogs" });
  }
};

// CREATE BLOG
exports.createBlog = async (req, res) => {
  try {
    const { title, content, topic, scheduledAt } = req.body;

    console.log("📨 Received scheduledAt from frontend:", scheduledAt);
    console.log("📨 Type:", typeof scheduledAt);

    // 🔥 Decide publish type & validate scheduledAt
    let isPublished = true;
    let parsedScheduledAt = null;

    if (scheduledAt) {
      // Convert string to Date object
      const scheduledDate = new Date(scheduledAt);
      console.log("✅ Parsed scheduledDate:", scheduledDate.toString());
      console.log("✅ ISO String:", scheduledDate.toISOString());
      
      // Validate date
      if (isNaN(scheduledDate.getTime())) {
        console.error("❌ Invalid date received:", scheduledAt);
        return res.status(400).json({ message: "Invalid scheduled date. Please provide a valid date and time." });
      }
      
      const now = new Date();
      console.log("🕐 Current time:", now.toString());
      console.log("🕐 Scheduled time:", scheduledDate.toString());
      console.log("🕐 Scheduled > Now?", scheduledDate > now);
      
      if (scheduledDate <= now) {
        return res.status(400).json({ message: "Scheduled date must be in the future." });
      }
      
      parsedScheduledAt = scheduledDate;
      isPublished = false;
    }

    const newBlog = new Blog({
      title,
      content,
      topic,
      author: req.user.name,
      authorId: req.user.id,
      coverImage: req.file ? req.file.path : "",
      scheduledAt: parsedScheduledAt,
      isPublished,
    });

    await newBlog.save();

    // 🔔 Notify admins
    const admins = await User.find({ role: "admin" });

    for (let admin of admins) {
      await Notification.create({
        user: admin._id,
        sender: req.user.id,
        message: `${req.user.name} created a new blog`,
        type: "blog",
        blog: newBlog._id,
      });
    }

    res.json(newBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE BLOG
exports.updateBlog = async (req, res) => {
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

    // ✅ Handle scheduled date updates
    if (req.body.scheduledAt) {
      const scheduledDate = new Date(req.body.scheduledAt);
      
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ message: "Invalid scheduled date." });
      }
      
      const now = new Date();
      if (scheduledDate <= now) {
        return res.status(400).json({ message: "Scheduled date must be in the future." });
      }
      
      blog.scheduledAt = scheduledDate;
      blog.isPublished = false;
    } else if (req.body.scheduledAt === "") {
      // Clear schedule if empty string is passed
      blog.scheduledAt = null;
      blog.isPublished = true;
    }

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
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    const isOwner = String(blog.authorId) === String(req.user.id);

    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await blog.deleteOne();

    // 🔔 Optional: notify owner if admin deletes
    if (req.user.role === "admin") {
      await Notification.create({
        user: blog.authorId,
        message: "Your blog was deleted by admin",
      });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete blog" });
  }
};

// LIKE BLOG
exports.likeBlog = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    const userId = req.user.id;

    const liked = post.likes.some((id) => id.toString() === userId);

    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);

      // 🔔 Notify owner
      if (post.authorId.toString() !== userId) {
        await Notification.create({
          user: post.authorId,
          sender: userId,
          message: `${req.user.username} liked your blog`,
          type: "like",
          blog: post._id,
        });
      }
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ message: "Like failed" });
  }
};

// SAVE/UNSAVE BLOG
exports.saveBlog = async (req, res) => {
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
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

   const savedPosts = await Blog.find({
  saves: { $in: [userId] },
  isPublished: true,
}).sort({ createdAt: -1 });
    res.json(savedPosts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching saved posts" });
  }
};

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);

    post.comments.push({
      user: req.user.id,
      username: req.user.username,
      text: req.body.text,
    });

    await post.save();

    // 🔔 Notify owner
    if (post.authorId.toString() !== req.user.id) {
      await Notification.create({
        user: post.authorId,
        sender: req.user.id,
        message: `${req.user.username} commented on your blog`,
        type: "comment",
        blog: post._id,
      });
    }

    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// DELETE COMMENT
exports.deleteComment = async (req, res) => {
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