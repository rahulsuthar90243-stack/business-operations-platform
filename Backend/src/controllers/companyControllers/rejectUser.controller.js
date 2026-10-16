import {userModel} from "../../models/user.model.js";

// 3. ADMIN REJECTS USER
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findOne({
    _id: userId,
    accessStatus: { $in: ["pending", "approved"] },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.accessStatus = "rejected";
    user.isOnline = false;
    await user.save();

    return res.status(200).json({
      message: "User rejected successfully.",
      accessStatus: user.accessStatus,
    });
  } catch (error) {
    console.error("Reject user error:", error);

    return res.status(500).json({
      message: "Failed to reject user.",
    });
  }
};


export default rejectUser;