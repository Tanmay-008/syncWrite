import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler: ErrorRequestHandler = (
    err,
    req,
    res,
    next
) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            data: err.data,
        });
    }

    console.error("Unexpected Error:", err);

    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null,
    });
};