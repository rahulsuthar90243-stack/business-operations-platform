
import { projectModel } from "../../models/project.model.js";

export const getProjects = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userid || req.user?._id;
    const userRole = req.user?.role;

    // 1. Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Decide which projects the user can access
    let filter = {};

    if (userRole === "admin") {
      // Admin can see all projects
      filter = {};
    } else if (userRole === "manager") {
      // Manager can see projects assigned to them
      filter = { manager: userId };
    } else if (userRole === "employee") {
      // Employee can see projects they are a member of
      filter = { members: userId };
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view projects",
      });
    }

    // 3. Fetch projects from MongoDB
    const projects = await projectModel
      .find(filter)
      .sort({ createdAt: -1 });

    // 4. Send response
    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default { getProjects };
