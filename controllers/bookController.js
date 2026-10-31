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
    console.error("Get Books Error:", error);
    res.status(500).json({
      message: "Failed to fetch books",
    });
  }
};

// GET /books/:id - Get single book
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    const db = getDB();

    const book = await db.collection("books").findOne({
      _id: new ObjectId(id),
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("Get Book Error:", error);
    res.status(500).json({
      message: "Failed to fetch book",
    });
  }
};

// POST /books - Add a new book
const addBook = async (req, res) => {
  try {
    const { title, author, category, image, description, totalCopies } =
      req.body || {};

    if (
      !title?.trim() ||
      !author?.trim() ||
      !category ||
      !image?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all required book information",
      });
    }

    if (!Number.isInteger(totalCopies) || totalCopies < 1) {
      return res.status(400).json({
        message: "Total copies must be a positive whole number",
      });
    }

    const allowedCategories = [
      "Fiction",
      "Science",
      "History",
      "Kids",
      "Others",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid book category",
      });
    }

    if (!req.user?.email) {
      return res.status(401).json({
        message: "User information missing from token",
      });
    }

    const newBook = {
      title: title.trim(),
      author: author.trim(),
      category,
      image: image.trim(),
      description: description.trim(),
      totalCopies,
      availableCopies: totalCopies,
      userName: req.user.name || req.user.email,
      userEmail: req.user.email,
      createdAt: new Date(),
    };

    const db = getDB();

    const result = await db.collection("books").insertOne(newBook);

    res.status(201).json({
      message: "Book added successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Add Book Error:", error);

    res.status(500).json({
      message: "Failed to add book",
    });
  }
};

// PATCH /books/:id - Update a book
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    if (!req.user?.email) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    const { title, author, category, image, description, totalCopies } =
      req.body || {};

    if (
      !title?.trim() ||
      !author?.trim() ||
      !category ||
      !image?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all required book information",
      });
    }

    if (!Number.isInteger(totalCopies) || totalCopies < 1) {
      return res.status(400).json({
        message: "Total copies must be a positive whole number",
      });
    }

    const allowedCategories = [
      "Fiction",
      "Science",
      "History",
      "Kids",
      "Others",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid book category",
      });
    }

    const db = getDB();
    const booksCollection = db.collection("books");

    const book = await booksCollection.findOne({
      _id: new ObjectId(id),
      userEmail: req.user.email,
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found or you are not the owner",
      });
    }

    const borrowedCopies =
      (book.totalCopies || 0) - (book.availableCopies ?? 0);

    if (totalCopies < borrowedCopies) {
      return res.status(400).json({
        message: `At least ${borrowedCopies} copies are currently borrowed`,
      });
    }

    const availableCopies = totalCopies - borrowedCopies;

    await booksCollection.updateOne(
      {
        _id: new ObjectId(id),
        userEmail: req.user.email,
      },
      {
        $set: {
          title: title.trim(),
          author: author.trim(),
          category,
          image: image.trim(),
          description: description.trim(),
          totalCopies,
          availableCopies,
          updatedAt: new Date(),
        },
      },
    );

    res.status(200).json({
      message: "Book updated successfully",
    });
  } catch (error) {
    console.error("Update Book Error:", error);

    res.status(500).json({
      message: "Failed to update book",
    });
  }
};

// DELETE /books/:id - Delete a book
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    if (!req.user?.email) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    const db = getDB();

    const book = await db.collection("books").findOne({
      _id: new ObjectId(id),
      userEmail: req.user.email,
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found or you are not the owner",
      });
    }

    // Do not delete a book while copies are borrowed
    const borrowedCopies =
      (book.totalCopies || 0) - (book.availableCopies ?? 0);

    if (borrowedCopies > 0) {
      return res.status(400).json({
        message: "Cannot delete a book while copies are borrowed",
      });
    }

    await db.collection("books").deleteOne({
      _id: new ObjectId(id),
      userEmail: req.user.email,
    });

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete Book Error:", error);

    res.status(500).json({
      message: "Failed to delete book",
    });
  }
};

export { getAllBooks, getBookById, addBook, updateBook, deleteBook };
