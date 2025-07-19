const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const { Cattle, Transaction } = require("../models");
const MilkProduction = require("../models/milkProduction");
const mongoose = require("mongoose");

// Apply auth protection to all routes
router.use(protect);

// Get dashboard statistics for a regular user
router.get("/stats", async (req, res) => {
  try {
    // Check if user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated or invalid user ID",
      });
    }

    console.log(
      "Fetching dashboard data for user:",
      req.user.name,
      req.user.id
    );

    const userId = req.user.id;

    // Get cattle stats specific to this user
    const cattleStatsPromise = Cattle.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          totalCattle: { $sum: 1 },
          activeCattle: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          healthyCattle: {
            $sum: {
              $cond: [{ $eq: ["$healthStatus.status", "healthy"] }, 1, 0],
            },
          },
          sickCattle: {
            $sum: { $cond: [{ $eq: ["$healthStatus.status", "sick"] }, 1, 0] },
          },
          quarantinedCattle: {
            $sum: {
              $cond: [{ $eq: ["$healthStatus.status", "quarantined"] }, 1, 0],
            },
          },
          pregnantCattle: {
            $sum: {
              $cond: [{ $eq: ["$healthStatus.status", "pregnant"] }, 1, 0],
            },
          },
        },
      },
      { $project: { _id: 0 } },
    ]);

    // Get today's milk production
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's milk production
    const todayMilkPromise = MilkProduction.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          todayProduction: { $sum: "$totalAmount" },
        },
      },
      { $project: { _id: 0, todayProduction: 1 } },
    ]);

    // Get average milk production data
    const milkProductionPromise = MilkProduction.aggregate([
      {
        $match: {
          // Consider all milk production records for this farm, not just for specific cattle
        },
      },
      {
        $group: {
          _id: null,
          totalProduction: { $sum: "$totalAmount" },
          avgProduction: { $avg: "$totalAmount" },
          recordCount: { $sum: 1 },
        },
      },
      { $project: { _id: 0 } },
    ]);

    // Get milk production trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const milkTrendPromise = MilkProduction.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo, $lte: tomorrow },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalProduction: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalProduction: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Get finance data for this user
    const financePromise = Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
          transactionCount: { $sum: 1 },
        },
      },
      { $project: { _id: 0 } },
    ]);

    // Get recent health alerts (sick cattle)
    const healthAlertsPromise = Cattle.find({
      createdBy: userId,
      "healthStatus.status": "sick",
    })
      .sort({ "healthStatus.updatedAt": -1 })
      .limit(5)
      .select("name tagId breed gender healthStatus");

    // Wait for all promises to resolve
    const [
      cattleStats,
      todayMilkStats,
      milkProductionStats,
      milkTrend,
      financeStats,
      healthAlerts,
    ] = await Promise.all([
      cattleStatsPromise,
      todayMilkPromise,
      milkProductionPromise,
      milkTrendPromise,
      financePromise,
      healthAlertsPromise,
    ]).catch((error) => {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Database error while fetching dashboard statistics");
    });

    // Calculate profit/loss
    const profit = financeStats.length
      ? financeStats[0].totalIncome - financeStats[0].totalExpenses
      : 0;

    // Format data
    const dashboardData = {
      cattleStats: cattleStats.length
        ? cattleStats[0]
        : {
            totalCattle: 0,
            activeCattle: 0,
            healthyCattle: 0,
            sickCattle: 0,
            quarantinedCattle: 0,
            pregnantCattle: 0,
          },
      todayMilk: todayMilkStats.length ? todayMilkStats[0].todayProduction : 0,
      milkProduction: milkProductionStats.length
        ? milkProductionStats[0]
        : {
            totalProduction: 0,
            avgProduction: 0,
            recordCount: 0,
          },
      milkTrend: milkTrend || [],
      financeStats: financeStats.length
        ? {
            ...financeStats[0],
            profit,
            profitPercent:
              financeStats[0].totalIncome > 0
                ? ((profit / financeStats[0].totalIncome) * 100).toFixed(1)
                : 0,
          }
        : {
            totalIncome: 0,
            totalExpenses: 0,
            transactionCount: 0,
            profit: 0,
            profitPercent: 0,
          },
      healthAlerts: healthAlerts || [],
    };

    // Log successful data fetch
    console.log("Dashboard data fetched successfully. Sending response.");

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching dashboard statistics",
      message: error.message,
    });
  }
});

module.exports = router;
