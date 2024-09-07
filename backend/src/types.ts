import { Request } from "express";
import { Readable } from "node:stream";
import { Socket } from "socket.io";

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export interface IRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: "admin" | "user";
  };
}

export interface ISocket extends Socket {
  user?: {
    userId: string;
    email: string;
    role: "admin" | "user";
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

export type TemplateData = Record<string, string>;
