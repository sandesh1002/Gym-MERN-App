const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect DB (Vercel serverless warm start safe)
let dbPromise;
function initDB() {
  if (!dbPromise) dbPromise = connectDB();
  return dbPromise;
}

// Ensure DB is connected before handling API requests
app.use(async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    console.error("DB init error:", err);
    res.status(500).json({ message: "Database connection error" });
  }
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/exercises", require("./routes/exerciseRoutes"));
app.use("/api/diet-plans", require("./routes/dietPlanRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

// IMPORTANT: For Vercel, do NOT use app.listen().
// Export the Express app and let Vercel handle server startup.
module.exports = app;


