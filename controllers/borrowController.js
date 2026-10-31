import { ObjectId } from "mongodb";
import { getDB, client } from "../config/db.js";

// POST /borrows - Borrow a book
const borrowBook = async (req, res) => {
  const session = client.startSession();

  try {
    const { bookId, returnDate } = req.body || {};

    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    if (!req.user?.email) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    if (
      !returnDate ||
      Number.isNaN(Date.parse(returnDate)) ||
      new Date(returnDate) <= new Date()
    ) {
      return res.status(400).json({
        message: "Please provide a valid future return date",
      });
    }

    const db = getDB();

    const booksCollection = db.collection("books");
    const borrowsCollection = db.collection("borrows");

    let failure = null;
    let borrowId = null;

    await session.withTransaction(async () => {
      // Check if the user already borrowed this book
      const existingBorrow = await borrowsCollection.findOne(
        {
          bookId: new ObjectId(bookId),
          userEmail: req.user.email,
          status: "borrowed",
        },
        { session },
      );

      if (existingBorrow) {
        failure = {
          status: 409,
          message: "You have already borrowed this book",
        };

        throw new Error("BORROW_ALREADY_EXISTS");
      }

      // Decrease available copies atomically
      const book = await booksCollection.findOneAndUpdate(
        {
          _id: new ObjectId(bookId),
          availableCopies: { $gt: 0 },
        },
        {
          $inc: {
            availableCopies: -1,
          },
        },
        {
          session,
          returnDocument: "after",
        },
      );

      if (!book) {
        failure = {
          status: 400,
          message: "Book not available",
        };

        throw new Error("BOOK_NOT_AVAILABLE");
      }

      // Create borrow record
      const borrowRecord = {
        bookId: new ObjectId(bookId),
        bookTitle: book.title,
        bookImage: book.image,
        userName: req.user.name || req.user.email,
        userEmail: req.user.email,
        borrowDate: new Date(),
        returnDate: new Date(returnDate),
        status: "borrowed",
        createdAt: new Date(),
      };

      const result = await borrowsCollection.insertOne(borrowRecord, {
        session,
      });

      borrowId = result.insertedId;
    });

    res.status(201).json({
      message: "Book borrowed successfully",
      borrowId,
    });
  } catch (error) {
    if (error.message === "BORROW_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "You have already borrowed this book",
      });
    }

    if (error.message === "BOOK_NOT_AVAILABLE") {
      return res.status(400).json({
        message: "Book not available",
      });
    }

    console.error("Borrow Book Error:", error);

    res.status(500).json({
      message: "Failed to borrow book",
    });
  } finally {
    await session.endSession();
  }
};

// GET /borrows - Get logged-in user's borrowed books
const getMyBorrows = async (req, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    const db = getDB();

    const borrows = await db
      .collection("borrows")
      .find({
        userEmail: req.user.email,
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(borrows);
  } catch (error) {
    console.error("Get Borrows Error:", error);

    res.status(500).json({
      message: "Failed to fetch borrowed books",
    });
  }
};

// DELETE /borrows/:id - Return a borrowed book
const returnBook = async (req, res) => {
  const session = client.startSession();

  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid borrow ID",
      });
    }

    if (!req.user?.email) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    const db = getDB();

    const borrowsCollection = db.collection("borrows");
    const booksCollection = db.collection("books");

    let failure = null;

    await session.withTransaction(async () => {
      // Find the active borrow record
      const borrow = await borrowsCollection.findOne(
        {
          _id: new ObjectId(id),
          userEmail: req.user.email,
          status: "borrowed",
        },
        { session },
      );

      if (!borrow) {
        failure = {
          status: 404,
          message: "Active borrow record not found",
        };

        throw new Error("BORROW_NOT_FOUND");
      }

      // Mark the book as returned
      const result = await borrowsCollection.updateOne(
        {
          _id: new ObjectId(id),
          userEmail: req.user.email,
          status: "borrowed",
        },
        {
          $set: {
            status: "returned",
            actualReturnDate: new Date(),
          },
        },
        { session },
      );

      if (result.modifiedCount === 0) {
        throw new Error("BORROW_NOT_FOUND");
      }

      // Increase available copies
      const bookResult = await booksCollection.updateOne(
        {
          _id: borrow.bookId,
          availableCopies: { $lt: borrow.totalCopies ?? Infinity },
        },
        {
          $inc: {
            availableCopies: 1,
          },
        },
        { session },
      );

      if (bookResult.matchedCount === 0) {
        throw new Error("BOOK_COPY_UPDATE_FAILED");
      }
    });

    res.status(200).json({
      message: "Book returned successfully",
    });
  } catch (error) {
    if (error.message === "BORROW_NOT_FOUND") {
      return res.status(404).json({
        message: "Active borrow record not found",
      });
    }

    console.error("Return Book Error:", error);

    res.status(500).json({
      message: "Failed to return book",
    });
  } finally {
    await session.endSession();
  }
};

export { borrowBook, getMyBorrows, returnBook };
