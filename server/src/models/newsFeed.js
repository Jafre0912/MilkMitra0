const mongoose = require("mongoose");

const newsFeedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    photo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

const NewsFeed = mongoose.model("NewsFeed", newsFeedSchema);
module.exports = NewsFeed;