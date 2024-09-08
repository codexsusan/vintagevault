import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { hardcodedUsers, JWT_SECRET, SALT_ROUNDS } from "../constants";
import { getUserByEmail } from "../data/user";
import User from "../models/user.model";
import { LoginUserSchema, RegisterUserSchema } from "../schemas/user.schema";
import { IRequest } from "../types";

export const registerUser = async (req: Request, res: Response) => {
  const validation = RegisterUserSchema.safeParse(req.body);

  if(!validation.success){
    return res.status(400).json({
      message: "Invalid request body",
      success: false,
    });
  }

  const { name, email, password, userType } = validation.data;

  try {
    const fetchedUser = await getUserByEmail(email);

    if (fetchedUser) {
      return res.status(400).json({
        message: "Email is already in use.",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      email,
      profilePicture: "",
      name,
      userType,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!", success: false });
  }
};

export const loginUser = async (req: Request, res: Response) => {

  const validation = LoginUserSchema.safeParse(req.body);
  if(!validation.success){
    return res.status(400).json({
      message: "Invalid request body",
      success: false,
    });
  }

  const { email, password } = validation.data;
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid Credentials", success: false });
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid Credentials", success: false });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.userType }, 
      JWT_SECRET, 
      {
        expiresIn: "7d",
      }
    );

    await user.save();

    return res.status(200).json({
      message: "Login Successful",
      success: true,
      token,
      userType: user.userType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!", success: false });
  }
};



