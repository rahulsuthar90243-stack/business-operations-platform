
import { ticketModel } from "../../models/ticket.model.js";
import { projectModel } from "../../models/project.model.js";
import { userModel } from "../../models/user.model.js";
import logActivity from "../../Utils/logActivity.js";

export const deleteTicket = async (req, res) => {
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

    // 2. Admin can delete any ticket
    if (role === "admin") {
      // No additional check required
    }

    // 3. Manager can delete tickets from their projects
    else if (role === "manager") {
      const project = await projectModel.findOne({
        _id: ticket.project,
        manager: id,
      });

      if (!project) {
        return res.status(403).json({
          success: false,
          message: "You cannot delete this ticket",
        });
      }
    }

    // 4. Employee can delete their assigned tickets
    else if (role === "employee") {
      if (ticket.assignedTo?.toString() !== id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can delete only your assigned tickets",
        });
      }
    }

    // 5. Other roles are not allowed
    else {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // 6. Delete ticket
    await ticket.deleteOne();

    await logActivity({
      userId: req.user.id,
      action: "deleted",
      entityType: "ticket",
      entityId: ticket._id,
      description: `Deleted ticket: ${ticket.title}`,
      createdAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete ticket",
      error: error.message,
    });
  }
};


export default deleteTicket