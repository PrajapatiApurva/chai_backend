import mongoose, {Schema, model} from "mongoose";

const subscriptionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    subscriber: {
      type: Schema.Types.ObjectId, // one who is subscribing
      ref: "User"
    },
    channel: {
      type: Schema.Types.ObjectId, // one to whome 'subscriber' is subscribing
      ref: "User"
    }
  },
  {timestamps: true}
);

export const Subscription = model("Subscription", subscriptionSchema);