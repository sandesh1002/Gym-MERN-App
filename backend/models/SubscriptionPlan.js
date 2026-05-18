const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a plan name"],
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    duration: {
      type: Number,
      required: [true, "Please provide duration in months"],
      min: 1,
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    features: [
      {
        type: String,
      },
    ],
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: ["basic", "standard", "premium", "vip"],
      default: "standard",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
