import mongoose, { Document, model, Schema } from "mongoose";
import { IUser } from "./user.model";
import { IItem } from "./item.model";

export interface IAutoBidConfig extends Document {
  _id: string;
  userId: string;
  maxBidAmount: number;
  bidAlertPercentage: number;
  activeBids: {
    itemId: string;
    allocatedAmount: number;
  }[];
  status: "active" | "paused";
  createdAt: Date;
  updatedAt: Date;
  alertSent: boolean;
  getTotalAllocatedAmount(): number;
  getAvailableFunds(): number;
  canPlaceAutoBid(itemId: string, amount: number): boolean;
  updateAllocatedAmount(itemId: string, amount: number): void;
}

const autoBidSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      ref: "User",
    },
    maxBidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    bidAlertPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    activeBids: [
      {
        itemId: {
          type: String,
          ref: "Item",
        },
        allocatedAmount: {
          type: Number,
          default: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
    },
    alertSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

autoBidSchema.methods.getTotalAllocatedAmount = function (
  this: IAutoBidConfig
): number {
  return this.activeBids.reduce((total, bid) => total + bid.allocatedAmount, 0);
};

autoBidSchema.methods.getAvailableFunds = function (
  this: IAutoBidConfig
): number {
  return this.maxBidAmount - this.getTotalAllocatedAmount();
};

autoBidSchema.methods.canPlaceAutoBid = function (
  itemId: string,
  amount: number
): boolean {
  const currentBid = this.activeBids.find(
    (bid: { itemId: string; allocatedAmount: number }) => bid.itemId === itemId
  );
  const additionalAmount = currentBid
    ? amount - currentBid.allocatedAmount
    : amount;
  return (
    this.status === "active" && this.getAvailableFunds() >= additionalAmount
  );
};

autoBidSchema.methods.updateAllocatedAmount = function (
  itemId: string,
  amount: number
): void {
  const bidIndex = this.activeBids.findIndex(
    (bid: { itemId: string; allocatedAmount: number }) => bid.itemId === itemId
  );
  if (bidIndex !== -1) {
    this.activeBids[bidIndex].allocatedAmount = amount;
  } else {
    this.activeBids.push({ itemId, allocatedAmount: amount });
  }
};

const AutoBidConfig = model<IAutoBidConfig>("AutoBidConfig", autoBidSchema);
export default AutoBidConfig;
