import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/userModel.js";
import { z } from "zod";

// Validation schema for registration
const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerUser = async ({ name, email, password }) => {
  const result = registerSchema.safeParse({ name, email, password });
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  return {
    message: "User registered successfully",
    user: { id: user._id, name: user.name, email: user.email },
  };
};
export const loginUser = async ({ email, password }) => {
  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }
  const user = await User.findOne({
    email,
  });
  if (!user) {
    throw new Error("Invalid email or password");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_SECRET,
    {
      expiresIn: "1d",
    },
  );
  return {
    message: "Login successful",
    token,
    user: { id: user._id, name: user.name, email: user.email },
  };
};
