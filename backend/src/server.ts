import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { dbConnection } from "./connection";
import { PORT } from "./constants";
import { verifyToken } from "./middleware/auth.middleware";
import authRoutes from "./routes/auth.routes";
import itemRoutes from "./routes/item.routes";
import { IRequest } from "./types";

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
app.use("/api/items", itemRoutes);

app.get("/api/users", verifyToken, (req: IRequest, res) => {
  console.log(req.user);
  res.json({ message: "Hello World!" });
});

// Error handling
app.use("*", (_req: Request, res: Response): void => {
  res.status(404).send({ message: "Not found" });
});

app.use(
  (_err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    res.status(500).send({ message: "Something went wrong!" });
  }
);

app.listen(port, async () => {
  // Handle connection to database
  await dbConnection();
  return console.log(`Server running on port http://localhost:${port}`);
});
