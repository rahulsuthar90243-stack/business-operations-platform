import { userModel } from "../../models/user.model.js";

const getEmployeeDeashboard = async (req, res) => {
  try {
    const userId = req.user?.userid || req.user?.id;
    const userRole = req.user.role;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (["admin", "manager"].includes(userRole)) {
      const employee = await userModel
        .find({ role: "employee", })
        .select("-password");

      return res.status(201).json({
        message: "All employee data",
        success: true,
        employee,
      });
    }

    const employee = await userModel
      .findOne({
        _id: userId,
        role: "employee",
      })
      .select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      message: "employee deashboard data",
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Get Admin Dashboard Error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default getEmployeeDeashboard;
