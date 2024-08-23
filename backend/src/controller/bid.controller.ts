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
      return res
        .status(400)
        .json({ success: false, message: "Auction has ended" });
    }

    const hasHighestBid = await Bid.findOne({
      itemId: item._id,
      userId: req.user?.id,
      amount: item.currentPrice,
    }).session(session);

    if (hasHighestBid) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "You already have the highest bid." });
    }

    if (validatedBid.amount <= item.currentPrice) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Bid must be higher than current price",
      });
    }

    // Checking if the user has auto-bidding enabled
    const autoBidConfig = await AutoBidConfig.findOne({
      userId: req.user?.id,
    }).session(session);
    if (autoBidConfig) {
      const currentAllocatedAmount = autoBidConfig.getTotalAllocatedAmount();
      const newTotalAllocated = currentAllocatedAmount + validatedBid.amount;

      if (newTotalAllocated > autoBidConfig.maxBidAmount) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "Please increase your maximum auto-bid amount.",
        });
      }
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

    // If auto-bidding is enabled, update the allocated amount
    if (autoBidConfig) {
      const itemBidIndex = autoBidConfig.activeBids.findIndex(
        (bid) => bid.itemId === validatedBid.itemId
      );
      if (itemBidIndex !== -1) {
        autoBidConfig.activeBids[itemBidIndex].allocatedAmount =
          validatedBid.amount;
      } else {
        autoBidConfig.activeBids.push({
          itemId: validatedBid.itemId,
          allocatedAmount: validatedBid.amount,
        });
      }
      await autoBidConfig.save({ session });
    }

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
    await session.endSession();
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
  amount: number,
) => {
  const config = await AutoBidConfig.findOne({ userId });
  if (
    !config ||
    !config.canPlaceAutoBid(amount) ||
    amount > config.maxBidAmount
  ) {
    return null;
  }

  const item = await Item.findById(itemId);
  if (
    !item ||
    new Date() > item.auctionEndTime ||
    amount <= item.currentPrice
  ) {
    return null;
  }

  const newBid = new Bid({
    userId,
    itemId,
    amount,
    timestamp: new Date(),
    isAutoBid: true,
  });

  await newBid.save();

  item.currentPrice = amount;
  item.bids.push(newBid._id);
  await item.save();

  // Update the AutoBidConfig
  const itemBidIndex = config.activeBids.findIndex(
    (bid) => bid.itemId === itemId
  );
  if (itemBidIndex !== -1) {
    config.activeBids[itemBidIndex].allocatedAmount = amount;
  } else {
    config.activeBids.push({ itemId, allocatedAmount: amount });
  }
  await config.save();

  return newBid;
};
