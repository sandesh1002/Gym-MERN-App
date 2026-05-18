const express = require("express");
const router = express.Router();

const { getDietPlans, getDietPlanById, createDietPlan, updateDietPlan, deleteDietPlan } = require("../controllers/dietPlanController");

router.get("/", getDietPlans);
router.get("/:id", getDietPlanById);

router.post('/', createDietPlan);
router.put('/:id', updateDietPlan);
router.delete('/:id', deleteDietPlan);

module.exports = router;
