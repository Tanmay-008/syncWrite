import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';

type User = {
    userId: string;
    userName: string;
    email: string;
}

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({

    user: null,
    isAuthenticated: false,

    login: (userData: User) => set({
        user: userData,
        isAuthenticated: true
    }),

    logout: () => set({
        user: null,
        isAuthenticated: false
    }),

    checkAuth: () => {
        const token = localStorage.getItem("idToken");

        if (token) {
            try {
                const decodedUser = jwtDecode<User>(token);
                set({ user: decodedUser, isAuthenticated: true });
            } catch (error) {
                localStorage.removeItem("idToken");
                set({ user: null, isAuthenticated: false });
            }
        } else {
            set({ user: null, isAuthenticated: false });
        }
    },
}));