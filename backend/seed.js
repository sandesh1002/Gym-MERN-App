require("dotenv").config();
const mongoose = require("mongoose");
const Exercise = require("./models/Exercise");

const DietPlan = require("./models/DietPlan");
const User = require("./models/User");
const SubscriptionPlan = require("./models/SubscriptionPlan");
const connectDB = require("./config/db");


const exercises = [
  {
    name: "Push-ups",
    category: "Chest",
    description: "Classic bodyweight exercise for chest, shoulders, and triceps",
    videoUrl: "https://www.youtube.com/embed/IODxDxX7oi4",
    sets: "3-4",
    reps: "10-15",
    difficulty: "Beginner",
  },
  {
    name: "Squats",
    category: "Legs",
    description: "Fundamental lower body exercise targeting quads, glutes, and hamstrings",
    videoUrl: "https://www.youtube.com/embed/ultWZbUMPL8",
    sets: "3-4",
    reps: "12-15",
    difficulty: "Beginner",
  },
  {
    name: "Deadlift",
    category: "Back",
    description: "Compound exercise for overall strength and muscle development",
    videoUrl: "https://www.youtube.com/embed/r4MzxtBKyNE",
    sets: "3-4",
    reps: "8-10",
    difficulty: "Intermediate",
  },
  {
    name: "Bench Press",
    category: "Chest",
    description: "Essential upper body strength exercise",
    videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
    sets: "3-4",
    reps: "8-12",
    difficulty: "Intermediate",
  },
  {
    name: "Pull-ups",
    category: "Back",
    description: "Excellent bodyweight exercise for back and biceps",
    videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
    sets: "3-4",
    reps: "6-10",
    difficulty: "Advanced",
  },
  {
    name: "Shoulder Press",
    category: "Shoulders",
    description: "Build strong shoulders and upper body",
    videoUrl: "https://www.youtube.com/embed/qEwKCR5JCog",
    sets: "3-4",
    reps: "8-12",
    difficulty: "Intermediate",
  },
  {
    name: "Barbell Bicep Curls",
    category: "Biceps",
    description: "Classic bicep builder for mass and strength",
    videoUrl: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    sets: "3-4",
    reps: "10-15",
    difficulty: "Beginner",
  },
  {
    name: "Hammer Curls",
    category: "Biceps",
    description: "Targets biceps and forearms with neutral grip",
    videoUrl: "https://www.youtube.com/embed/zC3nLlEvin4",
    sets: "3-4",
    reps: "10-12",
    difficulty: "Beginner",
  },
  {
    name: "Concentration Curls",
    category: "Biceps",
    description: "Isolation exercise for peak bicep development",
    videoUrl: "https://www.youtube.com/embed/0AUGkch3tzc",
    sets: "3",
    reps: "10-12 each arm",
    difficulty: "Intermediate",
  },
  {
    name: "Preacher Curls",
    category: "Biceps",
    description: "Strict form bicep exercise for lower bicep",
    videoUrl: "https://www.youtube.com/embed/fIWP-FRFNU0",
    sets: "3-4",
    reps: "8-12",
    difficulty: "Intermediate",
  },
  {
    name: "Tricep Dips",
    category: "Triceps",
    description: "Bodyweight exercise for tricep mass",
    videoUrl: "https://www.youtube.com/embed/6kALZikXxLc",
    sets: "3-4",
    reps: "8-12",
    difficulty: "Intermediate",
  },
  {
    name: "Tricep Pushdowns",
    category: "Triceps",
    description: "Cable exercise for tricep definition",
    videoUrl: "https://www.youtube.com/embed/2-LAMcpzODU",
    sets: "3-4",
    reps: "12-15",
    difficulty: "Beginner",
  },
  {
    name: "Overhead Tricep Extension",
    category: "Triceps",
    description: "Stretch and build the long head of triceps",
    videoUrl: "https://www.youtube.com/embed/YbX7Wd8jQ-Q",
    sets: "3-4",
    reps: "10-12",
    difficulty: "Intermediate",
  },
  {
    name: "Close-Grip Bench Press",
    category: "Triceps",
    description: "Compound movement for tricep strength",
    videoUrl: "https://www.youtube.com/embed/nEF0bv2FW94",
    sets: "3-4",
    reps: "8-10",
    difficulty: "Advanced",
  },
  {
    name: "Skull Crushers",
    category: "Triceps",
    description: "Lying tricep extension for maximum tricep growth",
    videoUrl: "https://www.youtube.com/embed/d_KZxkY_0cM",
    sets: "3-4",
    reps: "10-12",
    difficulty: "Intermediate",
  },
  {
    name: "Planks",
    category: "Core",
    description: "Isometric core strengthening exercise",
    videoUrl: "https://www.youtube.com/embed/ASdvN_XEl_c",
    sets: "3",
    reps: "30-60 sec",
    difficulty: "Beginner",
  },
  {
    name: "Lunges",
    category: "Legs",
    description: "Unilateral leg exercise for balance and strength",
    videoUrl: "https://www.youtube.com/embed/QOVaHwm-Q6U",
    sets: "3",
    reps: "10-12 each leg",
    difficulty: "Beginner",
  },
  {
    name: "Barbell Rows",
    category: "Back",
    description: "Build a thick, strong back",
    videoUrl: "https://www.youtube.com/embed/kBWAon7ItDw",
    sets: "3-4",
    reps: "8-12",
    difficulty: "Intermediate",
  },
];

