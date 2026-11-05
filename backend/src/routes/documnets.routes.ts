import { Router } from "express";
import {
    createDocument,
    getAccessInfo,
    requestAccess,
    approveAccess,
    rejectAccess,
    getUserDocuments,
    deleteDocument,
} from "../controllers/document.contoller";
import { isAuthenticatedUser } from "../middleware/auth.middleware";

export const router = Router();

router.post("/create-document", isAuthenticatedUser, createDocument);
router.get("/user-documents", isAuthenticatedUser, getUserDocuments);
router.delete("/:id", isAuthenticatedUser, deleteDocument);
router.get("/:id/access-info", isAuthenticatedUser, getAccessInfo);
router.post("/:id/request-access", isAuthenticatedUser, requestAccess);
router.post("/:id/approve-access", isAuthenticatedUser, approveAccess);
router.post("/:id/reject-access", isAuthenticatedUser, rejectAccess);