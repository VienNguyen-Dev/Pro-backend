import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
  subcriber: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  chanel: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
})

export const Subsription = mongoose.model("Subscription", subscriptionSchema);