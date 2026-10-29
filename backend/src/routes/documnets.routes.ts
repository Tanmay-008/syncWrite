import { Router } from "express";
import { createDocument } from "../controllers/document.contoller";
import { isAuthenticatedUser } from "../middleware/auth.middleware";

export const router = Router();

router.post("/create-document", isAuthenticatedUser, createDocument);