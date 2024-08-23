import { model, Schema } from "mongoose";

export interface IItem extends Document {
  _id: string;
  name: string;
  adminId: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  auctionEndTime: Date;
  image: string;
  bids: string[];
}

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

const Item = model<IItem>("Item", itemModel);

export default Item;
