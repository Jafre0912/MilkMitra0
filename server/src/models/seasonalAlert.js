const mongoose = require("mongoose");

const seasonalAlertSchema = new mongoose.Schema(
  {
    season: {
      type: String,
      required: true,
      enum: ["spring", "summer", "fall", "winter"],
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

const SeasonalAlert = mongoose.model("SeasonalAlert", seasonalAlertSchema);
module.exports = SeasonalAlert;