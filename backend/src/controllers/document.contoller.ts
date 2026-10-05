import { Request, Response } from "express";
import { documentService } from "../service/documnets.service";

export const createDocument = async (req: Request, res: Response) => {
    const response = await documentService();
}