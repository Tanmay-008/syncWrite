import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { UserResponse } from "../types/type";
import { getMe, userLogin, userRegister } from "../service/user.service";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../service/jwt.service";
import { UserModel } from "../model/user.model";

const getBaseCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? ("none" as const) : ("lax" as const),
        path: "/",
    };
};

const getAccessTokenCookieOptions = () => ({
    ...getBaseCookieOptions(),
    maxAge: 15 * 60 * 1000,
});

const getRefreshTokenCookieOptions = () => ({
    ...getBaseCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const login = asyncHandler(async (req: any, res: any) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        throw new ApiError(400, "username and password are required");
    }

    const user = await userLogin({ userName, password });

    const tokenPayload = {
        userId: user._id.toString(),
        role: user.role || "user",
        email: user.email,
        userName: user.userName,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await UserModel.findByIdAndUpdate(user._id, {
        $set: { refreshToken },
    });

    const userResponse: UserResponse = {
        id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role || "user",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions())
        .json(
            new ApiResponse(200, { user: userResponse }, "user login successfully")
        );
});

export const register = asyncHandler(async (req: any, res: any) => {
    const user = await userRegister(req.body);

    const tokenPayload = {
        userId: user._id.toString(),
        role: user.role || "user",
        email: user.email,
        userName: user.userName,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await UserModel.findByIdAndUpdate(user._id, {
        $set: { refreshToken },
    });

    const userResponse: UserResponse = {
        id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        role: user.role || "user",
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions())
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
});

export const refreshAccessToken = asyncHandler(async (req: any, res: any) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "refresh token is missing");
    }

    let decodedToken: any;
    try {
        decodedToken = await verifyRefreshToken(incomingRefreshToken);
    } catch (error) {
        throw new ApiError(401, "invalid or expired refresh token");
    }

    if (!decodedToken?.userId) {
        throw new ApiError(401, "invalid refresh token payload");
    }

    const user = await UserModel.findById(decodedToken.userId);
    if (!user) {
        throw new ApiError(401, "invalid refresh token: user not found");
    }

    if (incomingRefreshToken !== user.refreshToken) {
        await UserModel.findByIdAndUpdate(user._id, {
            $unset: { refreshToken: 1 },
        });
        throw new ApiError(401, "refresh token is expired or already used");
    }

    const tokenPayload = {
        userId: user._id.toString(),
        role: user.role || "user",
        email: user.email,
        userName: user.userName,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await UserModel.findByIdAndUpdate(user._id, {
        $set: { refreshToken: newRefreshToken },
    });

    return res
        .status(200)
        .cookie("accessToken", newAccessToken, getAccessTokenCookieOptions())
        .cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions())
        .json(
            new ApiResponse(
                200,
                { accessToken: newAccessToken, refreshToken: newRefreshToken },
                "access token refreshed successfully"
            )
        );
});

export const logoutUser = asyncHandler(async (req: any, res: any) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    let decodedRefreshToken: any;
    try {
        decodedRefreshToken = await verifyRefreshToken(incomingRefreshToken);
    } catch (error) {
        const options = getBaseCookieOptions();
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "user logged out successfully"));
    }

    if (decodedRefreshToken?.userId) {
        await UserModel.findByIdAndUpdate(decodedRefreshToken.userId, {
            $unset: { refreshToken: 1 },
        });
    }

    const options = getBaseCookieOptions();

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "user logged out successfully")
        );
});