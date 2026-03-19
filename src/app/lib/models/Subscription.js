import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({ data: String });

export default mongoose.models.Subsctiption ||
  mongoose.model("Subscription", SubscriptionSchema);
