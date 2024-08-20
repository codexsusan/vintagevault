import express from "express";

import { placeBid, getBidsForItem } from "../controller/bid.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", verifyToken, placeBid);
router.get("/item/:itemId", getBidsForItem);

export default router;