import express from "express";
import {
    createItem,
    deleteItem,
    getAllItems,
    getItemBiddingHistory,
    getItemById,
    searchItems,
    updateItem,
} from "../controller/item.controller";
import { isAdmin, verifyToken } from "../middleware/auth.middleware";

const router = express.Router();
router.use(verifyToken);

// Get all items with pagination
router.get("/", getAllItems);

// Search all items with pagination
router.get("/search", searchItems);

// Get a single item
router.get("/:id", getItemById);

// Get item bidding history
router.get("/:id/bidding-history", getItemBiddingHistory);

// Create a new item (admin only)
router.post("/", isAdmin, createItem);

// Update an item (admin only)
router.put("/:id", isAdmin, updateItem);

// Delete an item (admin only)
router.delete("/:id", isAdmin, deleteItem);

export default router;
