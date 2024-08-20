import { model, Schema } from "mongoose";

export interface IAutoBidConfig extends Document {
  _id: string;
  userId: string;
  maxBidAmount: number;
  bidAlertPercentage: number;
  activeBids: string[];
}

const autoBidModel: Schema = new Schema({
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

const AutoBidConfig = model<IAutoBidConfig>("AutoBidConfig", autoBidModel);

export default AutoBidConfig;
