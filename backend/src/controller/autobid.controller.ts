import { Response } from "express";
import AutoBidConfig, { IAutoBidConfig } from "../models/auto-bid.model";
import { AutoBidConfigSchema } from "../schemas/auto-bid-config";
import { IRequest } from "../types";
import Item from "../models/item.model";
// import { placeAutoBid } from "./bid.controller";
import Bid from "../models/bid.model";
import { startSession } from "mongoose";

export const setAutoBidConfig = async (req: IRequest, res: Response) => {
  try {
    const validatedConfig = AutoBidConfigSchema.parse(req.body);
    const userId = req.user!.id;

    let config = await AutoBidConfig.findOne({ userId });
    if (config) {
      config.maxBidAmount = validatedConfig.maxBidAmount;
      config.bidAlertPercentage = validatedConfig.bidAlertPercentage;

      // Adjust active bids if necessary
      const totalAllocated = config.getTotalAllocatedAmount();
      if (totalAllocated > validatedConfig.maxBidAmount) {
        // Reduce allocated amounts proportionally
        const reductionFactor = validatedConfig.maxBidAmount / totalAllocated;
        config.activeBids = config.activeBids.map((bid) => ({
          ...bid,
          allocatedAmount: Math.floor(bid.allocatedAmount * reductionFactor),
        }));
      }
    } else {
      config = new AutoBidConfig({
        userId,
        maxBidAmount: validatedConfig.maxBidAmount,
        bidAlertPercentage: validatedConfig.bidAlertPercentage,
        activeBids: [],
        status: "active",
      });
    }

    await config.save();
    res.json({
      success: true,
      message: "Auto-bid configured successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error setting auto-bid config",
      error: (error as Error).message,
    });
  }
};

export const getAutoBidConfig = async (req: IRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    // console.log(userId);
    const config = await AutoBidConfig.findOne({ userId });
    if (!config) {
      return res
        .status(400)
        .json({ message: "Auto-bid not configured for this user" });
    }
    res.json({
      success: true,
      message: "Auto-bid configuration fetched successfully.",
      data: {
        _id: config._id,
        userId: config.userId,
        maxBidAmount: config.maxBidAmount,
        bidAlertPercentage: config.bidAlertPercentage,
        activeBids: config.activeBids,
        totalAllocatedAmount: config.getTotalAllocatedAmount(),
        availableFunds: config.getAvailableFunds(),
        status: config.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching auto-bid config",
      error: (error as Error).message,
    });
  }
};

export const toggleAutoBid = async (req: IRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user!.id;
    const config = await AutoBidConfig.findOne({ userId });

    if (!config) {
      return res
        .status(404)
        .json({ message: "Auto-bid configuration not found" });
    }

    const existingBidIndex = config.activeBids.findIndex(
      (bid) => bid.itemId === itemId
    );
    if (existingBidIndex > -1) {
      // Remove the item from auto-bidding
      config.activeBids.splice(existingBidIndex, 1);
      await config.save();
      res.json({
        success: true,
        message: "Removed item from auto-bidding.",
      });
    } else {
      // Add the item for auto-bidding
      config.activeBids.push({ itemId, allocatedAmount: 0 });
      await config.save();
      res.json({
        success: true,
        message: "Added item for auto-bidding.",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error toggling auto-bid",
      error: (error as Error).message,
    });
  }
};

export const processAutoBids = async (
  itemId: string,
  currentBid: number,
  excludeUserId?: string
) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const item = await Item.findById(itemId).session(session);
    if (!item) {
      await session.abortTransaction();
      return;
    }

    let highestBid = currentBid;
    let bidPlaced = true;

    while (bidPlaced) {
      bidPlaced = false;

      const autoBidConfigs = await AutoBidConfig.find({
        "activeBids.itemId": itemId,
        userId: { $ne: excludeUserId },
        status: "active",
      })
        .sort({ createdAt: 1 })
        .session(session);

      for (const config of autoBidConfigs) {
        const newBidAmount = Math.min(highestBid + 1, config.maxBidAmount);

        if (
          config.canPlaceAutoBid(itemId, newBidAmount) &&
          newBidAmount > highestBid
        ) {
          if (new Date() <= item.auctionEndTime) {
            const newBid = new Bid({
              userId: config.userId,
              itemId: item._id,
              amount: newBidAmount,
              timestamp: new Date(),
              isAutoBid: true,
            });
            await newBid.save({ session });

            item.currentPrice = newBidAmount;
            item.bids.push(newBid._id);
            await item.save({ session });

            config.updateAllocatedAmount(itemId, newBidAmount);

            if (config.getAvailableFunds() === 0) {
              config.status = "paused";
              // TODO: Send notification that auto-bidding has stopped
              console.log(
                `Auto-bidding stopped for user ${config.userId} due to insufficient funds`
              );
            }

            await config.save({ session });

            highestBid = newBidAmount;
            bidPlaced = true;
            excludeUserId = config.userId;

            // Check if alert threshold is reached
            if (
              config.getTotalAllocatedAmount() / config.maxBidAmount >=
              config.bidAlertPercentage / 100
            ) {
              // TODO: Send notification to user
              console.log(
                `Alert: User ${config.userId} has reached ${config.bidAlertPercentage}% of their maximum bid amount`
              );
            }

            break; // Exit the loop after placing a bid
          }
        }
      }
    }

    await session.commitTransaction();
  } catch (error) {
    console.error("Error in processAutoBids:", error);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
};