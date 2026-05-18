const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [{ type: String, required: true }],
  calories: { type: Number, required: true },
  protein: { type: String, required: true },
});

const dietPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    goal: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    totalCalories: {
      type: Number,
      required: true,
    },
    meals: {
      breakfast: { type: mealSchema, required: true },
      midMorning: { type: mealSchema, required: true },
      lunch: { type: mealSchema, required: true },
      evening: { type: mealSchema, required: true },
      dinner: { type: mealSchema, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DietPlan", dietPlanSchema);

