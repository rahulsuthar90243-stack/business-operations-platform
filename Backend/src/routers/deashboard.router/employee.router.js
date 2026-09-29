import express from "express"
import authMiddleware from "../../authenticatio.Middleware/auth.middle.js";
import roleMiddleware from "../../authenticatio.Middleware/role.middle.js";
import getEmployeeDashboard from "../../controllers/deashboard.controllers/employee.controller.js";

const router = express.Router();

router.get("/employee", 
    authMiddleware,
    roleMiddleware("admin", "manager", "employee"),
    getEmployeeDashboard
)


export default router;