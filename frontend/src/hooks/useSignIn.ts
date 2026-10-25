import { axiosAPI } from '@/lib/axios';
import { useState } from 'react';

export const useSignIn = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signInUser = async (userName: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axiosAPI.post('/auth/login', { userName, password });
            const { idToken } = response.data;

            localStorage.setItem("idToken", idToken);

            return true;
        } catch (err: any) {
            console.error("Login failed:", err);
            setError(err.response?.data?.message || "Invalid email or password");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { signInUser, isLoading, error };
};