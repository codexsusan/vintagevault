import { Request, Response } from "express";
import { BidSchema } from "../schemas/bid";
import Item, { IItem } from "../models/item.model";
import Bid from "../models/bid.model";

export const placeBid = async (req: Request, res: Response) => {
  try {
    const validatedBid = BidSchema.parse(req.body);
    const item = (await Item.findById(
      validatedBid.itemId
    ).lean());

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (new Date() > item.auctionEndTime) {
      return res.status(400).json({ message: "Auction has ended" });
    }

    if (validatedBid.amount <= item.currentPrice) {
      return res
        .status(400)
        .json({ message: "Bid must be higher than current price" });
    }

    const bidData = {
      ...validatedBid,
    };

    const newBid = new Bid(validatedBid);
    await newBid.save();

    await Item.findByIdAndUpdate(item._id, {
      $set: { currentPrice: validatedBid.amount, $push: { bids: newBid._id } },
    });

    res.status(201).json(newBid);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error placing bid", error: (error as Error).message });
  }
};

export const getBidsForItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.itemId;
    const bids = await Bid.find({ item: itemId }).sort("-amount");
    res.json(bids);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching bids",
      error: (error as Error).message,
    });
  }
};
