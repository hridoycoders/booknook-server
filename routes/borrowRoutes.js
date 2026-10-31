import express from "express";

import {
  borrowBook,
  getMyBorrows,
  returnBook,
} from "../controllers/borrowController.js";

import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, borrowBook);
router.get("/", verifyToken, getMyBorrows);
router.delete("/:id", verifyToken, returnBook);

export default router;
