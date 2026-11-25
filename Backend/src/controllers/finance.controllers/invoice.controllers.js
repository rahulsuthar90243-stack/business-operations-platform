import mongoose from "mongoose";
import crypto from "crypto";

import Invoice from "../../models/invoice.model.js";
import {userModel} from "../../models/user.model.js";

// CREATE INVOICE
const createInvoice = async (req, res) => {
  try {
    const {
      customerId,
      items,
      taxAmount = 0,
      discountAmount = 0,
      dueDate,
      notes = "",
    } = req.body;

    // 1. Get logged-in user details
    const companyId = req.user.companyId;
    const createdBy = req.user.id;

    // 2. Validate customer ID
    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // 3. Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one invoice item is required",
      });
    }

    // 4. Validate tax and discount
    if (
      !Number.isFinite(taxAmount) ||
      !Number.isFinite(discountAmount) ||
      taxAmount < 0 ||
      discountAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax or discount amount",
      });
    }

    // 5. Validate customer belongs to this company
    const customer = await userModel.findOne({
      _id: customerId,
      companyId,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found in your company",
      });
    }

    // 6. Calculate item totals on backend
    const invoiceItems = [];

    for (const item of items) {
      const { description, quantity, unitPrice } = item;

      if (
        typeof description !== "string" ||
        !description.trim() ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid invoice item details",
        });
      }

      const total = Number(
        (quantity * unitPrice).toFixed(2)
      );

      invoiceItems.push({
        description: description.trim(),
        quantity,
        unitPrice,
        total,
      });
    }

    // 7. Calculate invoice amount
    const subtotal = Number(
      invoiceItems.reduce(
        (sum, item) => sum + item.total,
        0
      ).toFixed(2)
    );

    if (discountAmount > subtotal + taxAmount) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot exceed invoice amount",
      });
    }

    const totalAmount = Number(
      (subtotal + taxAmount - discountAmount).toFixed(2)
    );

    // 8. Validate due date
    const parsedDueDate = new Date(dueDate);

    if (
      !dueDate ||
      Number.isNaN(parsedDueDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid due date is required",
      });
    }

    // 9. Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    // 10. Save invoice in MongoDB
    const invoice = await Invoice.create({
      companyId,
      customerId,
      invoiceNumber,
      items: invoiceItems,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paidAmount: 0,
      status: "UNPAID",
      dueDate: parsedDueDate,
      notes,
      createdBy,
    });

    // 11. Send response
    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });

  } catch (error) {
    console.error("Create Invoice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// UPDATE INVOICE
const updateInvoice = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update invoices",
      });
    }

    const { invoiceId } = req.params;
    if (!mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      companyId: req.user.companyId,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (["PAID", "CANCELLED"].includes(invoice.status)) {
      return res.status(400).json({
        success: false,
        message: `Paid or cancelled invoices cannot be updated`,
      });
    }

    const {
      customerId,
      items,
      taxAmount = 0,
      discountAmount = 0,
      dueDate,
      invoiceDate,
      notes = "",
    } = req.body;

    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await userModel.findOne({
      _id: customerId,
      companyId: req.user.companyId,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found in your company",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one invoice item is required",
      });
    }

    if (
      !Number.isFinite(taxAmount) ||
      !Number.isFinite(discountAmount) ||
      taxAmount < 0 ||
      discountAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax or discount amount",
      });
    }

    const invoiceItems = [];
    for (const item of items) {
      const { description, quantity, unitPrice } = item;
      if (
        typeof description !== "string" ||
        !description.trim() ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid invoice item details",
        });
      }

      const total = Number((quantity * unitPrice).toFixed(2));
      invoiceItems.push({
        description: description.trim(),
        quantity,
        unitPrice,
        total,
      });
    }

    const subtotal = Number(
      invoiceItems.reduce((sum, item) => sum + item.total, 0).toFixed(2),
    );

    if (discountAmount > subtotal + taxAmount) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot exceed invoice amount",
      });
    }

    const totalAmount = Number(
      (subtotal + taxAmount - discountAmount).toFixed(2),
    );

    if (totalAmount < invoice.paidAmount) {
      return res.status(400).json({
        success: false,
        message: "Invoice total cannot be less than the paid amount",
      });
    }

    const parsedDueDate = new Date(dueDate);
    if (!dueDate || Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Valid due date is required",
      });
    }

    const parsedInvoiceDate = invoiceDate
      ? new Date(invoiceDate)
      : invoice.invoiceDate;
    if (Number.isNaN(parsedInvoiceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue date",
      });
    }
    if (parsedDueDate < parsedInvoiceDate) {
      return res.status(400).json({
        success: false,
        message: "Due date must be on or after the issue date",
      });
    }

    invoice.customerId = customerId;
    invoice.items = invoiceItems;
    invoice.subtotal = subtotal;
    invoice.taxAmount = taxAmount;
    invoice.discountAmount = discountAmount;
    invoice.totalAmount = totalAmount;
    invoice.invoiceDate = parsedInvoiceDate;
    invoice.dueDate = parsedDueDate;
    invoice.notes = typeof notes === "string" ? notes.trim() : "";

    if (invoice.paidAmount >= totalAmount && totalAmount > 0) {
      invoice.status = "PAID";
    } else if (invoice.paidAmount > 0) {
      invoice.status = "PARTIALLY_PAID";
    } else if (parsedDueDate < new Date()) {
      invoice.status = "OVERDUE";
    } else {
      invoice.status = "UNPAID";
    }

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Update Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//DELETE INVOICE
const deleteInvoice = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete invoices",
      });
    }

    const { invoiceId } = req.params;
    if (!mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      companyId: req.user.companyId,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (["PAID", "PARTIALLY_PAID", "CANCELLED"].includes(invoice.status)) {
      return res.status(400).json({
        success: false,
        message: "Paid, partially paid or cancelled invoices cannot be deleted",
      });
    }

    await Invoice.deleteOne({
      _id: invoiceId,
      companyId: req.user.companyId,
    });

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Delete Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    // 1. Get user information
    const { id, companyId, role } = req.user;

    // 2. Check permissions
    if (!["admin", "manager", "customer"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this invoice",
      });
    }

    // 3. Get invoice ID from URL
    const { invoiceId } = req.params;

    // 4. Validate invoice ID
    if (!mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    // 5. Build secure query
    const filter = {
      _id: invoiceId,
      companyId,
    };

    // Customer can only access their own invoice
    if (role === "customer") {
      filter.customerId = id;
    }

    // 6. Find invoice
    const invoice = await Invoice.findOne(filter)
      .populate("customerId", "username email")
      .populate("createdBy", "username email");

    // 7. Check invoice existence
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // 8. Return invoice details
    return res.status(200).json({
      success: true,
      message: "Invoice fetched successfully",
      data: invoice,
    });

  } catch (error) {
    console.error("Get Invoice By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getInvoices = async (req, res) => {
  try {
    // 1. Get logged-in user details
    const { id, companyId, role } = req.user;

    // 2. Check user role
    if (!["admin", "manager", "customer"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view invoices",
      });
    }

    // 3. Build company-wise query
    const filter = { companyId };

    // Customer can only see their own invoices
    if (role === "customer") {
      filter.customerId = id;
    }

    // 4. Optional status filter
    const allowedStatuses = [
      "DRAFT",
      "UNPAID",
      "PARTIALLY_PAID",
      "PAID",
      "OVERDUE",
      "CANCELLED",
    ];

    if (req.query.status) {
      const status = req.query.status.toUpperCase();

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid invoice status",
        });
      }

      filter.status = status;
    }

    // 5. Pagination
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    // 6. Fetch invoices
    const [invoices, totalInvoices] = await Promise.all([
      Invoice.find(filter)
        .populate("customerId", "username email")
        .populate("createdBy", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Invoice.countDocuments(filter),
    ]);

    // 7. Return response
    return res.status(200).json({
      success: true,
      message: "Invoices fetched successfully",
      data: invoices,
      pagination: {
        totalInvoices,
        currentPage: page,
        totalPages: Math.ceil(totalInvoices / limit),
        limit,
      },
    });

  } catch (error) {
    console.error("Get Invoices Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export {
  createInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice,
  deleteInvoice,
};