import { ApiError } from "../utils/ApiError";
import { user } from "../types/type";
import { compareData, encryptData } from "../utils/security";
import { UserModel } from "../model/user.model";

type UserLoginData = {
    userName: string,
    password: string
}

export const userLogin = async (data: UserLoginData) => {
    const user = await UserModel.findOne({ userName: data.userName });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await compareData(data.password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    return user;
}

export const userRegister = async (data: user) => {
    const userExists = await UserModel.findOne({ userName: data.userName });

    if (userExists) {
        throw new ApiError(409, "Username already exists");
    }
    const hashedPassword = await encryptData(data.password);

    const user = await UserModel.create({
        userName: data.userName,
        email: data.email,
        password: hashedPassword,
    });
    return user;
}

export const getMe = async (userId: string) => {

    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }


    return user
};
