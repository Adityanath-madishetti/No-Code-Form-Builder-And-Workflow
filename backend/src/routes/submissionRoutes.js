import { Router } from "express";
import { verifyToken, optionalAuth } from "../middleware/auth.js";
import {
    submitForm,
    listSubmissions,
    getSubmission,
} from "../controllers/submissionController.js";

// mergeParams: true allows access to :formId from parent router
const router = Router({ mergeParams: true });

// Submit uses optionalAuth — auth depends on form's requireLogin setting
router.post("/", optionalAuth, submitForm);

// Viewing submissions requires authentication (owner only)
router.get("/", verifyToken, listSubmissions);
router.get("/:submissionId", verifyToken, getSubmission);

export default router;
