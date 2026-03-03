import mongoose from "mongoose";

const WordShcema = new mongoose.Schema({
  userId: { type: String, required: true },
  collectionId: String,
  name: String,
  audio: {
    name: String,
    buffer: Buffer,
  },
  examples: [String],
  definitions: [String],
  imageName: {
    name: String,
    buffer: Buffer,
  },
  imageDefinitions: {
    name: String,
    buffer: Buffer,
  },
  status: { type: Number, min: 0, max: 5 },
  nextReviewAt: Date,
});

export default mongoose.models.Word || mongoose.model("Word", WordShcema);
