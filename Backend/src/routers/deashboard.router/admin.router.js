import express from "express"
import authMiddleware from "../../authenticatio.Middleware/auth.middle.js";
import roleMiddleware from "../../authenticatio.Middleware/role.middle.js";
import getAdminDashboard from "../../controllers/deashboard.controllers/admin.controller.js";
import statusCard from "../../controllers/getAdminCard.controller.js";
import getProjectStatusSummary from "../../controllers/deashboard.controllers/projectStatus.controller.js"
import getActiveFild from "../../controllers/deashboard.controllers/activeFild.controller.js"
const router = express.Router();

router.get("/admin", 
    authMiddleware,
    roleMiddleware("admin"),
    getAdminDashboard
)

router.get("/status/card",
    authMiddleware,
    roleMiddleware("admin"),
    statusCard,
)

router.get("/status/project", 
    authMiddleware,
    roleMiddleware("admin"),
    getProjectStatusSummary,
)

router.get("/activity/logs",
    authMiddleware,
    getActiveFild,
)

export default router;