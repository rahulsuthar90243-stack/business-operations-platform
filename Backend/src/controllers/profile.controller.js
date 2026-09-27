import { userModel } from "../models/user.model.js";

const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userid || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fatch successfully",
      user,
    });
  } catch (error) {
    console.log("Get Profile Error", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default getProfile;