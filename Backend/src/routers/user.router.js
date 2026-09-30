import express from "express"
import {register, login} from "../controllers/user.controller.js";
import authMiddleware from "../authenticatio.Middleware/auth.middle.js";
import getProfile from "../controllers/profile.controller.js";
import getAllUser from "../controllers/allProfile.controller.js";
import roleMiddleware from "../authenticatio.Middleware/role.middle.js";
import changeUserRole from "../controllers/changeUserRole.controller.js"

const router = express.Router();


router.post("/register", register)
router.post("/login", login);

router.get("/profile",
  authMiddleware,
  getProfile
);
router.get("/users", 
    authMiddleware,
    roleMiddleware("admin"),
    getAllUser
)

router.patch(
    "/users/:userId/role",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    changeUserRole
);

export default router