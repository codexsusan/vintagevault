import { Request, Response } from "express";
import { SortOrder } from "mongoose";
import { z } from "zod";
import { getPresignedUrl } from "../middleware/images.middleware";
import Item from "../models/item.model";
import { ItemSchema } from "../schemas/items";
import { IRequest } from "../types";
import Bid from "../models/bid.model";
import { IUser } from "../models/user.model";
import { getUserById } from "../data/user";
import AutoBidConfig from "../models/auto-bid.model";

export const getAllItems = async (req: IRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as SortOrder;

    let query = Item.find();

    if (search) {
      query = query.or([
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]);
    }

    if (sortBy === "price") {
      query = query.sort({ currentPrice: sortOrder });
    }

    // Execute the query
    const items = await query.skip(skip).limit(limit).select("-__v");
    const total = await Item.countDocuments(query.getFilter());

    const itemsWithPresignedUrl = await Promise.all(
      items.map(async (item) => {
        const presignedUrl = await getPresignedUrl(item.image);
        return { ...item.toObject(), image: presignedUrl };
      })
    );

    res.json({
      success: true,
      message: "Items fetched successfully",
      total,
      page,
      totalPages: Math.ceil(total / limit),
      items: itemsWithPresignedUrl,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching items",
      error: (error as Error).message,
    });
  }
};

// Create a new item (admin only)
export const createItem = async (req: IRequest, res: Response) => {
  try {
    const validatedItem = ItemSchema.parse(req.body);
    const itemData = {
      ...validatedItem,
      auctionEndTime: new Date(validatedItem.auctionEndTime),
      currentPrice: validatedItem.startingPrice,
      adminId: req.user!.userId,
      highestBid: null,
      bids: [],
    };

    const newItem = new Item(itemData);
    await newItem.save();
    res.status(201).json({
      message: "Item created successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    } else {
      res.status(400).json({
        message: "Error creating item",
        error: (error as Error).message,
      });
    }
  }
};

// Get a single item
export const getItemById = async (req: IRequest, res: Response) => {
  const itemId = req.params.id;
  const currentUserId = req.user!.userId;
  try {
    const item = await Item.findById(itemId).select("-__v");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // If there are no bids, returning an empty array instead of null
    item.bids = item.bids || [];

    const presignedUrl = await getPresignedUrl(item.image);
    let itemWithPresignedUrl = {
      ...item.toObject(),
      image: presignedUrl,
      imageKey: item.image,
    };

    if (item.awarded) {
      const highestBid = await Bid.findById(item.highestBid);
      const highestBidder = await getUserById(highestBid!.userId);

      const finalItemData = {
        ...itemWithPresignedUrl,
        user: {
          _id: highestBidder!._id,
          name: highestBidder!.name,
          isWinner: highestBid!.userId === currentUserId,
        },
      };
      return res.json({
        success: true,
        message: "Item fetched successfully",
        item: finalItemData,
      });
    }

    res.json({
      success: true,
      message: "Item fetched successfully",
      item: itemWithPresignedUrl,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching item",
      error: (error as Error).message,
    });
  }
};

export const getItemBiddingHistory = async (req: IRequest, res: Response) => {
  const itemId = req.params.id;
  try {
    // Fetch item bidding history from the database in such a way that latest one is first
    const biddingHistory = await Bid.find({ itemId })
      .sort({ timestamp: -1 })
      .select("-__v");

    const biddingHistoryWithUserData = await Promise.all(
      biddingHistory.map(async (bid) => {
        const user = await getUserById(bid.userId);
        // const userData = user!.toObject();
        return {
          _id: bid._id,
          itemId: bid.itemId,
          amount: bid.amount,
          timestamp: bid.timestamp,
          isAutoBid: bid.isAutoBid,
          user: {
            _id: user!._id,
            email: user!.email,
            name: user!.name,
          },
        };
      })
    );

    res.json({
      message: "Item bidding history fetched successfully",
      success: true,
      data: biddingHistoryWithUserData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching item",
      error: (error as Error).message,
    });
  }
};

// Update an item (admin only)
export const updateItem = async (req: IRequest, res: Response) => {
  try {
    const validatedItem = ItemSchema.parse(req.body);

    const itemData = {
      ...validatedItem,
      // currentPrice: validatedItem.startingPrice,
      auctionEndTime: new Date(validatedItem.auctionEndTime),
    };
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, itemData, {
      new: true,
      runValidators: true,
    }).select("-__v");
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const presignedUrl = await getPresignedUrl(updatedItem.image);
    const updatedItemWithPresignedUrl = {
      ...updatedItem.toObject(),
      image: presignedUrl,
    };

    res.json({
      success: true,
      message: "Item updated successfully",
      // item: updatedItemWithPresignedUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    } else {
      res.status(400).json({
        message: "Error updating item",
        error: (error as Error).message,
      });
    }
  }
};

// Delete an item (admin only)
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    await Bid.deleteMany({ itemId: req.params.id });
    await AutoBidConfig.deleteMany({ itemId: req.params.id });
    if (!deletedItem) {
      return res
        .status(404)
        .json({ message: "Item not found", success: false });
    }
    res.json({ message: "Item deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting item",
      error: (error as Error).message,
    });
  }
};

export const searchItems = async (req: IRequest, res: Response) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(query as string, "i");
    const items = await Item.find({
      $or: [{ name: searchRegex }, { description: searchRegex }],
    })
      .skip(skip)
      .limit(limit);

    const total = await Item.countDocuments({
      $or: [{ name: searchRegex }, { description: searchRegex }],
    });

    res.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching items",
      error: (error as Error).message,
    });
  }
};

// export const endAuction = async (itemId: string) => {
//   const item = await Item.findById(itemId);
//   if (!item) return;

//   const bids = await Bid.find({ itemId }).sort({ amount: -1 });
//   const winningBid = bids[0];

//   // Release funds for all bidders except the winner
//   for (const bid of bids.slice(1)) {
//     await releaseAutoBidFunds(bid.userId, itemId, bid.amount);
//   }

//   // TODO: Update item status
//   // item.status = "closed";
//   // item.winnerId = winningBid.userId;
//   await item.save();

//   // TODO: Notify winner and other bidders
// };
