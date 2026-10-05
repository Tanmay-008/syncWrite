import { Request, Response, NextFunction } from "express";
import { documentService } from "../service/documnets.service";
import { ApiResponse } from "../utils/ApiResponse";

export const createDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentName } = req.body;
        const response = await documentService(documentName);
        return res.status(201).json(
            new ApiResponse(201, response, "Document created successfully")
        );
    } catch (error) {
        next(error);
    }
}