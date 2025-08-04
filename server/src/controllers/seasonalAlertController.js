// const { SeasonalAlert } = require("../models");

// // Get all active seasonal alerts
// exports.getActiveAlerts = async (req, res) => {
//   try {
//     const currentDate = new Date();
//     const alerts = await SeasonalAlert.find({
//       validUntil: { $gte: currentDate },
//       isActive: true,
//     });

//     res.status(200).json({
//       success: true,
//       count: alerts.length,
//       data: alerts,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };

// // Get alerts by season
// exports.getAlertsBySeason = async (req, res) => {
//   try {
//     const { season } = req.params;
//     const currentDate = new Date();

//     const alerts = await SeasonalAlert.find({
//       season: season.toLowerCase(),
//       validUntil: { $gte: currentDate },
//       isActive: true,
//     });

//     res.status(200).json({
//       success: true,
//       count: alerts.length,
//       data: alerts,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };

// // Get a single alert
// exports.getAlertById = async (req, res) => {
//   try {
//     const alert = await SeasonalAlert.findById(req.params.id);

//     if (!alert) {
//       return res.status(404).json({
//         success: false,
//         message: "Alert not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: alert,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };

// // Create a new alert
// exports.createAlert = async (req, res) => {
//   try {
//     const alert = await SeasonalAlert.create(req.body);

//     res.status(201).json({
//       success: true,
//       data: alert,
//     });
//   } catch (error) {
//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((val) => val.message);
//       return res.status(400).json({
//         success: false,
//         message: messages,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };

// // Update an alert
// exports.updateAlert = async (req, res) => {
//   try {
//     const alert = await SeasonalAlert.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!alert) {
//       return res.status(404).json({
//         success: false,
//         message: "Alert not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: alert,
//     });
//   } catch (error) {
//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((val) => val.message);
//       return res.status(400).json({
//         success: false,
//         message: messages,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };

// // Delete an alert
// exports.deleteAlert = async (req, res) => {
//   try {
//     const alert = await SeasonalAlert.findByIdAndDelete(req.params.id);

//     if (!alert) {
//       return res.status(404).json({
//         success: false,
//         message: "Alert not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Alert deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };


const { SeasonalAlert } = require("../models");

// Get all alerts (both active and inactive)
exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await SeasonalAlert.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get all active seasonal alerts
exports.getActiveAlerts = async (req, res) => {
  try {
    const currentDate = new Date();
    const alerts = await SeasonalAlert.find({
      validUntil: { $gte: currentDate },
      isActive: true,
    });
    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get alerts by season
exports.getAlertsBySeason = async (req, res) => {
  try {
    const { season } = req.params;
    const currentDate = new Date();
    const alerts = await SeasonalAlert.find({
      season: season.toLowerCase(),
      validUntil: { $gte: currentDate },
      isActive: true,
    });
    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get a single alert
exports.getAlertById = async (req, res) => {
  try {
    const alert = await SeasonalAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }
    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Create a new alert
exports.createAlert = async (req, res) => {
  try {
    const alert = await SeasonalAlert.create(req.body);
    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update an alert
exports.updateAlert = async (req, res) => {
  try {
    const alert = await SeasonalAlert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }
    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete an alert
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await SeasonalAlert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};