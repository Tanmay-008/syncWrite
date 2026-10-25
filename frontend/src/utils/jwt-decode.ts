import { jwtDecode } from "jwt-decode";

interface UserProfile {
    userId: string;
    email: string;
    role: string;
}

export const getUserProfile = (): UserProfile | null => {
    const token = localStorage.getItem("idToken");

    if (!token) return null;

    try {
        const decoded = jwtDecode<UserProfile>(token);
        return decoded;
    } catch (error) {
        console.error("Invalid token format");
        return null;
    }
}