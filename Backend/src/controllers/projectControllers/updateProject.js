import mongoose from "mongoose";
import { projectModel } from "../../models/project.model.js";
import { userModel } from "../../models/user.model.js";

export const updateProject = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userid || req.user?._id;
    const companyId = req.user?.companyId;
    const userRole = req.user?.role || req.user?.userRole;
    const { projectId } = req.params;

    if (!userId || !companyId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const projectFilter = {
      _id: projectId,
      companyId,
      ...(userRole === "manager" ? { manager: userId } : {}),
    };
    const project = await projectModel.findOne(projectFilter);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
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
    const allowedStatuses = ["planned", "active", "on-hold", "completed", "cancelled"];

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Project name is required",
        });
      }
      project.name = name.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          success: false,
          message: "Project description must be text",
        });
      }
      project.description = description.trim();
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
        });
      }
      project.status = status;
    }

    if (manager !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(manager)) {
        return res.status(400).json({
          success: false,
          message: "Invalid manager ID",
        });
      }
      const managerExists = await userModel.findOne({
        _id: manager,
        companyId,
        role: "manager",
      });
      if (!managerExists) {
        return res.status(404).json({
          success: false,
          message: "Assigned manager not found",
        });
      }
      project.manager = manager;
    }

    if (members !== undefined) {
      if (
        !Array.isArray(members) ||
        members.some((memberId) => !mongoose.Types.ObjectId.isValid(memberId))
      ) {
        return res.status(400).json({
          success: false,
          message: "Members must be an array of valid employee IDs",
        });
      }

      const uniqueMemberIds = [...new Set(members)];
      const companyEmployees = await userModel
        .find({
          _id: { $in: uniqueMemberIds },
          companyId,
          role: "employee",
        })
        .select("_id");

      if (companyEmployees.length !== uniqueMemberIds.length) {
        return res.status(400).json({
          success: false,
          message: "All project members must be employees in your company",
        });
      }

      project.members = uniqueMemberIds;
    }

    if (startDate !== undefined) {
      const parsedStartDate = new Date(startDate);
      if (Number.isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date",
        });
      }
      project.startDate = parsedStartDate;
    }

    if (dueDate !== undefined) {
      const parsedDueDate = new Date(dueDate);
      if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date",
        });
      }
      project.dueDate = parsedDueDate;
    }

    if (project.dueDate < project.startDate) {
      return res.status(400).json({
        success: false,
        message: "Due date must be on or after the start date",
      });
    }

    await project.save();

    const updatedProject = await projectModel
      .findById(project._id)
      .populate({ path: "manager", model: "userModel", select: "username email role" })
      .populate({ path: "createdBy", model: "userModel", select: "username email role" })
      .populate({ path: "members", model: "userModel", select: "username email role" })
      .populate({ path: "companyId", select: "companyName" });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update Project Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
