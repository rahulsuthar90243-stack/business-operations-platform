import mongoose from "mongoose";
import { projectModel } from "../../models/project.model.js";
import { userModel } from "../../models/user.model.js";

/**
 * Controller to create a new project
 * Route: POST /api/project
 * Access: Admin, Manager (Protected via authMiddleware & roleMiddleware)
 */
export const createProject = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userid || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      name,
      description,
      status,
      manager,
      members,
      startDate,
      dueDate,
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Start date is required",
      });
    }

    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message: "Due date is required",
      });
    }

    // Default manager to logged-in user if they are a manager and manager is not specified
    const assignedManager = manager || (req.user?.role === "manager" ? userId : null);

    if (!assignedManager) {
      return res.status(400).json({
        success: false,
        message: "Project manager is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedManager)) {
      return res.status(400).json({
        success: false,
        message: "Invalid manager ID",
      });
    }

    // Verify manager exists in userModel
    const managerExists = await userModel.findById(assignedManager);
    if (!managerExists) {
      return res.status(404).json({
        success: false,
        message: "Assigned manager not found",
      });
    }

    // Date parsing and validation
    const parsedStartDate = new Date(startDate);
    const parsedDueDate = new Date(dueDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for start date or due date",
      });
    }

    if (parsedDueDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "Due date must be on or after the start date",
      });
    }

    // Status validation if provided
    const allowedStatuses = ["planned", "active", "on-hold", "completed", "cancelled"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    // Members validation if provided
    let formattedMembers = [];
    if (members) {
      if (!Array.isArray(members)) {
        return res.status(400).json({
          success: false,
          message: "Members must be an array of user IDs",
        });
      }

      for (const memberId of members) {
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
          return res.status(400).json({
            success: false,
            message: `Invalid member ID: ${memberId}`,
          });
        }
      }
      formattedMembers = members;
    }

    // Create the project document
    const newProject = await projectModel.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      status: status || "planned",
      manager: assignedManager,
      createdBy: userId,
      members: formattedMembers,
      startDate: parsedStartDate,
      dueDate: parsedDueDate,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    console.error("Create Project Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default {
  createProject,
};
