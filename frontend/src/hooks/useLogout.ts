import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosAPI } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

export const useLogout = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const logout = async () => {
        setIsLoading(true);
        try {
            await axiosAPI.post("/user/logout");
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            useAuthStore.getState().setUser(null);
            useAuthStore.getState().setIsAuthenticated(false);
            setIsLoading(false);
            navigate("/signin", { replace: true });
        }
    };

    return { logout, isLoading };
};
