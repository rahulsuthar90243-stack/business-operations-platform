import {userModel} from "../../models/user.model.js";

// 2. ADMIN APPROVES USER
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findOne({ _id: userId, companyId: req.user.companyId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in your company.",
      });
    }

    if (user.accessStatus !== "pending" && user.accessStatus !== "rejected") {
      return res.status(400).json({
        success: false,
        message: `User status is already ${user.accessStatus}.`,
      });
    }

    user.accessStatus = "approved";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User approved successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessStatus: user.accessStatus,
      },
    });
  } catch (error) {
    console.error("Approve user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve user.",
    });
  }
};

export default approveUser;
