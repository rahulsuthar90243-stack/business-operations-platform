import Revenue from "../../models/revenue.model.js";

export const createRevenue = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      category,
      paymentMethod,
      revenueDate,
      receiptUrl,
    } = req.body ?? {};

    if (!title || !category || amount === undefined || amount === null || amount === "") {
      return res.status(400).json({
        success: false,
        message: "Title, amount, and creategory a required",
      });
    }

    const revenueAmount = Number(amount);
    if (!Number.isFinite(revenueAmount) || revenueAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    const revenue = await Revenue.create({
      title,
      description,
      amount: revenueAmount,
      category,
      paymentMethod,
      revenueDate,
      receiptUrl,
      createdBy: req.user.id,
      companyId: req.user.companyId,
    });

    return res.status(201).json({
      success: true,
      message: "Revenue created successfully",
      data: revenue,
    });
  } catch (error) {
    const statusCode =
      error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRevenues = async (req, res) => {
  try {
    const revenues = await Revenue.find({
      companyId: req.user.companyId,
    })
      .populate("createdBy", "username email")
      .sort({ revenueDate: -1 });

    return res.status(200).json({
      success: true,
      count: revenues.length,
      data: revenues,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRevenueById = async (req, res) => {
  try {
    const revenue = await Revenue.findOne({
      _id: req.params.revenueId,
      companyId: req.user.companyId,
    }).populate("createdBy", "username email");

    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: "Revenue not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: revenue,
    });
  } catch (error) {
    const statusCode = error.name === "CastError" ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteRevenue = async (req, res) => {
  try {
    const revenue = await Revenue.findOneAndDelete({
      _id: req.params.revenueId,
      companyId: req.user.companyId,
    });

    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: "Revenue not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Revenue deleted successfully",
    });
  } catch (error) {
    const statusCode = error.name === "CastError" ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};