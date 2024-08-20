import { model, Schema } from "mongoose";
import { BidType } from "../schemas/bid";

const bidModel: Schema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  itemId: {
    type: String,
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
});

const Bid = model("Bid", bidModel);

export default Bid;