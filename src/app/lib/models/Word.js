import mongoose from "mongoose";

const WordShcema = new mongoose.Schema({
  userId: { type: String, required: true },
  collectionId: String,
  name: String,
  pronunciationString: String,
  audio: {
    type: mongoose.Schema.Types.Union,
    of: [
      {
        name: String,
        buffer: Buffer,
      },
      String,
    ],
  },
  examples: [String],
  definitions: [String],
  synonyms: [String],
  imageName: {
    type: mongoose.Schema.Types.Union,
    of: [
      {
        name: String,
        buffer: Buffer,
      },
      String,
    ],
  },
  imageDefinitions: {
    type: mongoose.Schema.Types.Union,
    of: [
      {
        name: String,
        buffer: Buffer,
      },
      String,
    ],
  },
  status: { type: Number, min: 0, max: 5 },
  nextReviewAt: Date,
});

export default mongoose.models.Word || mongoose.model("Word", WordShcema);
