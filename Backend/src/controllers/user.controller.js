import { userModel } from "../models/user.model.js";
import company from "../models/company.model.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import bcrypt from "bcrypt";
import crypto from "crypto";

// 1. REQUEST ACCESS
export const requestAccess = async (req, res) => {
  try {
    const { username, email, workspaceCode } = req.body;

    if (!username?.trim() || !email?.trim() || !workspaceCode?.trim()) {
      return res.status(400).json({
        message: "Username, email and workspace code are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find company
    const existingCompany = await company.findOne({
      workspaceCode: workspaceCode.trim(),
    });

    if (!existingCompany) {
      return res.status(404).json({
        message: "Invalid workspace code.",
      });
    }

    // Check existing user in this company
    const existingUser = await userModel.findOne({
      email: normalizedEmail,
      companyId: existingCompany._id,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An access request or account already exists.",
        status: existingUser.status,
      });
    }

    // Generate an unknown random password until user sets their own
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Save directly in User collection
    const user = await userModel.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      companyId: existingCompany._id,
      role: "customer",
      status: "pending",
      isOnline: false,
      lastSeen: new Date(),
    });

    return res.status(201).json({
      message: "Access request submitted successfully.",
      userId: user._id,
      status: user.status,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this unique field already exists.",
      });
    }

    console.error("Request access error:", error);

    return res.status(500).json({
      message: "Failed to submit access request.",
    });
  }
};

// 4. LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userModel.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Only approved users can log in
    if (user.status !== "approved") {
      return res.status(403).json({
        message:
          user.status === "rejected"
            ? "Your access request was rejected."
            : "Your account is pending admin approval.",
        status: user.status,
      });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        companyId: user.companyId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    user.isOnline = true;
    user.lastSeen = null;
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed.",
    });
  }
};

// 5. LOGOUT
export const logout = async (req, res) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (typeof decoded !== "string" && decoded.id) {
          await userModel.findByIdAndUpdate(decoded.id, {
            isOnline: false,
            lastSeen: new Date(),
          });
        }
      } catch (error) {
        // Expired or invalid token: still clear the cookie
        if (
          ![
            "JsonWebTokenError",
            "TokenExpiredError",
            "NotBeforeError",
          ].includes(error.name)
        ) {
          throw error;
        }
      }
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      message: "Logout failed.",
    });
  }
};

export default {requestAccess, login, logout};