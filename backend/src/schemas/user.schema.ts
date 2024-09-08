import { z } from "zod";

export const RegisterUserSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    userType: z.string(),
});


export const LoginUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const UpdateUserSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    bio: z.string().min(0),
});