import mongoose from "mongoose";
import { notification } from "../../models/notification.model.js";


export const getNotification = async (req, res) => {
    try {
        const notifications = await notification
            .find({ recipient: req.user.id, companyId: req.user.companyId })
            .populate("sender", "username email")
            .sort({ createdAt: -1 })
            .limit(10);
        
            return res.status(200).json({
                success: true,
                message: "Notifications fetched successfully",
                data: notifications
            })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const markNotificationsRead = async (req, res) => {
    try {
        const { notificationIds } = req.body;

        if (
            !Array.isArray(notificationIds) ||
            notificationIds.some((id) => !mongoose.isValidObjectId(id))
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid notification IDs are required.",
            });
        }

        if (notificationIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No unread notifications to mark as read",
                data: { modifiedCount: 0 },
            });
        }

        const result = await notification.updateMany(
            {
                _id: { $in: notificationIds },
                recipient: req.user.id,
                companyId: req.user.companyId,
                isRead: false,
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date(),
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "Notifications marked as read",
            data: { modifiedCount: result.modifiedCount },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
