import mongoose from "mongoose";

const UserWordShcema = new mongoose.Schema({
  userId: { type: String, required: true },
  collectionId: String,
  name: String,
  audio: String,
  examples: [String],
  definitions: [String],
  //   change images later
  imageName: {},
  imageDefinitionsId: {},
  status: { type: Number, min: 0, max: 5 },
  nextReviewAt: Date,
});

export default mongoose.models.UserWord ||
  mongoose.model("UserWord", UserWordShcema);
