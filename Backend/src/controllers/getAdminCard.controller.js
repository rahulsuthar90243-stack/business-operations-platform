import { userModel } from "../models/user.model.js";
import { projectModel } from "../models/project.model.js";
import {ticketModel} from "../models/ticket.model.js";

 const statusCard = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const createdThisMonth = {
      $gte: monthStart,
      $lte: now,
    };

    const [
      totalEmployee,
      totalCustomer,
      activeProject,
      openTicket,
      newEmployeeThisMonth,
      newCustomerThisMonth,
      newActiveProjectThisMonth,
      newOpenTicketThisMonth,
    ] = await Promise.all([
      userModel.countDocuments({ role: "employee", companyId }),
      userModel.countDocuments({ role: "customer", companyId }),
      projectModel.countDocuments({ status: "active", companyId }),
      ticketModel.countDocuments({ status: "open", companyId }),
      userModel.countDocuments({
        role: "employee",
        companyId,
        createdAt: createdThisMonth,
      }),
      userModel.countDocuments({
        role: "customer",
        companyId,
        createdAt: createdThisMonth,
      }),
      projectModel.countDocuments({
        status: "active",
        companyId,
        createdAt: createdThisMonth,
      }),
      ticketModel.countDocuments({
        status: "open",
        companyId,
        createdAt: createdThisMonth,
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Dashboard status fetch successfully",
      data: {
        totalEmployee,
        totalCustomer,
        activeProject,
        openTicket,
        newEmployeeThisMonth,
        newCustomerThisMonth,
        newActiveProjectThisMonth,
        newOpenTicketThisMonth,
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