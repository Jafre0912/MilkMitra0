const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const Cattle = require("../models/cattleSchema");
const MilkProduction = require("../models/milkProduction");
const MPPMilkCollection = require("../models/MPPMilkCollection");
const { protect, restrictTo } = require("../middlewares/auth");

// Protect all admin routes - require authentication
router.use(protect);
// Restrict all routes to admin role
router.use(restrictTo("admin"));

// Get all users
router.get("/users", async (req, res) => {
  try {
    console.log("Fetching all users");
    const users = await User.find()
      .select("-password -__v -tokenVersion")
      .sort({ createdAt: -1 });

    console.log(`Found ${users.length} users`);

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching users",
      error: error.message,
    });
  }
});

// Get all farmers
router.get("/farmers", async (req, res) => {
  try {
    console.log("Fetching all farmers");
    const farmers = await User.find({ role: "farmer" })
      .select("-password -__v -tokenVersion")
      .sort({ createdAt: -1 });

    // Add farmerId field to each farmer (same as their _id)
    const farmersWithId = farmers.map((farmer) => {
      const farmerObj = farmer.toObject();
      farmerObj.farmerId = farmerObj._id;
      return farmerObj;
    });

    console.log(`Found ${farmers.length} farmers`);

    res.status(200).json({
      status: "success",
      results: farmers.length,
      data: farmersWithId,
    });
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching farmers",
      error: error.message,
    });
  }
});

// Get dashboard statistics
router.get("/dashboard-stats", async (req, res) => {
  try {
    // Get user stats
    const totalUsers = await User.countDocuments();

    // Get cattle stats
    const totalCattle = await Cattle.countDocuments();

    // Get milk production stats
    const milkStats = await MilkProduction.aggregate([
      {
        $group: {
          _id: null,
          totalProduction: { $sum: "$quantity" },
        },
      },
    ]);

    const totalProduction =
      milkStats.length > 0 ? milkStats[0].totalProduction : 0;

    // Get recent users (limit to 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password -__v -tokenVersion");

    res.status(200).json({
      status: "success",
      data: {
        totalUsers,
        totalCattle,
        totalProduction,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting dashboard stats",
      error: error.message,
    });
  }
});

// Get a single user
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -__v -tokenVersion"
    );

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // If the user is a farmer, include the farmerId (which is the user ID for farmers)
    const userData = user.toObject();
    if (userData.role === "farmer") {
      userData.farmerId = userData._id;
    }

    res.status(200).json({
      status: "success",
      data: userData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching user",
      error: error.message,
    });
  }
});

// Update a user
router.put("/users/:id", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Update user
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(req.params.id).select(
      "-password -__v -tokenVersion"
    );

    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating user",
      error: error.message,
    });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting user",
      error: error.message,
    });
  }
});

// Get milk transactions by farmer
router.get("/farmers/:farmerId/milk-transactions", async (req, res) => {
  try {
    // Extract user ID from authenticated request
    const userId = req.user._id;

    // Verify user is admin (double-check even though middleware should handle this)
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    const { farmerId } = req.params;
    const { startDate, endDate } = req.query;

    // Build filter object - handle both numeric and string IDs
    // Try to parse as number first, if it fails or is NaN, use the string
    let farmerIdForFilter;
    try {
      const numId = parseInt(farmerId);
      farmerIdForFilter = isNaN(numId) ? farmerId : numId;
    } catch (e) {
      farmerIdForFilter = farmerId;
    }

    console.log(
      `Using farmerId filter: ${farmerIdForFilter} (type: ${typeof farmerIdForFilter})`
    );
    const filter = { farmerId: farmerIdForFilter };

    // Date range filter
    if (startDate || endDate) {
      filter.collectionDate = {};
      if (startDate) filter.collectionDate.$gte = new Date(startDate);
      if (endDate) filter.collectionDate.$lte = new Date(endDate);
    }

    // Get farmer transactions
    const transactions = await MPPMilkCollection.find(filter)
      .sort({ collectionDate: -1 })
      .lean();

    // Get summary stats
    const stats = await MPPMilkCollection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$totalAmount" },
          avgFat: { $avg: "$fat" },
          avgSnf: { $avg: "$snf" },
          recordCount: { $sum: 1 },
        },
      },
    ]);

    console.log(
      `Admin ${userId} requested transactions for farmer ${farmerId}, found ${transactions.length} records`
    );

    res.status(200).json({
      status: "success",
      data: {
        transactions,
        stats:
          stats.length > 0
            ? stats[0]
            : {
                totalQuantity: 0,
                totalAmount: 0,
                avgFat: 0,
                avgSnf: 0,
                recordCount: 0,
              },
      },
    });
  } catch (error) {
    console.error("Error fetching farmer milk transactions:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching milk transactions",
      error: error.message,
    });
  }
});

// Save settings
router.post("/settings/:type", (req, res) => {
  // This would typically save to a database, but for now just return success
  const { type } = req.params;

  res.status(200).json({
    status: "success",
    message: `${type} settings saved successfully`,
    data: req.body,
  });
});

// Create backup endpoint
router.post("/backup/create", (req, res) => {
  // This would typically trigger a database backup process
  res.status(200).json({
    status: "success",
    message: "Backup process initiated",
    data: {
      backupId: `backup_${Date.now()}`,
      timestamp: new Date(),
    },
  });
});

module.exports = router;
