import Payment from "../../models/payment.model.js";

export const getPayments = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
    );
    const filter = { companyId: req.user.companyId };
    const skip = (page - 1) * limit;

    const [payments, totalPayments] = await Promise.all([
      Payment.find(filter)
        .populate("customerId", "username name email")
        .populate("invoiceId", "invoiceNumber status")
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      data: payments,
      pagination: {
        totalPayments,
        currentPage: page,
        totalPages: Math.ceil(totalPayments / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("Get Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
