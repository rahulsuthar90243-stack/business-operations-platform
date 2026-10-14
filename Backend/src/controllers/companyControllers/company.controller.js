import { userModel } from "../../models/user.model.js";
import company from "../../models/company.model.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const createCompany = async (req, res) => {
  try {
    const { companyName, companyEmail, contactDetails, workspaceCode } =
      req.body;

    // Validate required fields

    if (!companyName || !companyEmail || !workspaceCode) {
      return res.status(400).json({
        success: false,
        message: "Company name, email, and workspace code are required",
      });
    }

    if (
      !contactDetails ||
      !contactDetails.username ||
      !contactDetails.email ||
      !contactDetails.phone ||
      !contactDetails.address ||
      !contactDetails.city ||
      !contactDetails.state ||
      !contactDetails.country
    ) {
      return res.status(400).json({
        success: false,
        message: "All contact details are required",
      });
    }

    // Check if company with the same email or workspace code already exists

    const existingCompany = await company.findOne({
      $or: [{ companyEmail }, { workspaceCode }],
    });

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: "Company with the same email or workspace code already exists",
      });
    }

    const companyData = await company.create({
      companyName,
      companyEmail,
      contactDetails,
      workspaceCode,
    });

    const user = await userModel.create({
      username: contactDetails.username,
      email: contactDetails.email,
      role: "admin",
      companyId: companyData._id,
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
      {
        id: user._id,
        companyId: companyData._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      company: companyData,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create company",
      error: error.message,
    });
  }
};

export default createCompany;
