import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../service/jwt.service";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        userName: string;
        email: string;
        role: string;
    };
}

export const isAuthenticatedUser = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;

    if (!accessToken) {
        throw new ApiError(401, "Please login to access this resource");
    }

    const decodedPayload = verifyAccessToken(accessToken);

    if (!decodedPayload || !decodedPayload.userId || !decodedPayload.userName) {
        throw new ApiError(401, "Invalid token payload");
    }

    // const user = await UserModel.findById(decodedPayload.userId);
    // if (!user) {
    //     throw new ApiError(401, "The user belonging to this token no longer exists");
    // }

    req.user = {
        userId: decodedPayload.userId,
        userName: decodedPayload.userName,
        email: decodedPayload.email,
        role: decodedPayload.role || "user"
    };

    next();
});  