const dietPlans = [
  {
    name: "Muscle Gain",
    goal: "Build Muscle Mass",
    description: "High protein, calorie surplus diet for muscle growth",
    totalCalories: 3000,
    meals: {
      breakfast: {
        name: "Breakfast",
        items: ["4 Whole Eggs", "Oatmeal with Banana", "Protein Shake", "Almonds (10-12)"],
        calories: 650,
        protein: "40g",
      },
      midMorning: {
        name: "Mid-Morning Snack",
        items: ["Greek Yogurt", "Mixed Berries", "Honey", "Walnuts"],
        calories: 350,
        protein: "25g",
      },
      lunch: {
        name: "Lunch",
        items: ["Grilled Chicken Breast (200g)", "Brown Rice (1 cup)", "Mixed Vegetables", "Salad"],
        calories: 700,
        protein: "50g",
      },
      evening: {
        name: "Evening Snack",
        items: ["Protein Bar", "Apple", "Peanut Butter (2 tbsp)"],
        calories: 400,
        protein: "30g",
      },
      dinner: {
        name: "Dinner",
        items: ["Grilled Fish (250g)", "Sweet Potato", "Broccoli", "Quinoa"],
        calories: 900,
        protein: "60g",
      },
    },
  },
  {
    name: "Fat Loss",
    goal: "Lose Body Fat",
    description: "Calorie deficit with high protein to preserve muscle",
    totalCalories: 1800,
    meals: {
      breakfast: {
        name: "Breakfast",
        items: ["Egg Whites (3)", "Whole Wheat Toast (1)", "Green Tea", "Orange"],
        calories: 300,
        protein: "20g",
      },
      midMorning: {
        name: "Mid-Morning Snack",
        items: ["Protein Shake", "Almonds (6-8)"],
        calories: 200,
        protein: "25g",
      },
      lunch: {
        name: "Lunch",
        items: ["Grilled Chicken (150g)", "Quinoa (½ cup)", "Steamed Vegetables", "Green Salad"],
        calories: 450,
        protein: "40g",
      },
      evening: {
        name: "Evening Snack",
        items: ["Greek Yogurt (low-fat)", "Cucumber sticks"],
        calories: 150,
        protein: "15g",
      },
      dinner: {
        name: "Dinner",
        items: ["Grilled Fish (150g)", "Steamed Broccoli", "Mixed Greens Salad"],
        calories: 700,
        protein: "45g",
      },
    },
  },
  {
    name: "Maintenance",
    goal: "Maintain Weight",
    description: "Balanced nutrition for maintaining current physique",
    totalCalories: 2400,
    meals: {
      breakfast: {
        name: "Breakfast",
        items: ["Scrambled Eggs (2)", "Whole Wheat Toast (2)", "Avocado", "Coffee"],
        calories: 450,
        protein: "25g",
      },
      midMorning: {
        name: "Mid-Morning Snack",
        items: ["Fruits", "Mixed Nuts (handful)"],
        calories: 250,
        protein: "10g",
      },
      lunch: {
        name: "Lunch",
        items: ["Chicken Breast (180g)", "Brown Rice (¾ cup)", "Mixed Vegetables", "Salad"],
        calories: 600,
        protein: "45g",
      },
      evening: {
        name: "Evening Snack",
        items: ["Protein Smoothie", "Banana"],
        calories: 300,
        protein: "25g",
      },
      dinner: {
        name: "Dinner",
        items: ["Lean Beef (150g)", "Sweet Potato", "Green Beans", "Salad"],
        calories: 800,
        protein: "50g",
      },
    },
  },
];

