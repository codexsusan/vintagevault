import mongoose, { Document, model, Schema } from "mongoose";
export interface IBid extends Document {
  _id: string;
  userId: string;
  itemId: string;
  amount: number;
  timestamp: Date;
  isAutoBid: boolean;
}

const bidSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: "User",
  },
  itemId: {
    type: String,
    ref: "Item",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  isAutoBid: {
    type: Boolean,
    default: false,
  },
});

const Bid = model<IBid>("Bid", bidSchema);

export default Bid;
