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
    collections: [{ name: String, numberOfWords: Number, allWords: {} }],
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
