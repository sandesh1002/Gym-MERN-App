const DietPlan = require("../models/DietPlan");

// @desc    Get all diet plans
// @route   GET /api/diet-plans
// @access  Public
const getDietPlans = async (req, res) => {
  try {
    const dietPlans = await DietPlan.find();
    res.json(dietPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single diet plan
// @route   GET /api/diet-plans/:id
// @access  Public
const getDietPlanById = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id);
    if (!dietPlan) {
      return res.status(404).json({ message: "Diet plan not found" });
    }
    res.json(dietPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.create(req.body);
    res.status(201).json(dietPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    res.json(dietPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findByIdAndDelete(req.params.id);
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    res.json({ message: 'Diet plan removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDietPlans, getDietPlanById, createDietPlan, updateDietPlan, deleteDietPlan };


