import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
  res.send("BookNook Server is Running!");
});

// Start Server
app.listen(port, () => {
  console.log(`BookNook Server running on port ${port}`);
});
