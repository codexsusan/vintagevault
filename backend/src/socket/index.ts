import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";
import { ISocket } from "../types";

let io: Server | null = null;


export const initSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };
      (socket as any).user = decoded; // Attach the decoded user info to the socket
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: ISocket) => {
    console.log(`User connected: ${socket.user?.email}`);

    // Listen for 'test-event' from the frontend
    socket.on("test-event", (data) => {
      console.log("Test event received with message:", data.message);
      // You can broadcast the message to other clients, or just log it
      // socket.broadcast.emit("test-event-response", data);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user?.email}`);
    });
  });

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};