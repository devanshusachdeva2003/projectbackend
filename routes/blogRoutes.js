const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const blogController = require("../controllers/blogController");

const router = express.Router();

router.get("/saved/me", auth, blogController.getSavedPosts);
router.get("/me", auth, blogController.getBlogs);
router.get("/", blogController.getAllBlogs);
router.get("/:id([0-9a-fA-F]{24})", blogController.getBlogById);
router.post("/", auth, upload.single("coverImage"), blogController.createBlog);
router.put("/:id([0-9a-fA-F]{24})", auth, upload.single("coverImage"), blogController.updateBlog);
router.delete("/:id([0-9a-fA-F]{24})", auth, blogController.deleteBlog);
router.post("/:id([0-9a-fA-F]{24})/like", auth, blogController.likeBlog);
router.post("/:id([0-9a-fA-F]{24})/save", auth, blogController.saveBlog);
router.post("/:id([0-9a-fA-F]{24})/comment", auth, blogController.addComment);
router.delete("/:postId([0-9a-fA-F]{24})/comment/:commentId", auth, blogController.deleteComment);

module.exports = router;
