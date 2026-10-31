import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing in .env file");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

const connectDB = async () => {
  try {
    await client.connect();

    db = client.db(process.env.DB_NAME);

    await db.command({ ping: 1 });

    console.log("MongoDB Connected Successfully!");

    return db;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Database is not connected yet!");
  }

  return db;
};

export { connectDB, getDB, client };
