import express from "express";
import authMiddleware from "../authenticatio.Middleware/auth.middle.js";
import roleMiddleware from "../authenticatio.Middleware/role.middle.js";
import { createProject } from "../controllers/projectControllers/project.controller.js";
import { updateProject } from "../controllers/projectControllers/updateProject.js";
import deleteProject from "../controllers/projectControllers/deleteProject.controller.js";
import {getProjects} from "../controllers/projectControllers/getProject.controller.js";
import { addProjectMember } from "../controllers/projectControllers/addProjectMember.controller.js";
import getCompanyEmployees from "../controllers/projectControllers/getCompanyEmployees.controller.js";

const router = express.Router();

router.post("/project",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    createProject
);

router.patch("/project/:projectId",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    updateProject
);

router.delete("/project/:projectId",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    deleteProject
);

router.get("/get/project", 
    authMiddleware,
    getProjects,
)

router.get("/employees",
    authMiddleware,
    roleMiddleware("admin", "manager", "employee"),
    getCompanyEmployees,
)

router.post("/:projectId/members", 
    authMiddleware,
    addProjectMember,
)

export default router;