import {activityModel} from "../../models/activity.model.js";

const getActiveFild = async (req, res) => {

    try {
        const activeFild = await activityModel
            .find({})
            .populate("user", "username")
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            success: true,
            message: "Active Fild fetched successfully",
            data: activeFild
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch active fild",
            error: error.message
        });
    }
}

export default getActiveFild;