import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "credit_card", "debit_card", "cheque", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "completed",
    },
    transactionId: {
      type: String,
      trim: true,
      default: "",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ invoiceId: 1, paymentDate: -1 });
paymentSchema.index({ companyId: 1, paymentDate: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;