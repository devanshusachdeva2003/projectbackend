const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", auth, isAdmin, userController.getAllUsers);
router.post("/", auth, isAdmin, userController.createUser);
router.delete("/:id", auth, isAdmin, userController.deleteUser);
router.put("/:id/role", auth, isAdmin, userController.changeUserRole);

module.exports = router;
