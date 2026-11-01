import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const books = [
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    image: "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg",
    description:
      "A young shepherd named Santiago travels in search of his personal legend and discovers the importance of following his dreams.",
    totalCopies: 5,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    category: "Others",
    image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    description:
      "A practical guide to building good habits, breaking bad ones, and making small improvements every day.",
    totalCopies: 5,
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    category: "Others",
    image: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg",
    description:
      "A personal finance book that explains different ways of thinking about money, investing, and financial independence.",
    totalCopies: 4,
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Others",
    image: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
    description:
      "Explores how emotions and behavior influence financial decisions and our relationship with money.",
    totalCopies: 4,
  },
  {
    title: "Ikigai",
    author: "Hector Garcia and Francesc Miralles",
    category: "Others",
    image: "https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg",
    description:
      "Introduces the Japanese concept of ikigai and explores purpose, happiness, and a meaningful life.",
    totalCopies: 3,
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "History",
    image: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
    description:
      "Explores the history of humankind, from early humans to the modern world.",
    totalCopies: 4,
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    image: "https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg",
    description:
      "Explains major ideas about the universe, space, time, black holes, and cosmology.",
    totalCopies: 3,
  },
  {
    title: "The Origin of Species",
    author: "Charles Darwin",
    category: "Science",
    image: "https://covers.openlibrary.org/b/isbn/9781509827695-L.jpg",
    description:
      "A foundational scientific work explaining evolution through natural selection.",
    totalCopies: 3,
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J. K. Rowling",
    category: "Fiction",
    image: "https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg",
    description:
      "A young wizard discovers his magical identity and begins his journey at Hogwarts School of Witchcraft and Wizardry.",
    totalCopies: 5,
  },
  {
    title: "The Little Prince",
    author: "Antoine de Saint-Exupery",
    category: "Kids",
    image: "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg",
    description:
      "A thoughtful story about friendship, love, imagination, and seeing the world through a child's eyes.",
    totalCopies: 4,
  },
  {
    title: "Charlotte's Web",
    author: "E. B. White",
    category: "Kids",
    image: "https://covers.openlibrary.org/b/isbn/9780064400558-L.jpg",
    description:
      "A heartwarming story about the friendship between a pig named Wilbur and a spider named Charlotte.",
    totalCopies: 3,
  },
  {
    title: "The Hobbit",
    author: "J. R. R. Tolkien",
    category: "Fiction",
    image: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
    description:
      "Bilbo Baggins joins an unexpected adventure filled with courage, friendship, and discovery.",
    totalCopies: 4,
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    image: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    description:
      "A classic novel exploring ambition, wealth, love, and the American Dream.",
    totalCopies: 3,
  },
  {
    title: "Wings of Fire",
    author: "A. P. J. Abdul Kalam",
    category: "Others",
    image: "https://covers.openlibrary.org/b/isbn/9788173711466-L.jpg",
    description:
      "An autobiography describing the life, education, challenges, and achievements of A. P. J. Abdul Kalam.",
    totalCopies: 4,
  },
  {
    title: "The Diary of a Young Girl",
    author: "Anne Frank",
    category: "History",
    image: "https://covers.openlibrary.org/b/isbn/9780553296983-L.jpg",
    description:
      "The diary of Anne Frank, documenting her thoughts and experiences during World War II.",
    totalCopies: 3,
  },
];

async function seedBooks() {
  try {
    if (!uri || !dbName) {
      throw new Error("MONGODB_URI or DB_NAME is missing from .env");
    }

    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("books");

    const booksToInsert = [];

    for (const book of books) {
      const existingBook = await collection.findOne({
        title: book.title,
        author: book.author,
      });

      if (!existingBook) {
        booksToInsert.push({
          ...book,
          availableCopies: book.totalCopies,
          userName: "BookNook Library",
          userEmail: "library@booknook.local",
          createdAt: new Date(),
        });
      }
    }

    if (booksToInsert.length === 0) {
      console.log("All seed books already exist. Nothing to insert.");
      return;
    }

    const result = await collection.insertMany(booksToInsert);

    console.log(`${result.insertedCount} books added successfully!`);
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await client.close();
  }
}

seedBooks();
