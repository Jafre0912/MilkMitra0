const express = require("express");
const router = express.Router();
const {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getNewsByTag,
  uploadNewsPhoto
} = require("../controllers/newsFeedController");

// Get all news and create new news
router.route("/")
  .get(getAllNews)
  .post(uploadNewsPhoto, createNews);

// Get news by tag
router.route("/tag/:tag")
  .get(getNewsByTag);

// Get, update and delete news by ID
router.route("/:id")
  .get(getNewsById)
  .put(uploadNewsPhoto, updateNews)
  .delete(deleteNews);

module.exports = router;