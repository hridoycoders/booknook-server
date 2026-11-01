import express from "express";

import {
  getAllBooks,
  getBookById,
  getMyBooks,
  addBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";

import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Get all books
router.get("/", getAllBooks);

// Get books added by the logged-in user
// Must be before /:id route
router.get("/my-books", verifyToken, getMyBooks);

// Get a single book by ID
router.get("/:id", getBookById);

// Add a new book
router.post("/", verifyToken, addBook);

// Update a book
router.patch("/:id", verifyToken, updateBook);

// Delete a book
router.delete("/:id", verifyToken, deleteBook);

export default router;
