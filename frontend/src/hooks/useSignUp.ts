import { axiosAPI } from '@/lib/axios';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

export const useSignUp = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signUpUser = async (userName: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axiosAPI.post('/user/signup', { userName, email, password });
            const resData = response.data?.data || response.data;
            const user = resData?.user;

            if (user) {
                useAuthStore.getState().setUser(user);
                useAuthStore.getState().setIsAuthenticated(true);
            }

            return true;
        } catch (err: unknown) {
            console.error("Login failed:", err);

            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const backendMessage = err.response?.data?.message;

                if (status === 409) {
                    setError(backendMessage || "User already exists");
                } else if (err.response) {
                    setError(backendMessage || "Something went wrong. Please try again.");
                } else if (err.request) {
                    setError("Unable to connect to server. Check your internet connection.");
                } else {
                    setError("Request failed. Please try again.");
                }
            } else {
                setError("An unexpected error occurred. Please try again.");
            }

            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { signUpUser, isLoading, error };
};
