import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { UserResponse } from "../types/type";
import { getMe, userLogin, userRegister } from "../service/user.service";
import { generateAccessToken } from "../service/jwt.service";

export const login = asyncHandler(async (req: any, res: any) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        throw new ApiError(400, "username and password are required");
    }
    const user = await userLogin({ userName, password });

    const accessToken = generateAccessToken({
        userId: user._id.toString(),
        role: user.role || "user",
        email: user.email,
        userName: user.userName,
    });

    // const idToken = generateIdToken({
    //     userId: user._id.toString(),
    //     role: user.role || "user",
    //     email: user.email,
    //     userName: user.userName,
    // });

    const userResponse: UserResponse = {
        id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role || "user"
    };

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" as const : "lax" as const,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — match JWT expiry
    };

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, { user: userResponse }, "user login successfully")
        );
});

export const register = asyncHandler(async (req: any, res: any) => {
    const user = await userRegister(req.body);

    const accessToken = generateAccessToken({
        userId: user._id.toString(),
        role: user.role || "user",
        email: user.email,
        userName: user.userName,
    });

    // const idToken = generateIdToken({
    //     userId: user._id.toString(),
    //     role: user.role || "user",
    //     email: user.email,
    //     userName: user.userName,
    // });

    const userResponse: UserResponse = {
        id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role || "user"
    };

    const isDevelopment = process.env.NODE_ENV === "development";

    const options = {
        httpOnly: true,
        secure: !isDevelopment,
        sameSite: !isDevelopment ? ("none" as const) : ("lax" as const),
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.status(201)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(201, { user: userResponse }, "user is created successfully")
        );
});

export const userAuthCheck = asyncHandler(async (req: any, res: any) => {
    const userID = req.user?.userId;
    if (!userID) {
        throw new ApiError(401, "unauthorized user");
    }
    const user = await getMe(userID);

    return res.status(200).json(
        new ApiResponse(200, { user: user }, "user is authenticated successfully")
    );
})