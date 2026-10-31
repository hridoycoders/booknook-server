import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// GET /books - Get all books
const getAllBooks = async (req, res) => {
  try {
    const db = getDB();

    const books = await db
      .collection("books")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

// GET /books/:id - Get single book
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const db = getDB();

    const book = await db.collection("books").findOne({
      _id: new ObjectId(id),
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch book" });
  }
};

export { getAllBooks, getBookById };
