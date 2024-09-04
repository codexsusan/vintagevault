import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { dbConnection } from "./connection";
import { PORT } from "./constants";
import { verifyToken } from "./middleware/auth.middleware";
import authRoutes from "./routes/auth.routes";
import itemRoutes from "./routes/item.routes";
import bidRoutes from "./routes/bid.routes";
import autoBidRoutes from "./routes/auto-bid.routes";
import imagesRoutes from "./routes/images.routes";
import { IRequest } from "./types";
import cron from "node-cron";
import PDFDocument from "pdfkit";

import "./models/item.model";
import "./models/bid.model";
import "./models/auto-bid.model";
import { checkAuctionsStatus } from "./lib/auction";
import userRoutes from "./routes/user.routes";

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

app.get("/api/test", verifyToken, (req: IRequest, res) => {
  console.log(req.user);
  res.json({ message: "Hello World!" });
});

app.get("/generate-pdf", (req, res) => {
  try {
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=dummy.pdf");

    doc.pipe(res);

    doc.fontSize(25).text("Hello from PDFKit!", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(16)
      .text("This is a dummy PDF file generated for testing purposes.");

    doc.end();
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
