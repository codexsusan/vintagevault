import { Request } from "express";
import { Readable } from "node:stream";

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

export interface FileTransfer {
  location?: string;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  stream: Readable;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
  key?: string;
}