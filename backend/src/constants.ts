import { User } from "./types";

// App
export const PORT = process.env.PORT || 3500;

// Database
export const DATABASE_URL = process.env.DATABASE_URL;

// JWT
export const JWT_SECRET: string = process.env.JWT_SECRET!;

// Bucket Details
export const BUCKET_ACCESS_KEY = process.env.BUCKET_ACCESS_KEY;
export const BUCKET_BUCKET_NAME = process.env.BUCKET_BUCKET_NAME;
export const BUCKET_ENDPOINT = process.env.BUCKET_ENDPOINT;
export const BUCKET_REGION = process.env.BUCKET_REGION;
export const BUCKET_SECRET_ACCESS_KEY = process.env.BUCKET_SECRET_ACCESS_KEY;

// Email: Resend
export const FROM_ADDRESS = process.env.FROM_ADDRESS;
export const RESEND_SECRET = process.env.RESEND_SECRET;

export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12");


export const hardcodedUsers: User[] = [
  {
    id: "1234567890",
    name: "Abhi",
    email: "",
    username: "admin1",
    password: "admin1",
    role: "admin",
  },
  {
    id: "0987654321",
    name: "Sujit",
    email: "",
    username: "admin2",
    password: "admin2",
    role: "admin",
  },
  {
    id: "5432167890",
    name: "Susan",
    email: "susankhadka708@gmail.com",
    username: "user1",
    password: "user1",
    role: "user",
  },
  {
    id: "6789054321",
    name: "Kaushal",
    email: "sushatkhadka987@gmail.com",
    username: "user2",
    password: "user2",
    role: "user",
  },
];