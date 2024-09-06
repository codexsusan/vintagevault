import express from "express";
import { downloadInvoice, getInvoiceByItemId } from "../controller/invoice.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.use(verifyToken);

router.get("/:itemId", getInvoiceByItemId);

router.get("/download/:invoiceId", downloadInvoice);

export default router;
