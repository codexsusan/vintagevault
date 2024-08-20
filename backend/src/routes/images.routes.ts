import express from "express";
import { verifyToken } from "../middleware/auth.middleware";
import upload from "../middleware/images.middleware";
import { uploadSingleImage } from "../controller/images.controller";

const router = express.Router();

router.use(verifyToken);
router.post("/single", upload.single("images"), uploadSingleImage);

export default router;
