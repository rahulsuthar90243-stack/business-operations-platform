import mongoose from "mongoose";
import { ticketModel } from "../../models/ticket.model.js";
import { projectModel } from "../../models/project.model.js";
import { userModel } from "../../models/user.model.js";
import logActivity from "../../Utils/logActivity.js";

 const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { id, role } = req.user;

    // 1. Find ticket
    const ticket = await ticketModel.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    
    if (ticket.companyId?.toString() !== req.user.companyId?.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot update tickets for this company",
      });
    }

    // 2. Allowed fields
    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "assignedTo",
      "dueDate",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Validate status and priority
    if (updates.assignedTo !== undefined) {
      if (updates.assignedTo === null || updates.assignedTo === "") {
        updates.assignedTo = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(updates.assignedTo)) {
          return res.status(400).json({
            success: false,
            message: "Invalid assigned employee ID",
          });
        }

        const employee = await userModel.findOne({
          _id: updates.assignedTo,
          companyId: ticket.companyId,
          role: "employee",
        });

        if (!employee) {
          return res.status(400).json({
            success: false,
            message: "Assigned employee must be an employee in your company",
          });
        }

        if (employee._id.toString() !== ticket.assignedTo?.toString()) {
          const project = await projectModel.findOne({
            _id: ticket.project,
            companyId: ticket.companyId,
          });
          const isProjectMember = (project?.members || []).some(
            (memberId) => memberId.toString() === employee._id.toString(),
          );
          if (!isProjectMember) {
            return res.status(400).json({
              success: false,
              message: "Assigned employee must be a member of this project",
            });
          }
        }
      }
    }

    if (updates.dueDate !== undefined) {
      if (updates.dueDate === null || updates.dueDate === "") {
        updates.dueDate = null;
      } else {
        const parsedDueDate = new Date(updates.dueDate);
        if (Number.isNaN(parsedDueDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid due date",
          });
        }
        updates.dueDate = parsedDueDate;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided",
      });
    }

    // 3. Admin access
    if (role === "admin") {
      // Admin can update any ticket
    }

    // 4. Manager access
    else if (role === "manager") {
      const project = await projectModel.findOne({
        _id: ticket.project,
        manager: id,
      });

      if (!project) {
        return res.status(403).json({
          success: false,
          message: "You cannot update this ticket",
        });
      }
    }

    // 5. Employee access
    else if (role === "employee") {
      if (ticket.assignedTo?.toString() !== id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can update only your assigned tickets",
        });
      }

      // Employee can update all allowed fields
    }

    // 6. Other roles denied
    else {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // 7. Update ticket
    const updatedTicket = await ticketModel.findByIdAndUpdate(
      ticketId,
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    )
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

      await logActivity({
        userId: req.user.id,
        action: "updated",
        entityType: "ticket",
        entityId: updatedTicket._id,
        description: `Updated ticket: ${updatedTicket.title}`,
        createdAt: new Date(),
      });

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update ticket",
      error: error.message,
    });
  }
};


export default updateTicket;