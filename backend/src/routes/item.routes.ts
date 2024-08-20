import express from "express";
import Item from "../models/item.model";
import { ItemSchema } from "../schemas/items";
import { isAdmin, verifyToken } from "../middleware/auth.middleware";
import { z } from "zod";
import { createItem, deleteItem, getAllItems, getItemById, updateItem } from "../controller/item.controller";

const router = express.Router();
router.use(verifyToken);

// Get all items with pagination
router.get("/", getAllItems);

// Get a single item
router.get("/:id", getItemById);

// Create a new item (admin only)
router.post("/", isAdmin, createItem);

// Update an item (admin only)
router.put("/:id", isAdmin, updateItem);

// Delete an item (admin only)
router.delete('/:id', isAdmin,deleteItem);

export default router;
