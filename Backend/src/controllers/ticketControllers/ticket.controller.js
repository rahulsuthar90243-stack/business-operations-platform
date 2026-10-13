import mongoose from "mongoose";
import { projectModel } from "../../models/project.model.js";
import { userModel } from "../../models/user.model.js";
import { ticketModel } from "../../models/ticket.model.js";
import logActivity from "../../Utils/logActivity.js";

export const createTicket = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userid || req.user?._id;
    const userRole = req.user?.role;

    // Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check allowed roles
    if (!["admin", "manager", "employee"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create tickets",
      });
    }

    const { projectId } = req.params;
    const { title, description, assignedTo } = req.body;

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    // Validate required fields
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Find project
    const project = await projectModel.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Manager can create tickets only in their own projects
    if (userRole === "manager") {
      const isManager = project.manager?.toString() === userId.toString();

      if (!isManager) {
        return res.status(403).json({
          success: false,
          message: "You can only create tickets in your own projects",
        });
      }
    }

    // Employee can create tickets only in projects they belong to
    if (userRole === "employee") {
      const isMember = project.members.some(
        (member) => member.toString() === userId.toString()
      );

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this project",
        });
      }
    }

    // Validate assigned employee, if provided
    let assignedEmployeeId = null;

    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assigned employee ID",
        });
      }

      const employee = await userModel.findById(assignedTo);

      if (!employee || employee.role !== "employee") {
        return res.status(400).json({
          success: false,
          message: "Invalid employee",
        });
      }

      // Assigned employee must belong to this project
      const isProjectMember = project.members.some(
        (member) => member.toString() === employee._id.toString()
      );

      if (!isProjectMember) {
        return res.status(400).json({
          success: false,
          message: "Employee is not a member of this project",
        });
      }

      assignedEmployeeId = employee._id;
    }

    // Create ticket
    const ticket = await ticketModel.create({
      title: title.trim(),
      description: description.trim(),
      project: project._id,
      createdBy: userId,
      assignedTo: assignedEmployeeId,
      status: "open",
      priority: "medium",
    });

    await logActivity({
      userId: req.user.id,
      action: "created",
      entityType: "ticket",
      entityId: ticket._id,
      description: `Created ticket: ${ticket.title}`,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default createTicket;