import { Document, model, Schema } from "mongoose";

export interface IAutoBidConfig extends Document {
  _id: string;
  userId: string;
  reservedAmount: number;
  maxBidAmount: number;
  bidAlertPercentage: number;
  activeBids: string[];
  status: "active" | "paused";
  createdAt: Date;
  updatedAt: Date;
  availableFunds: number;
  canPlaceAutoBid(amount: number): boolean;
}

const autoBidSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    reservedAmount: {
      type: Number,
      default: 0,
      min: 0,
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
        type: String,
        ref: "Item",
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

autoBidSchema.virtual("availableFunds").get(function (this: IAutoBidConfig) {
  return this.maxBidAmount - this.reservedAmount;
});

autoBidSchema.methods.canPlaceAutoBid = function (
  this: IAutoBidConfig,
  amount: number
): boolean {
  return this.status === "active" && this.availableFunds >= amount;
};

autoBidSchema.pre("save", function (this: IAutoBidConfig, next) {
  if (this.reservedAmount > this.maxBidAmount) {
    this.reservedAmount = this.maxBidAmount;
  }
  next();
});

const AutoBidConfig = model<IAutoBidConfig>("AutoBidConfig", autoBidSchema);

export default AutoBidConfig;
