import { Response, NextFunction } from "express";
import { documentService } from "../service/documnets.service";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../middleware/auth.middleware";

export const createDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { documentName, userId } = req.body;
        const authorId = req.user?.userId || userId;
        const response = await documentService(authorId!, documentName);
        return res.status(201).json(
            new ApiResponse(201, response, "Document created successfully")
        );
    } catch (error) {
        next(error);
        return error
    }
}