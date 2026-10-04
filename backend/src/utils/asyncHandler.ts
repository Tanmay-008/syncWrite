import { Request, Response, NextFunction } from "express";

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch((err: any) => next(err));
    };
};