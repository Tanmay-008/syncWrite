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
}));