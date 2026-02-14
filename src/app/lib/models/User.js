import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: [true, "Email already exists."],
    },
    password: { type: {}, select: false },
    isGoogleConnected: Boolean,
    collections: [
      { name: String, collectionId: String, numberOfWords: Number },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
