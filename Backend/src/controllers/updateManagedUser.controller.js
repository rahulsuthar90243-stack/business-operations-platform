import { userModel } from "../models/user.model.js";

const ALLOWED_ROLES = ["admin", "manager", "employee", "customer"];

export default async function updateManagedUser(req, res) {
  try {
    const { username, email, role, accessStatus } = req.body;
    const updates = {};

    if (username !== undefined) {
      if (typeof username !== "string" || !username.trim()) {
        return res.status(400).json({ success: false, message: "Name is required." });
      }
      updates.username = username.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ success: false, message: "Email is required." });
      }
      updates.email = email.trim().toLowerCase();
    }

    if (role !== undefined) {
      if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role." });
      }
      updates.role = role;
    }

    if (accessStatus !== undefined) {
      if (!["pending", "approved", "rejected"].includes(accessStatus)) {
        return res.status(400).json({ success: false, message: "Invalid access status." });
      }
      updates.accessStatus = accessStatus;
      if (accessStatus !== "approved") updates.isOnline = false;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No editable fields were provided." });
    }

    const user = await userModel.findOneAndUpdate(
      { _id: req.params.userId, companyId: req.user.companyId },
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password").lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found in your company." });
    }

    return res.status(200).json({ success: true, message: "User updated successfully.", data: user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "That email address is already in use." });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    console.error("Update managed user error:", error);
    return res.status(500).json({ success: false, message: "Failed to update user." });
  }
}

