import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cron from "node-cron";
import { dbConnection } from "./connection";
import { PORT } from "./constants";
import authRoutes from "./routes/auth.routes";
import autoBidRoutes from "./routes/auto-bid.routes";
import bidRoutes from "./routes/bid.routes";
import imagesRoutes from "./routes/images.routes";
import itemRoutes from "./routes/item.routes";
import { IRequest } from "./types";
import { createServer } from "http"; // Import the HTTP server
import { Server } from "socket.io"; // Import Socket.IO
import { checkAuctionsStatus } from "./lib/auction";
import "./models/auto-bid.model";
import "./models/bid.model";
import "./models/item.model";
import Item from "./models/item.model";
import invoiceRoutes from "./routes/invoice.routes";
import userRoutes from "./routes/user.routes";
import { handlePDFGenerationAndUpload } from "./utils/invoicePdfGenerator";
import { loadPDFTemplate } from "./utils/pdfTemplateLoader";
import { initSocket } from "./socket";

const app = express();
const server = createServer(app);

initSocket(server);


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
app.use("/api/invoices", invoiceRoutes);

app.get("/api/test", (req: IRequest, res) => {
  console.log(req.user);
  res.json({ message: "Hello World!" });
});

cron.schedule("* * * * *", checkAuctionsStatus);

// Error handling
app.use("*", (_req: Request, res: Response): void => {
  res.status(404).send({ message: "Not found" });
});

app.use(
  (_err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error(_err);
    res.status(500).send({ message: "Something went wrong!" });
  }
);

server.listen(port, async () => {
  // Handle connection to database
  await dbConnection();
  return console.log(`Server running on port http://localhost:${port}`);
});
