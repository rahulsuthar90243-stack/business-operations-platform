import { userModel } from "../models/user.model.js";

const getAllUser = async (req, res) => {

  try {

    const users = await userModel.find().select("-password");

    if (!users) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
        success: true,
        message: "Internal server error"
    })
  }
};


export default getAllUser;