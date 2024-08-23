import { Document, model, Schema } from "mongoose";

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
  getTotalAllocatedAmount(): number;
  getAvailableFunds(): number;
  canPlaceAutoBid(amount: number): boolean;
}

const autoBidSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
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
  this: IAutoBidConfig,
  amount: number
): boolean {
  return this.status === "active" && this.getAvailableFunds() >= amount;
};

const AutoBidConfig = model<IAutoBidConfig>("AutoBidConfig", autoBidSchema);
export default AutoBidConfig;
