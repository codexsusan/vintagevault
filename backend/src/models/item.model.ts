import { model, Schema } from "mongoose";

const itemModel: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  adminId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startingPrice: {
    type: Number,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  isPublished: {
    type: Boolean,
    required: true,
  },
  auctionEndTime: {
    type: Date,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  bids: [
    {
      type: String,
      ref: "Bid",
    },
  ],
});

const Item = model("Item", itemModel);

export default Item;
