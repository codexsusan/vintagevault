import express from "express";
import { getUserBiddingHistory, updateProfilePicture } from "../controller/user.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();
router.use(verifyToken);

// Update user profile picture
router.post("/update-profile", updateProfilePicture);

// Get user bidding history
router.get("/bidding-history", getUserBiddingHistory);

export default router;