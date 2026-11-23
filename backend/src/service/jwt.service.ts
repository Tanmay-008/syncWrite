import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import { ApiError } from "../utils/ApiError";
import { UserModel } from "../model/user.model";

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
        expiresIn: '7d'
    });

    return token;
}

export const generateRefreshToken = (payload: AccessTokenPayload) => {
    const secretKey = process.env.ACCESS_TOKEN_SECRET || process.env.SECRET_KEY;

    if (!secretKey) {
        logger.error("FATAL: Access token secret key not found in environment variables");
        throw new ApiError(500, "Internal Server Configuration Error");
    }

    return jwt.sign(payload, secretKey, {
        expiresIn: "30d",
        algorithm: 'HS256'
    })
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
        const decodedToken = jwt.verify(token, secretKey, { algorithms: ['HS256'] }) as AccessTokenPayload;
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

export const verifyRefreshToken = async (token: string) => {
    const secretKey = process.env.ACCESS_TOKEN_SECRET || process.env.SECRET_KEY;

    if (!secretKey) {
        logger.error("FATAL: Access token secret key not found in environment variables");
        throw new ApiError(500, "Internal Server Configuration Error");
    }

    const decodedToken = jwt.verify(token, secretKey) as AccessTokenPayload;
    const user = await UserModel.findById(decodedToken?.userId);
    if (!user) {
        logger.error("Error: Invalid Refresh Token");
        throw new ApiError(401, "Invalid authentication token");
    }

    return decodedToken

}