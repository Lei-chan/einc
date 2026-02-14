import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const dbConnect = async function () {
  try {
    if (!MONGODB_URI)
      throw new Error("Please define the MONGODB_URI environment variable");
    await mongoose.connect(MONGODB_URI);
    return mongoose;
  } catch (err) {
    throw err;
  }
};

export default dbConnect;
