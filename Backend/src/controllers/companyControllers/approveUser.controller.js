import {userModel} from "../../models/user.model.js";

// 2. ADMIN APPROVES USER
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.accessStatus !== "pending") {
      return res.status(400).json({
        message: `User status is already ${user.accessStatus}.`,
      });
    }

    user.accessStatus = "approved";
    await user.save();

    return res.status(200).json({
      message: "User approved successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessStatus: user.status,
      },
    });
  } catch (error) {
    console.error("Approve user error:", error);

    return res.status(500).json({
      message: "Failed to approve user.",
    });
  }
};

export default approveUser;