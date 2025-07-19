const express = require("express");
const router = express.Router();
const {
  createNewsAlert,
  getNewsAlerts,
  getNewsAlertById,
  updateNewsAlert,
  deleteNewsAlert,
  toggleActiveStatus,
} = require("../controllers/newsAlertController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Debug endpoint that doesn't require authentication
router.get("/debug", async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "News alerts API is working",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Debug endpoint error",
      error: error.message,
    });
  }
});

// Public routes - making GET endpoints accessible without authentication for testing
router.get("/", getNewsAlerts);
router.get("/:id", getNewsAlertById);

// Routes that require authentication
router.use(protect);

// Admin-only routes
router.post("/", restrictTo("admin"), createNewsAlert);
router.put("/:id", restrictTo("admin"), updateNewsAlert);
router.delete("/:id", restrictTo("admin"), deleteNewsAlert);
router.patch("/:id/toggle-active", restrictTo("admin"), toggleActiveStatus);

module.exports = router;
