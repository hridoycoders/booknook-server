import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import bookRoutes from "./routes/bookRoutes.js";
import borrowRoutes from "./routes/borrowRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/books", bookRoutes);
app.use("/borrows", borrowRoutes);

app.get("/", (req, res) => {
  res.send("BookNook Server is Running!");
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`BookNook Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
