import { userModel } from "../models/user.model.js";
import { projectModel } from "../models/project.model.js";
import {ticketModel} from "../models/ticket.model.js";

 const statusCard = async (req, res) => {
  try {
    const totalEmployee = await userModel.countDocuments({ role: "employee" });

    const totalCustomer = await userModel.countDocuments({ role: "customer" });

    const activeProject = await projectModel.countDocuments({ status: "active" });

    const openTicket = await ticketModel.countDocuments({ status: "open" });

    return res.status(200).json({
      success: true,
      message: "Dashboard status fetch successfully",
      data: {
        totalEmployee,
        totalCustomer,
        activeProject,
        openTicket,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

export default statusCard;