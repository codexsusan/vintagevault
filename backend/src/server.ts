import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { dbConnection } from "./connection";
import { PORT } from "./constants";

const app = express();
const port = PORT || 3000;

app.use(cors());

// Middlewares
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  // Handle connection to database
  await dbConnection();
  return console.log(`Server running on port http://localhost:${port}`);
});
