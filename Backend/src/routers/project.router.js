import express from "express";
import authMiddleware from "../authenticatio.Middleware/auth.middle.js";
import roleMiddleware from "../authenticatio.Middleware/role.middle.js";
import {createProject} from "../controllers/projectControllers/project.controller.js";
import {getProjects} from "../controllers/projectControllers/getProject.controller.js";
import { addProjectMember } from "../controllers/projectControllers/addProjectMember.controller.js";

const router = express.Router();

router.post("/project",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    createProject
);

router.get("/get/project", 
    authMiddleware,
    getProjects,
)

router.post("/:projectId/members", 
    authMiddleware,
    addProjectMember,
)

export default router;