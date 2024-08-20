import { Request, Response, NextFunction } from "express";
import { IRequest, User } from "../types";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";

export const verifyToken = (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      username: string;
      role: string;
      id: string;
    };
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req: IRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user!.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
};
