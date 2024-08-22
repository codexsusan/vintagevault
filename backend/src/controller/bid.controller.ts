import { Response } from "express";
import { BidSchema } from "../schemas/bid";
import Item from "../models/item.model";
import Bid, { IBid } from "../models/bid.model";
import { IRequest } from "../types";
import { processAutoBids } from "./autobid.controller";

export const placeBid = async (req: IRequest, res: Response) => {
  try {
    const bidData = {
      ...req.body,
      timestamp: new Date(),
    };
    const validatedBid = BidSchema.parse(bidData);
    const item = await Item.findById(validatedBid.itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (new Date() > item.auctionEndTime) {
      return res.status(400).json({ message: "Auction has ended" });
    }

    const hasHighestBid = await Bid.findOne({
      itemId: item._id,
      userId: req.user?.id,
      amount: item.currentPrice,
    });

    if (hasHighestBid) {
      return res
        .status(400)
        .json({ success: false, message: "You already have the highest bid" });
    }

    if (validatedBid.amount <= item.currentPrice) {
      return res
        .status(400)
        .json({ message: "Bid must be higher than current price" });
    }

    const newBid = new Bid({
      ...validatedBid,
      userId: req.user?.id,
      isAutoBid: false,
    });
    await newBid.save();

    item.currentPrice = validatedBid.amount;
    item.bids.push(newBid._id);
    await item.save();

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
    res
      .status(400)
      .json({ message: "Error placing bid", error: (error as Error).message });
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

export const placeAutoBid = async (
  userId: string,
  itemId: string,
  amount: number
): Promise<IBid> => {
  const newBid = new Bid({
    userId,
    itemId,
    amount,
    timestamp: new Date(),
    isAutoBid: true,
  });
  await newBid.save();

  const item = await Item.findById(itemId);
  if (item) {
    item.currentPrice = amount;
    item.bids.push(newBid._id);
    await item.save();
  }

  return newBid;
};
