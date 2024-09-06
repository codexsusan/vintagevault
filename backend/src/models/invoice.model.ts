import { model, Schema } from "mongoose";

export interface IInvoice extends Document {
  _id: string;
  userId: string;
  itemId: string;
  bidId: string;
  amount: number;
  invoiceKey: string;
  timestamp: Date;
}

const invoiceModel = new Schema({
  userId: {
    type: String,
    required: true,
    ref: "User",
  },
  itemId: {
    type: String,
    required: true,
    ref: "Item",
  },
  bidId: {
    type: String,
    required: true,
    ref: "Bid",
  },
  amount: {
    type: Number,
    required: true,
  },
  invoiceKey: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const Invoice = model<IInvoice>("Invoice", invoiceModel);

export default Invoice;
