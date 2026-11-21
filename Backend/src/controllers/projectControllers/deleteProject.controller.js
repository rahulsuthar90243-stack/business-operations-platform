import mongoose from "mongoose";
import { projectModel } from "../../models/project.model.js";
import logActivity from "../../Utils/logActivity.js";

export default async function deleteProject(req, res) {
  try {
    const userId = req.user?.id || req.user?.userid || req.user?._id;
    const companyId = req.user?.companyId;
    const userRole = req.user?.role || req.user?.userRole;
    const { projectId } = req.params;

    if (!userId || !companyId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const project = await projectModel.findOne({
      _id: projectId,
      companyId,
      ...(userRole === "manager" ? { manager: userId } : {}),
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const projectName = project.name;
    await project.deleteOne();

    await logActivity({
      userId,
      action: "deleted",
      entityType: "project",
      entityId: project._id,
      description: `Deleted project: ${projectName}`,
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully. Its tickets were kept.",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete project.",
    });
  }
}
