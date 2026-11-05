import { userModel } from "../models/user.model.js";

const getAllUser = async (req, res) => {

  try {

    const companyID = req.user.companyId;
    const users = await userModel.find({ companyId: companyID }).select("-password").lean();
    const usersWithOnlineStatus = users.map((user) => ({
      ...user,
      isOnline: Boolean(user.isOnline),
    }));

    return res.status(200).json({
      success: true,
      users: usersWithOnlineStatus,
    });
  } catch (error) {
    res.status(500).json({
        success: true,
        message: "Internal server error"
    })
  }
};


export default getAllUser;