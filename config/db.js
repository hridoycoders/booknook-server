import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error("MONGODB_URI is missing");
}

if (!dbName) {
  throw new Error("DB_NAME is missing");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
let connectionPromise;

const connectDB = async () => {
  if (db) return db;

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        await client.connect();

        const database = client.db(dbName);

        await database.command({ ping: 1 });

        db = database;

        console.log("MongoDB Connected Successfully!");

        return db;
      } catch (error) {
        connectionPromise = null;
        console.error("MongoDB Connection Failed:", error.message);
        throw error;
      }
    })();
  }

  return connectionPromise;
};

const getDB = () => {
  if (!db) {
    throw new Error("Database is not connected yet!");
  }

  return db;
};

export { connectDB, getDB, client };
