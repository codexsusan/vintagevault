import { Request, Response, NextFunction } from "express";
import { IRequest, User } from "../types";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";

const hardcodedUsers: User[] = [
  { id: "1234567890", username: "admin1", password: "admin1", role: "admin" },
  { id: "0987654321", username: "admin2", password: "admin2", role: "admin" },
  { id: "5432167890", username: "user1", password: "user1", role: "user" },
  { id: "6789054321", username: "user2", password: "user2", role: "user" },
];

export const login = (req: IRequest, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  const user = hardcodedUsers.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    const token = jwt.sign(
      { username: user.username, role: user.role, id: user.id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, role: user.role });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};
