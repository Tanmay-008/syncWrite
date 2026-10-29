import { axiosAPI } from '@/lib/axios';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export const useSignIn = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signInUser = async (userName: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axiosAPI.post('/user/signin', { userName, password });
            const resData = response.data?.data || response.data;
            const user = resData?.user;

            if (user) {
                useAuthStore.getState().login(user);
            }

            return true;
        } catch (err: any) {
            console.error("Login failed:", err);
            setError(err.response?.data?.message || "Invalid username or password");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { signInUser, isLoading, error };
};
