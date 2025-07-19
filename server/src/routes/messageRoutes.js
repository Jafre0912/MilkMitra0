// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const { getUsersList, getMessages, sendMessage } = require("../controllers/messageController");

router.get("/users", protect, getUsersList);
router.get("/:id", protect, getMessages);
router.post("/send/:id", protect, sendMessage);

module.exports = router;
