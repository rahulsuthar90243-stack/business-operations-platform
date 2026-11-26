import express from "express"
import authMiddleware from "../../authenticatio.Middleware/auth.middle.js";
import roleMiddleware from "../../authenticatio.Middleware/role.middle.js";
import getAdminDashboard from "../../controllers/deashboard.controllers/admin.controller.js";
import statusCard from "../../controllers/getAdminCard.controller.js";
import getProjectStatusSummary from "../../controllers/deashboard.controllers/projectStatus.controller.js"
import getActiveFild from "../../controllers/deashboard.controllers/activeFild.controller.js"
import createCompany from "../../controllers/companyControllers/company.controller.js";
import getCompany from "../../controllers/companyControllers/getCompany.controller.js";
import approveUser from "../../controllers/companyControllers/approveUser.controller.js";
import rejectUser from "../../controllers/companyControllers/rejectUser.controller.js";
import {createInvoice, getInvoiceById, getInvoices, updateInvoice, deleteInvoice} from "../../controllers/finance.controllers/invoice.controllers.js"
import { recordManualPayment } from "../../controllers/finance.controllers/menualPayment.controller.js";
import { getPayments } from "../../controllers/finance.controllers/payment.controller.js";


const router = express.Router();

//dashboard routes
router.get("/admin", 
    authMiddleware,
    roleMiddleware("admin"),
    getAdminDashboard
)


//company routes
router.post("/company", createCompany);
router.get("/getcompany/:adminId",
    authMiddleware,
    roleMiddleware("admin"),
    getCompany
)

router.post("/reject/:userId", 
    authMiddleware,
    roleMiddleware("admin"),
    rejectUser,
)

router.post("/approve/:userId", 
    authMiddleware,
    roleMiddleware("admin"),
    approveUser
)

// status routes
router.get("/status/card",
    authMiddleware,
    roleMiddleware("admin"),
    statusCard,
)

//activity log routes
router.get("/activity/logs",
    authMiddleware,
    getActiveFild,
)


router.get("/status/project", 
    authMiddleware,
    roleMiddleware("admin"),
    getProjectStatusSummary,
)



//finance
router.post("/invoice", 
    authMiddleware,
    roleMiddleware("admin"),
    createInvoice,
)

router.patch("/invoice/:invoiceId",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    updateInvoice,
)

router.delete("/invoice/:invoiceId",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    deleteInvoice,
)

router.get("/getInvoices", 
    authMiddleware,
    roleMiddleware("admin", "customer", "manager"),
    getInvoices,
)
router.get("/getInvoices/:invoiceId", 
    authMiddleware,
    getInvoiceById,
)

// Payment routes
router.get("/payments",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    getPayments,
)
router.post("/payment/menual", 
    authMiddleware,
    roleMiddleware("admin", "manager"),
    recordManualPayment,
)
    


export default router;