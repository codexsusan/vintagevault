import { Response } from "express";
import AutoBidConfig, { IAutoBidConfig } from "../models/auto-bid.model";
import { AutoBidConfigSchema } from "../schemas/auto-bid-config";
import { IRequest } from "../types";
import Item from "../models/item.model";
import { placeAutoBid } from "./bid.controller";

export const setAutoBidConfig = async (req: IRequest, res: Response) => {
  try {
    const validatedConfig = AutoBidConfigSchema.parse(req.body);
    const userId = req.user!.id;

    let config = await AutoBidConfig.findOne({ userId });
    if (config) {
      config.maxBidAmount = validatedConfig.maxBidAmount;
      config.bidAlertPercentage = validatedConfig.bidAlertPercentage;

      // Adjust active bids if necessary
      const totalAllocated = config.getTotalReservedAmount();
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
        totalReservedAmount: config.getTotalReservedAmount(),
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
  const item = await Item.findById(itemId);
  if (!item) return;

  let highestBid = currentBid;
  let bidPlaced = true;
  let lastBidder: string | undefined = excludeUserId;

  while (bidPlaced) {
    bidPlaced = false;

    const autoBidConfigs = await AutoBidConfig.find({
      "activeBids.itemId": itemId,
      userId: { $ne: lastBidder },
      status: "active",
    }).sort({ createdAt: 1 });

    for (const config of autoBidConfigs) {
      const newBidAmount = Math.min(highestBid + 1, config.maxBidAmount);

      if (config.canPlaceAutoBid(itemId, newBidAmount)) {
        // Place auto-bid
        const newBid = await placeAutoBid(config.userId, itemId, newBidAmount);

        if (newBid) {
          // Update the allocated amount for this item
          const itemBidIndex = config.activeBids.findIndex(
            (bid) => bid.itemId === itemId
          );
          if (itemBidIndex !== -1) {
            config.activeBids[itemBidIndex].allocatedAmount = newBidAmount;
          } else {
            config.activeBids.push({ itemId, allocatedAmount: newBidAmount });
          }

          highestBid = newBidAmount;
          bidPlaced = true;
          lastBidder = config.userId;

          // Check if alert threshold is reached
          if (
            config.getTotalReservedAmount() / config.maxBidAmount >=
            config.bidAlertPercentage / 100
          ) {
            // TODO: Send notification to user
            console.log(
              `Alert: User ${config.userId} has reached ${config.bidAlertPercentage}% of their maximum bid amount`
            );
          }

          // Check if max bid amount is reached
          if (
            config.getAvailableFunds() === 0 ||
            newBidAmount >= config.maxBidAmount
          ) {
            config.status = "paused";
            // TODO: Send notification that auto-bidding has stopped
            console.log(
              `Auto-bidding stopped for user ${config.userId} due to insufficient funds`
            );
          }

          await config.save();
          break; // Exit the loop after placing a bid
        }
      }
    }
  }

  // Update the item's current price
  if (highestBid > currentBid) {
    item.currentPrice = highestBid;
    await item.save();
  }
};
