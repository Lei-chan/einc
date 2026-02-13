import mongoose from "mongoose";

const WordShcema = new mongoose.Schema({
  userId: { type: String, required: true },
  collectionId: String,
  name: String,
  audio: {},
  examples: [String],
  definitions: [String],
  imageName: {},
  imageDefinitions: {},
  status: { type: Number, min: 0, max: 5 },
  nextReviewAt: Date,
});

export default mongoose.models.Word || mongoose.model("Word", WordShcema);
