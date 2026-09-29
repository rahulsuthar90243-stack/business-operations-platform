import express from "express"
import authMiddleware from "../../authenticatio.Middleware/auth.middle.js";
import roleMiddleware from "../../authenticatio.Middleware/role.middle.js";
import getManagerDashboard from "../../controllers/deashboard.controllers/manager.controller.js";

const router = express.Router();

router.get("/manager", 
    authMiddleware,
    roleMiddleware("admin", "manager"),
    getManagerDashboard
)


export default router;