const mongoose = require("mongoose");

const newsAlertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["industry_trend", "disease_outbreak", "seasonal_risk", "general"],
      default: "general",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for faster querying
newsAlertSchema.index({ category: 1, isActive: 1 });
newsAlertSchema.index({ createdAt: -1 });

const NewsAlert = mongoose.model("NewsAlert", newsAlertSchema);

module.exports = NewsAlert;
