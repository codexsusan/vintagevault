import { model, Schema } from "mongoose";
import { AuctionType } from "../schemas/auction";

const auctionModel: Schema = new Schema({
  itemId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  auctionStart: {
    type: Date,
    required: true,
  },
  auctionEnd: {
    type: Date,
    required: true,
  },
});  


const Auction = model("Auction", auctionModel);

export default Auction;