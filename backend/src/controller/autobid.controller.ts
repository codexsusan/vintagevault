import { Request, Response } from "express";
import AutoBidConfig from "../models/auto-bid.model";
import { AutoBidConfigSchema } from "../schemas/auto-bid-config";
import { IRequest } from "../types";

export const setAutoBidConfig = async (req: IRequest, res: Response) => {
  try {
    const validatedConfig = AutoBidConfigSchema.parse(req.body);
    const userId = req.user!.id;

    let config = await AutoBidConfig.findOne({ userId });
    if (config) {
      config.maxBidAmount = validatedConfig.maxBidAmount;
      config.bidAlertPercentage = validatedConfig.bidAlertPercentage;
    } else {
      config = new AutoBidConfig({ ...validatedConfig, userId });
    }

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(400).json({
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
        .status(404)
        .json({ message: "Auto-bid configuration not found" });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({
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
    res.json(config);
  } catch (error) {
    res.status(400).json({
      message: "Error toggling auto-bid",
      error: (error as Error).message,
    });
  }
};
