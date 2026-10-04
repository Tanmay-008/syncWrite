import { Router } from "express";
import { createDocument } from "../controllers/document.contoller";
export const router = Router();

router.post("/create-document", createDocument)