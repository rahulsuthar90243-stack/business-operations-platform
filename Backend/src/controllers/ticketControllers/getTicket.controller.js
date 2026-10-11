import { ticketModel } from "../../models/ticket.model.js";
import { projectModel } from "../../models/project.model.js";

const getTickets = async (req, res) => {
  try {
    const { id, role } = req.user;

    let filter = {};

    if (role === "admin") {
      // Admin can view all tickets
      filter = {};
    } else if (role === "manager") {
      // Manager can view tickets from their projects
      const projects = await projectModel.find({ manager: id }).select("_id");
      const projectIds = projects.map((project) => project._id);

      filter = { project: { $in: projectIds } };
    } else if (role === "employee") {
      // Employee can view tickets assigned to them
      filter = { assignedTo: id };
    } else if (role === "customer") {
      // Customer can view tickets created by them
      filter = { createdBy: id };
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const tickets = await ticketModel
      .find(filter)
      .populate({
        path: "project",
        model: "projectModel",
        select: "name",
      })
      .populate({
        path: "assignedTo",
        model: "userModel",
        select: "username email",
      })
      .populate({
        path: "createdBy",
        model: "userModel",
        select: "username email",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

export default getTickets;
