const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "news_feed",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1000, height: 600, crop: "limit" }],
  },
});

// Create multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 10000000 }, // 10MB limit
});

module.exports = upload;
