import Company from "../../models/company.model.js";

export const getCompany = async (req, res) => {
  try {
    const user = req.user;
    const companyId = user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.params.adminId !== String(user.id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const companyData = await Company.findById(companyId).lean();

    if (!companyData) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      company: companyData,
    });
  } catch (error) {
    console.error("Get company error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default getCompany;
