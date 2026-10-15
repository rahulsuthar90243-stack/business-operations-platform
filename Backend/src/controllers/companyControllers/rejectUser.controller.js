import { userModel } from "../../models/user.model";

// 3. ADMIN REJECTS USER
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findOne({
      _id: userId,
      status: "pending",
    });

    if (!user) {
      return res.status(404).json({
        message: "Pending user not found.",
      });
    }

    user.status = "rejected";
    await user.save();

    return res.status(200).json({
      message: "User rejected successfully.",
      status: user.status,
    });
  } catch (error) {
    console.error("Reject user error:", error);

    return res.status(500).json({
      message: "Failed to reject user.",
    });
  }
};


export default rejectUser;