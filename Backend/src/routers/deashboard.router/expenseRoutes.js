import { createExpense, getExpenseById, getExpenses, deleteExpense , updateExpenseStatus} from "../../controllers/finance.controllers/expense.controller.js";
import express from  "express"
import authMiddleware from "../../authenticatio.Middleware/auth.middle.js";
import roleMiddleware from "../../authenticatio.Middleware/role.middle.js";


const router = express.Router();

router.post("/expense", 
    authMiddleware,
    roleMiddleware("admin", "manager"),
    createExpense,
)

router.get("/expense", 
    authMiddleware,
    roleMiddleware("admin", "manager"),
    getExpenses
)

router.post("/delete/expense/:expenseId", 
    authMiddleware,
    roleMiddleware("admin", "manager"),
    deleteExpense
)

router.get("/expense/:expenseId", 
    authMiddleware,
    roleMiddleware("admin", "manager"),
    getExpenseById
)

router.post("/update/expense/:expenseId", 
    authMiddleware,
    roleMiddleware("admin", "manager"),
    updateExpenseStatus
)

export default router;