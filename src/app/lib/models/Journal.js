import mongoose from "mongoose";

const JournalSchema = new mongoose.Schema({
  userId: String,
  collectionId: String,
  journal: {
    date: String,
    content: [String],
  },
});

export default mongoose.models.Journal ||
  mongoose.model("Journal", JournalSchema);
