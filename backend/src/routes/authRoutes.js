import { Router } from "express";
import { loginByEmail } from "../controllers/authController.js";

const router = Router();

router.post("/login", loginByEmail);

export default router;
