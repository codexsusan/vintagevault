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
    } else {
      config = new AutoBidConfig({
        ...validatedConfig,
        userId,
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
        reservedAmount: config.reservedAmount,
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

    const index = config.activeBids.indexOf(itemId);
    if (index > -1) {
      config.activeBids.splice(index, 1);
    } else {
      config.activeBids.push(itemId);
    }

    await config.save();
    res.json({
      success: true,
      message: "Added item for auto-bidding.",
    });
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

  const autoBidConfigs = await AutoBidConfig.find({
    activeBids: itemId,
    userId: { $ne: excludeUserId },
    status: "active",
  }).sort({ createdAt: 1 });

  let highestBid = currentBid;
  let bidPlaced = false;

  do {
    bidPlaced = false;
    for (const config of autoBidConfigs) {
      const newBidAmount = highestBid + 1;

      if (config.canPlaceAutoBid(newBidAmount)) {
        // Place auto-bid
        const newBid = await placeAutoBid(config.userId, itemId, newBidAmount);

        // Update reserved amount
        config.reservedAmount += newBidAmount;
        await config.save();

        highestBid = newBidAmount;
        bidPlaced = true;

        // Check if alert threshold is reached
        if (
          config.reservedAmount / config.maxBidAmount >=
          config.bidAlertPercentage / 100
        ) {
          // TODO: Send notification to user
          console.log(
            `Alert: User ${config.userId} has reached ${config.bidAlertPercentage}% of their maximum bid amount`
          );
        }

        // Check if max bid amount is reached
        if (config.reservedAmount >= config.maxBidAmount) {
          config.activeBids = config.activeBids.filter(
            (id) => id.toString() !== itemId
          );
          await config.save();
          // TODO: Send notification that auto-bidding has stopped for this item
          console.log(
            `Auto-bidding stopped for user ${config.userId} on item ${itemId}`
          );
        }

        break; // Exit the loop after placing a bid
      }
    }
  } while (bidPlaced);
};
