import axios from "axios";
import { getPresignedUrl } from "../middleware/images.middleware";
import Invoice from "../models/invoice.model";
import { IRequest } from "../types";
import { Response } from "express";

export const getInvoiceByItemId = async (req: IRequest, res: Response) => {
  const userId = req.user!.userId;
  const itemId = req.params.itemId;

  try {
    const invoice = await Invoice.findOne({ itemId, userId });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const getInvoicePresignedUrl = await getPresignedUrl(
      invoice.invoiceKey,
      3600 * 3
    );

    return res.json({
      success: true,
      message: "Invoice fetched successfully",
      data: {
        _id: invoice._id,
        itemId: invoice.itemId,
        userId: invoice.userId,
        amount: invoice.amount,
        timestamp: invoice.timestamp,
        invoiceUrl: getInvoicePresignedUrl,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error fetching invoice",
      error: (error as Error).message,
    });
  }
};

export const downloadInvoice = async (req: IRequest, res: Response) => {
  const userId = req.user!.userId;
  const invoiceId = req.params.invoiceId;

  try {
    // Find the invoice
    const invoice = await Invoice.findOne({ _id: invoiceId, userId });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Get the presigned URL
    const presignedUrl = await getPresignedUrl(invoice.invoiceKey, 60); 

    // Fetch the file content
    const response = await axios.get(presignedUrl, {
      responseType: "arraybuffer",
    });

    // Set headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoiceId}.pdf`
    );

    // Send the file
    return res.send(Buffer.from(response.data, "binary"));
  } catch (error) {
    console.error("Error downloading invoice:", error);
    return res.status(500).json({
      success: false,
      message: "Error downloading invoice",
      error: (error as Error).message,
    });
  }
};
