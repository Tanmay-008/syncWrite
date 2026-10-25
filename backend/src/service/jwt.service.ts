import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import { ApiError } from "../utils/ApiError";

export function createToken(userId: string) {
    const secretKey = process.env.SECRET_KEY;

    if (!secretKey) {
        logger.error("FATAL: Secret key not found in environment variables");
        throw new ApiError(500, "Internal Server Configuration Error");
    }

    const payload = {
        user_id: userId,
        role: "admin"
    };

    const token = jwt.sign(payload, secretKey, {
        algorithm: 'HS256',
        expiresIn: '30m'
    });

    return token;
}

export function verifyToken(token: string) {
    const secretKey = process.env.SECRET_KEY;

    if (!secretKey) {
        logger.error("FATAL: Secret key not found in environment variables");
        throw new ApiError(500, "Internal Server Configuration Error");
    }

    try {
        const decoded = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
        return decoded;
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            logger.error("Error: Token expired");
            throw new ApiError(401, "Session expired, please login again");
        } else {
            logger.error("Error: Invalid token!");
            throw new ApiError(401, "Invalid authentication token");
        }
    }
}