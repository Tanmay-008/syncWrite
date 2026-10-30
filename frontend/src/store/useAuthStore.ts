import { create } from "zustand";

export type User = {
    userId: string;
    id?: string;
    userName: string;
    email: string;
    role?: string;
};

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    setIsAuthenticated: (status: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    setUser: (user) => set({ user }),
    setIsAuthenticated: (status) => set({ isAuthenticated: status }),
}));



