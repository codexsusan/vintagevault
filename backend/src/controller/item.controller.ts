import { z } from "zod";
import Item from "../models/item.model";
import { ItemSchema } from "../schemas/items";
import { IRequest } from "../types";
import { Response, Request } from "express";

// Get all items with pagination
export const getAllItems = async (req: IRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  try {
    const items = await Item.find().skip(skip).limit(limit);
    const total = await Item.countDocuments();
    res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching items",
      error: (error as Error).message,
    });
  }
};

// Get a single item
export const getItemById = async (req: IRequest, res: Response) => {
  const itemId = req.params.id;
  try {
    const item = await Item.findById(itemId).populate("bids");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching item",
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
      adminId: req.user!.id,
      bids: [],
    };

    console.log(itemData);
    const newItem = new Item(itemData);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
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

// Update an item (admin only)
export const updateItem = async (req: IRequest, res: Response) => {
  try {
    const validatedItem = ItemSchema.parse(req.body);
    const itemData = {
      ...validatedItem,
      auctionEndTime: new Date(validatedItem.auctionEndTime),
    };
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, itemData, {
      new: true,
      runValidators: true,
    });
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
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
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
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
    res
      .status(500)
      .json({
        message: "Error searching items",
        error: (error as Error).message,
      });
  }
};