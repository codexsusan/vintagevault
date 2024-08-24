import { Request, Response, NextFunction } from "express";
import { IRequest, User } from "../types";
import jwt from "jsonwebtoken";
import { hardcodedUsers, JWT_SECRET } from "../constants";


export const login = (req: IRequest, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  const user = hardcodedUsers.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    const token = jwt.sign(
      { username: user.username, role: user.role, id: user.id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, role: user.role });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export function getUserById(userId: string): User | undefined {
  return hardcodedUsers.find((user) => user.id === userId);
}
