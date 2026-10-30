import { useState, useCallback, useEffect } from "react";
import { axiosAPI } from "@/lib/axios";
import { useAuthStore, type User } from "@/store/useAuthStore";

export const useCheckAuth = (autoCheck = true) => {
    const [isLoading, setIsLoading] = useState(autoCheck);
    const [error, setError] = useState<string | null>(null);
    const { user, isAuthenticated, setUser, setIsAuthenticated } = useAuthStore();

    const checkAuth = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosAPI.get("/user/get-me");
            const resData = response.data?.data || response.data;
            const fetchedUser = resData?.user;

            if (fetchedUser) {
                const normalizedUser: User = {
                    userId: fetchedUser.userId || fetchedUser.id || fetchedUser._id || "",
                    id: fetchedUser.id || fetchedUser.userId || fetchedUser._id || "",
                    userName: fetchedUser.userName,
                    email: fetchedUser.email,
                    role: fetchedUser.role || "user",
                };
                setUser(normalizedUser);
                setIsAuthenticated(true);
                return normalizedUser;
            } else {
                setUser(null);
                setIsAuthenticated(false);
                return null;
            }
        } catch (err: any) {
            setUser(null);
            setIsAuthenticated(false);
            setError(err?.response?.data?.message || "Not authenticated");
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [setUser, setIsAuthenticated]);

    useEffect(() => {
        if (autoCheck) {
            checkAuth();
        }
    }, [autoCheck, checkAuth]);

    return { user, isAuthenticated, isLoading, error, checkAuth };
};

