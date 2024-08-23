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
  getTotalReservedAmount(): number;
  getAvailableFunds(): number;
  canPlaceAutoBid(itemId: string, amount: number): boolean;
  reserveFunds(itemId: string, amount: number): boolean;
  releaseFunds(itemId: string, amount: number): void;
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

autoBidSchema.methods.getTotalReservedAmount = function (
  this: IAutoBidConfig
): number {
  return this.activeBids.reduce((total, bid) => total + bid.allocatedAmount, 0);
};

autoBidSchema.methods.getAvailableFunds = function (
  this: IAutoBidConfig
): number {
  return this.maxBidAmount - this.getTotalReservedAmount();
};

autoBidSchema.methods.canPlaceAutoBid = function (
  this: IAutoBidConfig,
  itemId: string,
  amount: number
): boolean {
  const currentBid = this.activeBids.find((bid) => bid.itemId === itemId);
  const availableForItem =
    this.getAvailableFunds() + (currentBid?.allocatedAmount || 0);
  return this.status === "active" && availableForItem >= amount && amount <= this.maxBidAmount;
};

autoBidSchema.methods.reserveFunds = function (
  this: IAutoBidConfig,
  itemId: string,
  amount: number
): boolean {
  const currentBid = this.activeBids.find((bid) => bid.itemId === itemId);
  const availableForItem =
    this.getAvailableFunds() + (currentBid?.allocatedAmount || 0);

  if (availableForItem >= amount) {
    if (currentBid) {
      currentBid.allocatedAmount = amount;
    } else {
      this.activeBids.push({ itemId, allocatedAmount: amount });
    }
    return true;
  }
  return false;
};

autoBidSchema.methods.releaseFunds = function (
  this: IAutoBidConfig,
  itemId: string,
  amount: number
): void {
  const bidIndex = this.activeBids.findIndex((bid) => bid.itemId === itemId);
  if (bidIndex !== -1) {
    this.activeBids[bidIndex].allocatedAmount = Math.max(
      0,
      this.activeBids[bidIndex].allocatedAmount - amount
    );
    if (this.activeBids[bidIndex].allocatedAmount === 0) {
      this.activeBids.splice(bidIndex, 1);
    }
  }
};

const AutoBidConfig = model<IAutoBidConfig>("AutoBidConfig", autoBidSchema);
export default AutoBidConfig;
