import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    listVersions,
    getLatestVersion,
    getVersion,
    createVersion,
    updateVersion,
    publishVersion,
} from "../controllers/formVersionController.js";

// mergeParams: true allows access to :formId from parent router
const router = Router({ mergeParams: true });

router.get("/", verifyToken, listVersions);
router.get("/latest", verifyToken, getLatestVersion);
router.post("/", verifyToken, createVersion);
router.post("/publish", verifyToken, publishVersion);
router.get("/:version", verifyToken, getVersion);
router.put("/:version", verifyToken, updateVersion);

export default router;