const subscriptionPlans = [
  {
    name: "BRONZE",
    description: "Perfect for beginners starting their fitness journey",
    duration: 1,
    price: 499,
    originalPrice: 699,
    features: [
      "Gym floor access",
      "Basic equipment usage",
      "Locker room access",
      "Free parking",
    ],
    isPopular: false,
    category: "basic",
  },
  {
    name: "SILVER",
    description: "Most popular plan for regular gym-goers",
    duration: 3,
    price: 1299,
    originalPrice: 1799,
    features: [
      "All Bronze features",
      "Full gym access",
      "Diet plan access",
      "Exercise library",
      "Progress tracking",
      "Group classes",
    ],
    isPopular: true,
    category: "standard",
  },
  {
    name: "GOLD",
    description: "Premium membership with exclusive benefits",
    duration: 6,
    price: 2199,
    originalPrice: 2999,
    features: [
      "All Silver features",
      "Personal training sessions (4/month)",
      "Nutrition consultation",
      "VIP lounge access",
      "Recovery zone access",
      "Priority booking",
    ],
    isPopular: false,
    category: "premium",
  },
  {
    name: "PLATINUM",
    description: "Ultimate fitness experience with all perks",
    duration: 12,
    price: 3999,
    originalPrice: 5999,
    features: [
      "All Gold features",
      "Unlimited personal training",
      "Exclusive platinum lounge",
      "Free merchandise pack",
      "Guest passes (2/month)",
      "Spa access",
      "Nutrition plan included",
    ],
    isPopular: false,
    category: "vip",
  },
  {
    name: "COUPLE",
    description: "Train together! Perfect for partners",
    duration: 3,
    price: 1999,
    originalPrice: 2799,
    features: [
      "Two memberships",
      "Full gym access for both",
      "Couple workout sessions",
      "Shared diet plans",
      "Progress tracking for both",
      "Group classes for both",
      "Priority support",
    ],
    isPopular: false,
    category: "standard",
  },
  {
    name: "FAMILY",
    description: "Whole family fitness solution",
    duration: 6,
    price: 4999,
    originalPrice: 6999,
    features: [
      "Up to 4 family members",
      "Full gym access",
      "Kids fitness programs",
      "Family challenge events",
      "Individual diet plans",
      "Personal training (2/month)",
      "Family locker",
    ],
    isPopular: false,
    category: "premium",
  },
  {
    name: "CORPORATE",
    description: "Best value for workplace wellness",
    duration: 12,
    price: 7999,
    originalPrice: 9999,
    features: [
      "Up to 10 employees",
      "Corporate wellness portal",
      "Monthly health reports",
      "Team building events",
      "Dedicated account manager",
      "On-site trainer visits",
      "Employee wellness gifts",
    ],
    isPopular: false,
    category: "premium",
  },
  {
    name: "STUDENT",
    description: "Special plan for students with valid ID",
    duration: 1,
    price: 299,
    originalPrice: 499,
    features: [
      "Gym floor access",
      "Basic equipment usage",
      "Student-friendly timings",
      "Study breaks fitness",
      "Student community",
    ],
    isPopular: false,
    category: "basic",
  },
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Exercise.deleteMany({});
    await DietPlan.deleteMany({});
    await SubscriptionPlan.deleteMany({});

    console.log("Data cleared...");

    // Insert seed data
    await Exercise.insertMany(exercises);
    console.log("Exercises seeded...");

    await DietPlan.insertMany(dietPlans);
    console.log("Diet plans seeded...");

    await SubscriptionPlan.insertMany(subscriptionPlans);
    console.log("Subscription plans seeded...");

    // No trainer - customer only
    await User.deleteMany({});

    console.log("All data seeded successfully!");
    process.exit();

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();

