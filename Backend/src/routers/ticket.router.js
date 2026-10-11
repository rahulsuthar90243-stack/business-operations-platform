import express from "express";
import createTicket from "../controllers/ticketControllers/ticket.controller.js";
import authMiddleware from "../authenticatio.Middleware/auth.middle.js";
import getTickets from "../controllers/ticketControllers/getTicket.controller.js";
import updateTicket from "../controllers/ticketControllers/updateTicket.controller.js";
import deleteTicket from "../controllers/ticketControllers/deleteTicket.controller.js";

const router = express.Router();

router.post("/ticket/:projectId", 
    authMiddleware, 
    createTicket
);

router.get("/tickets", 
    authMiddleware,
    getTickets
)

router.post("/update/ticket/:ticketId", 
    authMiddleware,
    updateTicket,
)

router.post("/delete/ticket/:ticketId",
    authMiddleware,
    deleteTicket,

)
export default router