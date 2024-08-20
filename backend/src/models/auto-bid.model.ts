import { model, Schema } from "mongoose";
import { AutoBidConfigType } from "../schemas/auto-bid-config";

const autoBidModel: Schema<AutoBidConfigType> = new Schema({
  userId: {
    type: String,
    required: true,
  },
  maxBidAmount: {
    type: Number,
    required: true,
  },
  bidAlertPercentage: {
    type: Number,
    required: true,
  },
  activeBids: [
    {
      type: String,
      ref: "Item",
    },
  ],
});

const AutoBid = model("AutoBid", autoBidModel);

export default AutoBid;
