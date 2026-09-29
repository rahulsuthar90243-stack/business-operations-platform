import express from "express"
import authMiddleware from "../../authenticatio.Middleware/auth.middle.js";
import roleMiddleware from "../../authenticatio.Middleware/role.middle.js";
import getCustomerDashboard from "../../controllers/deashboard.controllers/customer.controller.js";

const router = express.Router();

router.get("/customer", 
    authMiddleware,
    roleMiddleware("admin", "manager", "employee", "customer"),
    getCustomerDashboard
)


export default router;