import { Response } from "express";
import { BidSchema } from "../schemas/bid";
import Item from "../models/item.model";
import Bid, { IBid } from "../models/bid.model";
import { IRequest } from "../types";
import { processAutoBids } from "./autobid.controller";
import AutoBidConfig from "../models/auto-bid.model";
import { startSession } from "mongoose";

export const placeBid = async (req: IRequest, res: Response) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const bidData = {
      ...req.body,
      timestamp: new Date(),
    };
    const validatedBid = BidSchema.parse(bidData);

    const item = await Item.findById(validatedBid.itemId).session(session);
    if (!item) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Item not found" });
    }

    if (new Date() > item.auctionEndTime) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Auction has ended" });
    }

    if (validatedBid.amount <= item.currentPrice) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Bid must be higher than current price" });
    }

    const newBid = new Bid({
      ...validatedBid,
      userId: req.user?.id,
      isAutoBid: false,
    });
    await newBid.save({ session });

    item.currentPrice = validatedBid.amount;
    item.bids.push(newBid._id);
    await item.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Bid placed successfully",
      bid: {
        _id: newBid._id,
        itemId: newBid.itemId,
        amount: newBid.amount,
        timestamp: newBid.timestamp,
      },
    });

    // Trigger auto-bidding for other users
    await processAutoBids(
      item._id.toString(),
      validatedBid.amount,
      req.user?.id
    );
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      message: "Error placing bid",
      error: (error as Error).message,
    });
  } finally {
    session.endSession();
  }
};

export const getBidsForItem = async (req: IRequest, res: Response) => {
  try {
    const itemId = req.params.itemId;
    const bids = await Bid.find({ itemId }).sort("-amount");
    res.json(bids);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching bids",
      error: (error as Error).message,
    });
  }
};