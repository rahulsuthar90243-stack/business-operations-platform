import {userModel} from "../../models/user.model.js";

// 3. ADMIN REJECTS USER
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findOne({
      _id: userId,
      companyId: req.user.companyId,
      accessStatus: "pending",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pending user not found in your company.",
      });
    }

    user.accessStatus = "rejected";
    user.isOnline = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User rejected successfully.",
      accessStatus: user.accessStatus,
    });
  } catch (error) {
    console.error("Reject user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject user.",
    });
  }
};


export default rejectUser;
