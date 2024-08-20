import { Request } from "express";

export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "user";
}

export interface IRequest extends Request {
  user?: {
    username: string;
    role: "admin" | "user";
    id: string;
  };
}

