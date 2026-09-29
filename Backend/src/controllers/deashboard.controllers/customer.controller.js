import { userModel } from "../../models/user.model.js";

const getCustomerDashboard = async (req, res) => {
	try {
		const userId = req.user?.userid || req.user?.id;
		const userRole = req.user?.role || req.user?.userRole;

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		if (["admin", "manager", "employee"].includes(userRole)) {
			const customers = await userModel
				.find({ role: "customer" })
				.select("-password");

			return res.status(200).json({
				message: "All customer data",
				success: true,
				customers,
			});
		}

		const customer = await userModel
			.findOne({ _id: userId, role: "customer" })
			.select("-password");

		if (!customer) {
			return res.status(404).json({
				success: false,
				message: "Customer not found",
			});
		}

		return res.status(200).json({
            message: "Customer deashboard data",
			success: true,
			customer,
		});

	} catch (error) {
		console.error("Get Customer Dashboard Error", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export default getCustomerDashboard;
