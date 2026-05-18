const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["workout", "weight"],
      required: true,
    },
    workoutName: {
      type: String,
      trim: true,
    },
    exercises: [
      {
        name: { type: String, trim: true },
        sets: { type: Number, default: 0 },
        reps: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
      },
    ],
    duration: {
      type: Number,
      default: 0,
    },
    weightValue: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);

