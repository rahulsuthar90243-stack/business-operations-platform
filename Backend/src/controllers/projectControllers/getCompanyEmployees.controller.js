import { userModel } from "../../models/user.model.js";

export const getCompanyEmployees = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company information is missing",
      });
    }

    const employees = await userModel
      .find({ companyId, role: "employee" })
      .select("_id username email role")
      .sort({ username: 1 })
      .lean();

    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("Get Company Employees Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load company employees",
    });
  }
};

export default getCompanyEmployees;
