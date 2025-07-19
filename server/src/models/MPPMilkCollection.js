const mongoose = require("mongoose");

const milkCollectionSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collectionDate: {
      type: Date,
      required: true,
    },
    shift: {
      type: String,
      enum: ["morning", "evening"],
      required: true,
    },
    milkType: {
      type: String,
      enum: ["C", "B", "M"], // C = Cow, B = Buffalo, M = Mixed
      required: true,
    },
    fat: {
      type: Number,
      required: true,
      min: 0,
    },
    snf: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
milkCollectionSchema.index({ farmerId: 1 });
milkCollectionSchema.index({ collectionDate: -1 });
milkCollectionSchema.index({ farmerId: 1, collectionDate: -1 });

const MPPMilkCollection = mongoose.model(
  "MPPMilkCollection",
  milkCollectionSchema
);

module.exports = MPPMilkCollection;
