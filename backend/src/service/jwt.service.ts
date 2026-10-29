import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import { ApiError } from "../utils/ApiError";

interface AccessTokenPayload {
    userId: string;
    role: string;
    email: string;
    userName?: string;
}

// interface IdTokenPayload {
//     userId: string;
//     role: string;
//     email: string;
//     userName?: string;
// }

export function generateAccessToken(payload: AccessTokenPayload) {
    const secretKey = process.env.SECRET_KEY;

    if (!secretKey) {
        logger.error("FATAL: Access token secret key not found in environment variables");
        throw new ApiError(500, "Internal Server Configuration Error");
    }

    const token = jwt.sign(payload, secretKey, {
        algorithm: 'HS256',
        expiresIn: '15m'
    });

    return token;
}

// export function generateIdToken(payload: IdTokenPayload) {
//     const secretKey = process.env.ID_TOKEN_SECRET || process.env.SECRET_KEY;

//     if (!secretKey) {
//         logger.error("FATAL: ID token secret key not found in environment variables");
//         throw new ApiError(500, "Internal Server Configuration Error");
//     }

//     const token = jwt.sign(payload, secretKey, {
//         algorithm: 'HS256',
//         expiresIn: '1h'
//     });

//     return token;
// }

export function verifyAccessToken(token: string) {
    const secretKey = process.env.ACCESS_TOKEN_SECRET || process.env.SECRET_KEY;

    if (!secretKey) {
        logger.error("FATAL: Access token secret key not found in environment variables");
        throw new ApiError(500, "Internal Server Configuration Error");
    }

    try {
        const decodedToken = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
        return decodedToken;
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            logger.error("Error: Access Token expired");
            throw new ApiError(401, "Session expired, please login again");
        } else {
            logger.error("Error: Invalid Access token!");
            throw new ApiError(401, "Invalid authentication token");
        }
    }
}