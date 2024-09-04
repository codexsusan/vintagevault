import { Response } from "express";
import { getPresignedUrl } from "../middleware/images.middleware";
import Bid, { IBid } from "../models/bid.model";
import Item from "../models/item.model";
import User from "../models/user.model";
import { IRequest } from "../types";

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

export const getUserBiddingHistory = async (req: IRequest, res: Response) => {
  const userId = req.user!.userId;
  const { status } = req.query;
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

    //  Fetcihng item details for each items 
    const biddingHistoryWithItems = await Promise.all(
      Object.keys(bidsByItemId).map(async (itemId) => {
        const item = await Item.findById(itemId);
        if (!item) {
          return null; // TODO: Need to check for this don't forget to handle it
        }

        // Fetch the highest bid for the item to determine the bid status
        const highestBid = await Bid.findById(item.highestBid);
        let itemStatus = "in-progress";
        if (item.awarded) {
          if (highestBid?.userId === userId) {
            itemStatus = "won";
            // TODO: If user won then bill also should be generated.
          } else {
            itemStatus = "lost";
          }
        }

        // If a status filter is provided, check if the item matches the filter
        if (status && status !== itemStatus) {
          return null; // Skip this item as it doesn't match the status filter
        }

        const presignedUrl = await getPresignedUrl(item.image);

        // Return the item data with the user's bids for this item
        return {
          _id: item._id,
          name: item.name,
          description: item.description,
          startingPrice: item.startingPrice,
          currentPrice: item.currentPrice,
          auctionEndTime: item.auctionEndTime,
          image: presignedUrl,
          awarded: item.awarded,
          status: itemStatus,
          bids: bidsByItemId[itemId].map((bid) => ({
            _id: bid._id,
            amount: bid.amount,
            timestamp: bid.timestamp,
            isAutoBid: bid.isAutoBid,
          })),
        };
      })
    );

    // Filter out any null items (if an item was not found or if the item doesn't match the status filter)
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

