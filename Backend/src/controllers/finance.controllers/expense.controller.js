import Expense from "../../models/expense.model.js";
import mongoose from "mongoose";

// 1. Create Expense
export const createExpense = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      category,
      paymentMethod,
      expenseDate,
      receiptUrl,
    } = req.body;

    if (!title || !amount || !category || !expenseDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (Number(amount) <= 0 || !Number.isFinite(Number(amount))) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    const expense = await Expense.create({
      title,
      description,
      amount: Number(amount),
      category,
      paymentMethod,
      expenseDate,
      receiptUrl,
      createdBy: req.user.id,
      companyId: req.user.companyId,
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get All Expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      companyId: req.user.companyId,
    })
      .populate("createdBy", "username email")
      .populate("approvedBy", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Get Expense By ID
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      companyId: req.user.companyId,
    })
      .populate("createdBy", "username email")
      .populate("approvedBy", "username email");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Approve / Reject Expense
export const updateExpenseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense status",
      });
    }

    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      companyId: req.user.companyId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    if (expense.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending expenses can be updated",
      });
    }

    expense.status = status;
    expense.approvedBy = req.user.id;

    await expense.save();

    return res.status(200).json({
      success: true,
      message: `Expense ${status} successfully`,
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Delete Expense
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.expenseId,
      companyId: req.user.companyId,
      status: "pending",
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Pending expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
