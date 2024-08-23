import { Response } from "express";
import { BidSchema } from "../schemas/bid";
import Item from "../models/item.model";
import Bid, { IBid } from "../models/bid.model";
import { IRequest } from "../types";
import { processAutoBids } from "./autobid.controller";
import AutoBidConfig from "../models/auto-bid.model";

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

    // Check if the user has auto-bidding enabled
    const autoBidConfig = await AutoBidConfig.findOne({ userId: req.user?.id });
    if (
      autoBidConfig &&
      autoBidConfig.activeBids.some((bid) => bid.itemId === validatedBid.itemId)
    ) {
      if (validatedBid.amount > autoBidConfig.maxBidAmount) {
        return res.status(400).json({
          message: "Please increase your maximum auto-bid amount.",
        });
      }
    }
    // If auto-bid is enabled, update the allocated amount
    if (
      autoBidConfig &&
      autoBidConfig.activeBids.some((bid) => bid.itemId === validatedBid.itemId)
    ) {
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
      await autoBidConfig.save();
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
) => {
  const config = await AutoBidConfig.findOne({ userId });
  if (
    !config ||
    !config.canPlaceAutoBid(itemId, amount) ||
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
