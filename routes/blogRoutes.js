const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const blogController = require("../controllers/blogController");

const router = express.Router();

router.get("/saved/me", auth, blogController.getSavedPosts);
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);
router.post("/", auth, upload.single("coverImage"), blogController.createBlog);
router.put("/:id", auth, upload.single("coverImage"), blogController.updateBlog);
router.delete("/:id", auth, blogController.deleteBlog);
router.post("/:id/like", auth, blogController.likeBlog);
router.post("/:id/save", auth, blogController.saveBlog);
router.post("/:id/comment", auth, blogController.addComment);
router.delete("/:postId/comment/:commentId", auth, blogController.deleteComment);

module.exports = router;
