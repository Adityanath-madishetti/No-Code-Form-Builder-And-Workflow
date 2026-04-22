import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    createGroup,
    listGroups,
    updateGroup,
    deleteGroup
} from "../controllers/groupController.js";

const router = Router();

router.post("/", verifyToken, createGroup);
router.get("/", verifyToken, listGroups);
router.patch("/:groupId", verifyToken, updateGroup);
router.delete("/:groupId", verifyToken, deleteGroup);

export default router;
