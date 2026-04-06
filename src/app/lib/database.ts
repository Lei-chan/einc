import mongoose from "mongoose";
import { setServers } from "node:dns/promises";

const MONGODB_URI = process.env.MONGODB_URI;

const dbConnect = async function () {
  try {
    if (!MONGODB_URI)
      throw new Error("Please define the MONGODB_URI environment variable");

    setServers(["1.1.1.1", "8.8.8.8"]);
    await mongoose.connect(MONGODB_URI);
    return mongoose;
  } catch (err) {
    throw err;
  }
};

export default dbConnect;
