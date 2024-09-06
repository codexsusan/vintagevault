import express from "express";
import { getUser, getUserBiddingHistory, updateProfilePicture, updateUser } from "../controller/user.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();
router.use(verifyToken);

// Update user profile picture
router.post("/update-profile", updateProfilePicture);

// Get user
router.get("/me", getUser);

// Update user info
router.put("/update-info", updateUser);

// Get user bidding history
router.get("/bidding-history", getUserBiddingHistory);

export default router;