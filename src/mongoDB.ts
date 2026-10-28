import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "src", ".env") });

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to your .env file.");
}

const client = new MongoClient(uri);

export async function connectDatabase() {
    await client.connect();
    console.log("Connected to MongoDB");
    return client;
}
