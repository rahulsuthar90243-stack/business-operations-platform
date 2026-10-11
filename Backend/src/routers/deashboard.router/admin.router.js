import express from "express"
import authMiddleware from "../../authenticatio.Middleware/auth.middle.js";
import roleMiddleware from "../../authenticatio.Middleware/role.middle.js";
import getAdminDashboard from "../../controllers/deashboard.controllers/admin.controller.js";
import statusCard from "../../controllers/getAdminCard.controller.js";

const router = express.Router();

router.get("/admin", 
    authMiddleware,
    roleMiddleware("admin"),
    getAdminDashboard
)

router.get("/status/card",
    authMiddleware,
    statusCard,
)

export default router;