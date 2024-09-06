import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cron from "node-cron";
import PDFDocument from "pdfkit";
import { dbConnection } from "./connection";
import { PORT } from "./constants";
import authRoutes from "./routes/auth.routes";
import autoBidRoutes from "./routes/auto-bid.routes";
import bidRoutes from "./routes/bid.routes";
import imagesRoutes from "./routes/images.routes";
import itemRoutes from "./routes/item.routes";
import { IRequest } from "./types";

import { checkAuctionsStatus } from "./lib/auction";
import "./models/auto-bid.model";
import "./models/bid.model";
import "./models/item.model";
import userRoutes from "./routes/user.routes";
import Item from "./models/item.model";
import { loadPDFTemplate } from "./utils/pdfTemplateLoader";
import { handlePDFGenerationAndUpload } from "./utils/invoicePdfGenerator";

const app = express();
const port = PORT || 3000;

app.use(cors());

// Middlewares
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/auto-bid", autoBidRoutes);
app.use("/api/images", imagesRoutes);

app.get("/api/test", (req: IRequest, res) => {
  console.log(req.user);
  res.json({ message: "Hello World!" });
});

app.get("/generate-pdf", async (req, res) => {
  try {
    const item = await Item.findOne({
      auctionEndTime: { $lte: new Date() },
    });

    const invoiceNumber = Math.floor(Math.random() * 1000000).toString();

    const htmlContent = await loadPDFTemplate("invoiceTemplate", {
      INVOICE_NUMBER: invoiceNumber,
      INVOICE_DATE: new Date().toLocaleDateString(),
      TOTAL_AMOUNT: item?.currentPrice.toString()!,
      ITEM_NAME: item?.name!,
      ITEM_AMOUNT: item?.currentPrice.toString()!,
      TO_NAME: "Susan Khadka",
    });

    const { fileKey, presignedUrl } = await handlePDFGenerationAndUpload(
      htmlContent,
      `invoice-${invoiceNumber}.pdf`
    );

    res.json({
      success: true,
      message: "PDF generated successfully",
      fileKey,
      presignedUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating PDF",
      error: (error as Error).message,
    });
  }
});

// Error handling
app.use("*", (_req: Request, res: Response): void => {
  res.status(404).send({ message: "Not found" });
});

cron.schedule("* * * * *", checkAuctionsStatus);

app.use(
  (_err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error(_err);
    res.status(500).send({ message: "Something went wrong!" });
  }
);

app.listen(port, async () => {
  // Handle connection to database
  await dbConnection();
  return console.log(`Server running on port http://localhost:${port}`);
});
