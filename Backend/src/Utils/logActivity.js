import activityModel from "../models/activity.model.js";

export const logActivity = async ({
  userId,
  action,
  entityType,
  entityId,
  description,
}) => {
  try {
    await activityModel.create({
      user: userId,
      action,
      entityType,
      entityId,
      description,
    });
  } catch (error) {
    console.error("Activity logging failed:", error.message);
  }
};


export default logActivity;