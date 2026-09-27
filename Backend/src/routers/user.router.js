import express from "express"
import {register, login} from "../controllers/user.controller.js";
import authMiddleware from "../authenticatio.Middleware/auth.middle.js";
import getProfile from "../controllers/profile.controller.js";
import getAllUser from "../controllers/allProfile.controller.js";
import roleMiddleware from "../authenticatio.Middleware/role.middle.js";

const router = express.Router();


router.post("/register", register)
router.post("/login", login);

router.get("/profile",
  authMiddleware,
  getProfile
);
router.get("/users", 
    authMiddleware,
    getAllUser
)


export default router