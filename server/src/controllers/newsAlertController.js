const { NewsAlert } = require("../models");
const { errorHandler } = require("../utils/errorHandler");

/**
 * Create a new news alert
 * @route POST /api/news-alerts
 * @access Private - Admin only
 */
exports.createNewsAlert = async (req, res) => {
  try {
    // Set the creator of the news alert to the current user
    req.body.createdBy = req.user._id;

    const newsAlert = new NewsAlert(req.body);
    await newsAlert.save();

    return res.status(201).json({
      status: "success",
      data: newsAlert,
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

/**
 * Get all active news alerts
 * @route GET /api/news-alerts
 * @access Public - All authenticated users
 */
exports.getNewsAlerts = async (req, res) => {
  try {
    const query = { isActive: true };

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Don't show expired alerts
    if (!req.query.showExpired) {
      query.$or = [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } },
      ];
    }

    const newsAlerts = await NewsAlert.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name")
      .exec();

    return res.status(200).json({
      status: "success",
      results: newsAlerts.length,
      data: newsAlerts,
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

/**
 * Get a specific news alert by ID
 * @route GET /api/news-alerts/:id
 * @access Public - All authenticated users
 */
exports.getNewsAlertById = async (req, res) => {
  try {
    const newsAlert = await NewsAlert.findById(req.params.id)
      .populate("createdBy", "name")
      .exec();

    if (!newsAlert) {
      return res.status(404).json({
        status: "fail",
        message: "News alert not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: newsAlert,
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

/**
 * Update a news alert
 * @route PUT /api/news-alerts/:id
 * @access Private - Admin only
 */
exports.updateNewsAlert = async (req, res) => {
  try {
    const newsAlert = await NewsAlert.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!newsAlert) {
      return res.status(404).json({
        status: "fail",
        message: "News alert not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: newsAlert,
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

/**
 * Delete a news alert
 * @route DELETE /api/news-alerts/:id
 * @access Private - Admin only
 */
exports.deleteNewsAlert = async (req, res) => {
  try {
    const newsAlert = await NewsAlert.findByIdAndDelete(req.params.id);

    if (!newsAlert) {
      return res.status(404).json({
        status: "fail",
        message: "News alert not found",
      });
    }

    return res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

/**
 * Toggle the active status of a news alert
 * @route PATCH /api/news-alerts/:id/toggle-active
 * @access Private - Admin only
 */
exports.toggleActiveStatus = async (req, res) => {
  try {
    const newsAlert = await NewsAlert.findById(req.params.id);

    if (!newsAlert) {
      return res.status(404).json({
        status: "fail",
        message: "News alert not found",
      });
    }

    newsAlert.isActive = !newsAlert.isActive;
    await newsAlert.save();

    return res.status(200).json({
      status: "success",
      data: newsAlert,
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};
