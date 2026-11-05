import { userModel } from "../models/user.model.js";
import { projectModel } from "../models/project.model.js";
import {ticketModel} from "../models/ticket.model.js";

 const statusCard = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const totalEmployee = await userModel.countDocuments({ role: "employee", companyId });

    const totalCustomer = await userModel.countDocuments({ role: "customer", companyId });

    const activeProject = await projectModel.countDocuments({ status: "active", companyId });

    const openTicket = await ticketModel.countDocuments({ status: "open", companyId });

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