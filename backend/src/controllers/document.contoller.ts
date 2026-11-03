import { Response, NextFunction } from "express";
import {
    documentService,
    getDocumentAccessInfo,
    requestDocumentAccess,
    approveDocumentAccess,
    rejectDocumentAccess,
} from "../service/documnets.service";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiError } from "../utils/ApiError";

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
        return error;
    }
};

export const getAccessInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const docId = req.params.id as string;
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError(401, "User not authenticated");
        }
        const response = await getDocumentAccessInfo(docId, userId);
        return res.status(200).json(
            new ApiResponse(200, response, "Access info retrieved successfully")
        );
    } catch (error) {
        next(error);
        return error;
    }
};

export const requestAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const docId = req.params.id as string;
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError(401, "User not authenticated");
        }
        const response = await requestDocumentAccess(docId, userId);
        return res.status(200).json(
            new ApiResponse(200, response, response.message)
        );
    } catch (error) {
        next(error);
        return error;
    }
};

export const approveAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const docId = req.params.id as string;
        const authorId = req.user?.userId;
        const { targetUserId } = req.body;
        if (!authorId) {
            throw new ApiError(401, "User not authenticated");
        }
        if (!targetUserId) {
            throw new ApiError(400, "targetUserId is required");
        }
        const response = await approveDocumentAccess(docId, authorId, targetUserId);
        return res.status(200).json(
            new ApiResponse(200, response, response.message)
        );
    } catch (error) {
        next(error);
        return error;
    }
};

export const rejectAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const docId = req.params.id as string;
        const authorId = req.user?.userId;
        const { targetUserId } = req.body;
        if (!authorId) {
            throw new ApiError(401, "User not authenticated");
        }
        if (!targetUserId) {
            throw new ApiError(400, "targetUserId is required");
        }
        const response = await rejectDocumentAccess(docId, authorId, targetUserId);
        return res.status(200).json(
            new ApiResponse(200, response, response.message)
        );
    } catch (error) {
        next(error);
        return error;
    }
};