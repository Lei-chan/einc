import mongoose from "mongoose";

const JournalSchema = new mongoose.Schema({
  userId: String,
  collectionId: String,
  journals: {
    date: Date,
    content: [String],
  },
});

export default mongoose.models.Journal ||
  mongoose.model("Journal", JournalSchema);
