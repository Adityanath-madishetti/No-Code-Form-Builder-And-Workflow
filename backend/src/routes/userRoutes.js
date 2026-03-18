import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { syncUser, getMe, updateMe } from "../controllers/userController.js";

const router = Router();

router.post("/sync", verifyToken, syncUser);
router.get("/me", verifyToken, getMe);
router.patch("/me", verifyToken, updateMe);

export default router;
