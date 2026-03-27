const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ✅ Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// ✅ multer with cloud storage
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // optional (5MB limit)
  },
});

module.exports = upload;