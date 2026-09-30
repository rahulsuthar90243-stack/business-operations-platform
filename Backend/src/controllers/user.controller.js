import { userModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashPass,
      role: "customer",
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    );

    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
    });

    res.status(201).json({
      message: "User Register Successfully",
      id: user._id,
      username: user.username,
      email: user.email,
      password: "********",
      role: user.role,
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // user find
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // password compare
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // generate jwt

    if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
    }
    const token2 = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    );

     res.cookie("token", token2, {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "strict"
});

    return res.status(200).json({
      message: "Login Successfully",
      id: user._id,
      username: user.username,
      email: user.email,
      password: "********",
      role: user.role
});

  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};
