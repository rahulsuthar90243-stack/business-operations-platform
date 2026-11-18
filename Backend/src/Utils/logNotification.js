import { notification } from "../models/notification.model.js";
export const logNotification = async ({
  recipient,
  sender,
  companyId,
  title,
  message,
  type,
  entityType,
  entityId,
}) => {
  try {
    await notification.create({
      recipient,
      sender,
      companyId,
      title,
      message,
      type,
      entityType,
      entityId,
    });
  } catch (error) {
    console.error("Activity logging failed:", error.message);
  }
};

