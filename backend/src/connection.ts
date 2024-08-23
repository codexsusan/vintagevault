import mongoose from "mongoose";
import { DATABASE_URL } from "./constants";

const env = {
  dev: `${DATABASE_URL}/development`,
  test: `${DATABASE_URL}/test`,
  prod: `${DATABASE_URL}/production`,
};

export const dbConnection = async () => {
  // TODO: Change this to during submission
  const dbString: string = env["dev"] as string;

  console.log(dbString);

  console.log("Connecting to database ...");
  try {
    await mongoose.connect(dbString).then(() => {
      console.log("Connected to database");
    });
  } catch (error) {
    console.log("Database connection failed");
    console.log(error);
  }
};
