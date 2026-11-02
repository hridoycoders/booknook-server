import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import bookRoutes from "./routes/bookRoutes.js";
import borrowRoutes from "./routes/borrowRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// API Routes
app.use("/books", bookRoutes);
app.use("/borrows", borrowRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("BookNook Server is Running!");
});

// Vercel Serverless Export
export default app;

// Local Development
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`BookNook Server running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Server startup failed:", error.message);
      process.exit(1);
    });
}
