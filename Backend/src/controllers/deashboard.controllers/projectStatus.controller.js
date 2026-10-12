import {projectModel} from "../../models/project.model.js";
export const getProjectStatusSummary = async (req, res) => {
  try {
    const planned = await projectModel.countDocuments({ status: "planned" });
    const active = await projectModel.countDocuments({ status: "active" });
    const onHold = await projectModel.countDocuments({ status: "on-hold" });
    const completed = await projectModel.countDocuments({ status: "completed" });
    const cancelled = await projectModel.countDocuments({ status: "cancelled" });

    // Chart ke format me data bhejenge:
    const statusData = [
      { name: "Active", value: active, color: "#059669" },
      { name: "Planned", value: planned, color: "#d97706" },
      { name: "On Hold", value: onHold, color: "#dc2626" },
      { name: "Completed", value: completed, color: "#4f46e5" },
      { name: "Cancelled", value: cancelled, color: "#6b7280" },
    ];

    res.status(200).json({
      success: true,
      data: statusData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default getProjectStatusSummary;