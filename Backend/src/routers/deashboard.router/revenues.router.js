import express from "express";
import authMiddleware from "../../authenticatio.Middleware/auth.middle.js";
import roleMiddleware from "../../authenticatio.Middleware/role.middle.js";
import { createRevenue, getRevenueById, getRevenues, deleteRevenue } from "../../controllers/finance.controllers/revenue.controller.js";

const router = express.Router();

router.post("/revenue", 
    authMiddleware,
    roleMiddleware("admin", "manager"),
    createRevenue,
)

router.get("/revenues", 
    authMiddleware,
    roleMiddleware("admin", "manager"),
    getRevenues,
)
router.get("/revenue/:revenueId", 
    authMiddleware,
    roleMiddleware("admin", "manager"),
    getRevenueById,
)
router.post("/delete/revenue/:revenueId", 
    authMiddleware,
    roleMiddleware("admin", "manager"),
    deleteRevenue,
)

export default router