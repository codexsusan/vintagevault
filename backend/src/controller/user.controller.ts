import { Response } from "express";
import { getPresignedUrl } from "../middleware/images.middleware";
import Bid, { IBid } from "../models/bid.model";
import Item from "../models/item.model";
import User from "../models/user.model";
import { IRequest } from "../types";
import { UpdateUserSchema } from "../schemas/user.schema";
import Invoice from "../models/invoice.model";

export const updateProfilePicture = async (req: IRequest, res: Response) => {
  const { profilePicture } = req.body;
  const userId = req.user!.userId;
  try {
    // TODO: Update user profile picture

    await User.updateOne({ _id: userId }, { profilePicture });
    res.json({
      success: true,
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating profile picture",
      error: (error as Error).message,
    });
  }
};

export const getUser = async (req: IRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User fetched successfully",
      data: {
        _id: user._id,
        email: user.email,
        bio: user.bio,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error fetching user",
      error: (error as Error).message,
    });
  }
};

export const updateUser = async (req: IRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const validatedData = UpdateUserSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
        error: validatedData.error.issues,
      });
    }

    const { name, email, bio } = validatedData.data;

    await User.updateOne({ _id: userId }, { name, email, bio });

    res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating user",
      error: (error as Error).message,
    });
  }
};

export const getUserBiddingHistory = async (req: IRequest, res: Response) => {
  const userId = req.user!.userId;
  const { status } = req.query; // The status filter from query params

  try {
    const biddingHistory = await Bid.find({ userId }).sort({ timestamp: -1 });

    // Grouping bids by itemId
    const bidsByItemId: { [key: string]: IBid[] } = {};
    biddingHistory.forEach((bid) => {
      if (!bidsByItemId[bid.itemId]) {
        bidsByItemId[bid.itemId] = [];
      }
      bidsByItemId[bid.itemId].push(bid);
    });

    // Fetching item details for each item
    const biddingHistoryWithItems = await Promise.all(
      Object.keys(bidsByItemId).map(async (itemId) => {
        const item = await Item.findById(itemId);
        if (!item) {
          return null;
        }

        let itemStatus: BiddingHistoryResponse["status"] = "in-progress"; // Default status
        const highestBid = await Bid.findById(item.highestBid);
        const presignedUrl = await getPresignedUrl(item.image);

        // Base result object
        const result = {
          _id: item._id,
          name: item.name,
          description: item.description,
          startingPrice: item.startingPrice,
          currentPrice: item.currentPrice,
          auctionEndTime: item.auctionEndTime,
          image: presignedUrl,
          awarded: item.awarded,
          status: itemStatus,
          invoice: null,
          bids: bidsByItemId[itemId].map((bid) => ({
            _id: bid._id,
            amount: bid.amount,
            timestamp: bid.timestamp,
            isAutoBid: bid.isAutoBid,
          })),
        };

        let finalResult: BiddingHistoryResponse = result;

        // Check if the item is awarded and determine the status
        if (item.awarded) {
          if (highestBid?.userId === userId) {
            // User has won this item
            itemStatus = "won" as BiddingHistoryResponse['status'];
            const invoice = await Invoice.findOne({
              itemId: item._id,
              userId,
            });
            const invoiceUrl = await getPresignedUrl(
              invoice?.invoiceKey!,
              3600
            );
            finalResult = {
              ...result,
              status: itemStatus,
              invoice: {
                _id: invoice?._id!,
                url: invoiceUrl,
              },
            };
          } else {
            itemStatus = "lost";
            finalResult = {
              ...result,
              status: itemStatus,
            };
          }
        }

        // Apply status filter
        if (status && status !== itemStatus) {
          return null; // Skip this item if it doesn't match the filter
        }

        return finalResult;
      })
    );

    // Filter out null values (items that didn't match the status filter)
    const filteredBiddingHistory = biddingHistoryWithItems.filter(
      (item) => item !== null
    );

    res.json({
      success: true,
      message: "User bidding history fetched successfully",
      data: filteredBiddingHistory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error fetching user bidding history",
      error: (error as Error).message,
    });
  }
};

type BiddingHistoryResponse = {
  _id: string;
  name: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  auctionEndTime: Date;
  image: string;
  awarded: boolean;
  status: "in-progress" | "won" | "lost";
  invoice: {
    _id: string;
    url: string;
  } | null;
  bids: {
    _id: string;
    amount: number;
    timestamp: Date;
    isAutoBid: boolean;
  }[];
};
