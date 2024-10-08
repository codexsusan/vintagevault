import express from "express";
import {
  setAutoBidConfig,
  getAutoBidConfig,
  toggleAutoBid,
  toggleAutoBidStatus,
} from "../controller/autobid.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/config", verifyToken, setAutoBidConfig);
router.get("/config", verifyToken, getAutoBidConfig);
router.post("/toggle/:itemId", verifyToken, toggleAutoBid);


router.put("/toggle-activate", verifyToken, toggleAutoBidStatus);

export default router;
