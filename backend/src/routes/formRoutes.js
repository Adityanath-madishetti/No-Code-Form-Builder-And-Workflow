import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    createForm,
    listForms,
    getForm,
    updateForm,
    deleteForm,
} from "../controllers/formController.js";
import formVersionRoutes from "./formVersionRoutes.js";
import submissionRoutes from "./submissionRoutes.js";

const router = Router();

// Form CRUD
router.post("/", verifyToken, createForm);
router.get("/", verifyToken, listForms);
router.get("/:formId", verifyToken, getForm);
router.patch("/:formId", verifyToken, updateForm);
router.delete("/:formId", verifyToken, deleteForm);

// Nested routes
router.use("/:formId/versions", formVersionRoutes);
router.use("/:formId/submissions", submissionRoutes);

export default router;
