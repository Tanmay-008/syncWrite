import { axiosAPI } from '@/lib/axios';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export const useSignUp = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signUpUser = async (userName: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axiosAPI.post('/user/signup', { userName, email, password });
            const resData = response.data?.data || response.data;
            const idToken = resData?.idToken;
            const user = resData?.user;

            if (idToken) {
                localStorage.setItem("idToken", idToken);
            }
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }

            useAuthStore.getState().checkAuth();

            return true;
        } catch (err: any) {
            console.error("Failed to signup ,Please try again", err);
            setError(err.response?.data?.message || "User already exists , Try Login");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { signUpUser, isLoading, error };
};