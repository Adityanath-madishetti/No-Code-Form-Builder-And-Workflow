import { Router } from "express";
import { optionalAuth, verifyToken } from "../middleware/auth.js";
import { generateForm } from "../controllers/aiController.js";

const router = Router();

// POST /api/ai/generate-form
router.post("/generate-form", verifyToken, generateForm);

export default router;
