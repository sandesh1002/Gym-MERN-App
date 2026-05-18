const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/exercises", require("./routes/exerciseRoutes"));
app.use("/api/diet-plans", require("./routes/dietPlanRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('DB connection failed:', error.message);
  }
});
