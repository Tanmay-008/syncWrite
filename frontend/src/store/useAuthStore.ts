import { create } from 'zustand';

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
    login: (userData: User) => void;
    logout: () => void;
    checkAuth: () => void;
};

const getStoredUser = (): User | null => {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return null;

        const parsed = JSON.parse(storedUser);
        if (parsed && (parsed.userId || parsed.id) && parsed.userName) {
            return {
                userId: parsed.userId || parsed.id || "",
                id: parsed.id || parsed.userId || "",
                userName: parsed.userName,
                email: parsed.email || "",
                role: parsed.role || "user",
            };
        }
        return null;
    } catch {
        return null;
    }
};

const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set) => ({
    user: initialUser,
    isAuthenticated: !!initialUser,

    login: (userData: User) => {
        const normalizedUser: User = {
            userId: userData.userId || userData.id || "",
            id: userData.id || userData.userId || "",
            userName: userData.userName,
            email: userData.email,
            role: userData.role || "user",
        };

        try {
            localStorage.setItem("user", JSON.stringify(normalizedUser));
            localStorage.removeItem("idToken");
        } catch (e) {
            console.error("Failed to save user in localStorage", e);
        }

        set({
            user: normalizedUser,
            isAuthenticated: true,
        });
    },

    logout: () => {
        try {
            localStorage.removeItem("user");
            localStorage.removeItem("idToken");
        } catch (e) {
            console.error("Failed to remove user from localStorage", e);
        }

        set({
            user: null,
            isAuthenticated: false,
        });
    },

    checkAuth: () => {
        const user = getStoredUser();
        if (user) {
            set({ user, isAuthenticated: true });
        } else {
            set({ user: null, isAuthenticated: false });
        }
    },
}));
