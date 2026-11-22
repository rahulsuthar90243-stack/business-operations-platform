// controllers/manualPayment.controller.js
import mongoose from "mongoose";
import crypto from "crypto";
import Payment from "../../models/payment.model.js";
import Invoice from "../../models/invoice.model.js";
import { userModel } from "../../models/user.model.js";


export const recordManualPayment = async (req, res) => {
  let session;
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be valid JSON",
      });
    }

    const {
      invoiceId,
      customerId,
      amount,
      paymentMethod,
      paymentDate,
      transactionId,
      notes,
    } = req.body;

    const hasInvoiceId =
      invoiceId !== undefined && invoiceId !== null && invoiceId !== "";

    if (hasInvoiceId && !mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const normalizedPaymentMethod =
      typeof paymentMethod === "string" ? paymentMethod.trim().toLowerCase() : "";

    if (
      !Payment.schema
        .path("paymentMethod")
        .enumValues.includes(normalizedPaymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const recordedAt = paymentDate || new Date();

    const customer = await userModel.findOne({
      _id: customerId,
      companyId: req.user.companyId,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    let invoice;
    if (hasInvoiceId) {
      invoice = await Invoice.findOne({
        _id: invoiceId,
        companyId: req.user.companyId,
        customerId: customer._id,
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found for this customer",
        });
      }
    } else {
      invoice = await Invoice.findOne({
        companyId: req.user.companyId,
        customerId: customer._id,
        status: { $in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] },
        $expr: { $lt: ["$paidAmount", "$totalAmount"] },
      }).sort({ createdAt: 1 });

      if (!invoice) {
        const existingInvoice = await Invoice.exists({
          companyId: req.user.companyId,
          customerId: customer._id,
        });

        if (existingInvoice) {
          return res.status(400).json({
            success: false,
            message: "Customer already has invoices but none are unpaid",
          });
        }
      }
    }

    if (invoice) {
      const remainingAmount = invoice.totalAmount - invoice.paidAmount;

      if (remainingAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invoice is already fully paid",
        });
      }

      if (paymentAmount > remainingAmount) {
        return res.status(400).json({
          success: false,
          message: `Payment amount cannot exceed remaining amount of ₹${remainingAmount}`,
        });
      }
    }

    if (transactionId) {
      const duplicatePayment = await Payment.findOne({
        companyId: req.user.companyId,
        transactionId,
      });

      if (duplicatePayment) {
        return res.status(409).json({
          success: false,
          message: "This transaction reference already exists",
        });
      }
    }

    session = await mongoose.startSession();
    let payment;

    await session.withTransaction(async () => {
      [payment] = await Payment.create(
        [
          {
            ...(invoice && { invoiceId: invoice._id }),
            customerId: customer._id,
            companyId: req.user.companyId,
            amount: paymentAmount,
            paymentMethod: normalizedPaymentMethod,
            paymentDate: recordedAt,
            transactionId: transactionId || undefined,
            notes,
            status: "completed",
            recordedBy: req.user.id,
          },
        ],
        { session }
      );

      if (!invoice) {
        const invoiceNumber = `INV-${Date.now()}-${crypto
          .randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;

        [invoice] = await Invoice.create(
          [
            {
              companyId: req.user.companyId,
              customerId: customer._id,
              invoiceNumber,
              items: [
                {
                  description: "Manual payment",
                  quantity: 1,
                  unitPrice: paymentAmount,
                  total: paymentAmount,
                },
              ],
              subtotal: paymentAmount,
              totalAmount: paymentAmount,
              paidAmount: paymentAmount,
              status: "PAID",
              invoiceDate: recordedAt,
              dueDate: recordedAt,
              notes: notes || "Invoice created from manual payment",
              createdBy: req.user.id,
            },
          ],
          { session }
        );

        payment.invoiceId = invoice._id;
        await payment.save({ session });
      } else {
        invoice.paidAmount += paymentAmount;

        if (invoice.paidAmount >= invoice.totalAmount) {
          invoice.status = "PAID";
        } else {
          invoice.status = "PARTIALLY_PAID";
        }

        await invoice.save({ session });
      }
    });

    return res.status(201).json({
      success: true,
      message: "Manual payment recorded successfully",
      data: { payment },
    });
  } catch (error) {
    console.error("Manual payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record manual payment",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
