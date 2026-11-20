// Create Managed User Controller

import bcrypt from "bcrypt";
import { userModel } from "../models/user.model.js";

const ALLOWED_ROLES = ["admin", "manager", "employee", "customer"];

export default async function createManagedUser(req, res) {
  try {
    const { username, email, password, role } = req.body;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Admin company information is missing.",
      });
    }

    if (typeof username !== "string" || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and no more than 72 bytes.",
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid user role.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      companyId,
      accessStatus: "approved",
      isOnline: false,
      lastSeen: new Date(),
    });

    const safeUser = await userModel
      .findById(user._id)
      .select("-password")
      .lean();

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: safeUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    console.error("Create managed user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user.",
    });
  }
}

