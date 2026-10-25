import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { UserResponse } from "../types/type";
import { userLogin, userRegister } from "../service/user.service";
import { generateAccessToken, generateIdToken } from "../service/jwt.service";

export const login = asyncHandler(async (req: any, res: any) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        throw new ApiError(400, "username and password are required");
    }
    const user = await userLogin({ userName, password });

    const accessToken = generateAccessToken({
        userId: user._id.toString(),
        role: user.role || "user"
    });

    const idToken = generateIdToken({
        userId: user._id.toString(),
        role: user.role || "user",
        email: user.email
    });

    const userResponse: UserResponse = {
        id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role || "user"
    };

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("idToken", idToken, options)
        .json(
            new ApiResponse(200, { user: userResponse, idToken }, "user login successfully")
        );
});

export const register = asyncHandler(async (req: any, res: any) => {
    const user = await userRegister(req.body);

    const accessToken = generateAccessToken({
        userId: user._id.toString(),
        role: user.role || "user"
    });

    const idToken = generateIdToken({
        userId: user._id.toString(),
        role: user.role || "user",
        email: user.email
    });

    const userResponse: UserResponse = {
        id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role || "user"
    };

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("idToken", idToken, options)
        .json(
            new ApiResponse(201, { user: userResponse, idToken }, "user is created successfully")
        );
});
