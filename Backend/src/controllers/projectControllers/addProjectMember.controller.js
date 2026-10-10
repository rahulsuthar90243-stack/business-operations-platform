
import mongoose from "mongoose";
import { projectModel } from "../../models/project.model.js";
import { userModel } from "../../models/user.model.js";

export const addProjectMember = async (req, res) => {
  try {
    // 1. Get logged-in user details
    const userId =
      req.user?.id || req.user?.userid || req.user?._id;
    const userRole = req.user?.role;

    // 2. Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 3. Only admin and manager can add members
    if (!["admin", "manager"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Only admin and manager can add project members",
      });
    }

    // 4. Get project ID and employee ID
    const { projectId } = req.params;
    const { employeeId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId) || mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID or employee ID",
      });
    }

    // 5. Find project
    const project = await projectModel.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // 6. Manager can modify only their own projects
    if (
      userRole === "manager" &&
      project.manager?.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only add members to your own projects",
      });
    }

    // 7. Find employee
    const employee = await userModel.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // 8. Verify employee role
    if (employee.role !== "employee") {
      return res.status(400).json({
        success: false,
        message: "Only users with employee role can be added",
      });
    }

    // 9. Prevent duplicate members
    const alreadyMember = project.members.some(
      (member) => member.toString() === employeeId
    );

    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        message: "Employee is already a project member",
      });
    }

    // 10. Add employee to project
    project.members.push(employee._id);

    await project.save();

    // 11. Send success response
    return res.status(200).json({
      success: true,
      message: "Employee added to project successfully",
      project,
    });
  } catch (error) {
    console.error("Add Project Member Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default { addProjectMember };
