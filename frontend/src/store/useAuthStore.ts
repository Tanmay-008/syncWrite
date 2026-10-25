import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';

export type User = {
    userId: string;
    userName: string;
    email: string;
};

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
    checkAuth: () => void;
};

const parseUserFromToken = (token: string): User | null => {
    try {
        const decoded = jwtDecode<any>(token);
        let userName = decoded.userName;
        if (!userName) {
            try {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    userName = JSON.parse(storedUser).userName;
                }
            } catch { }
        }
        if (!userName && decoded.email) {
            userName = decoded.email.split("@")[0];
        }

        return {
            userId: decoded.userId || decoded.id || "",
            userName: userName || "User",
            email: decoded.email || "",
        };
    } catch {
        return null;
    }
};

const getInitialState = (): { user: User | null; isAuthenticated: boolean } => {
    if (typeof window === "undefined") {
        return { user: null, isAuthenticated: false };
    }
    const token = localStorage.getItem("idToken");
    if (!token) {
        return { user: null, isAuthenticated: false };
    }
    const user = parseUserFromToken(token);
    if (!user) {
        localStorage.removeItem("idToken");
        return { user: null, isAuthenticated: false };
    }
    return { user, isAuthenticated: true };
};

const initial = getInitialState();

export const useAuthStore = create<AuthState>((set) => ({
    user: initial.user,
    isAuthenticated: initial.isAuthenticated,

    login: (userData: User) =>
        set({
            user: userData,
            isAuthenticated: true,
        }),

    logout: () => {
        localStorage.removeItem("idToken");
        localStorage.removeItem("user");
        set({
            user: null,
            isAuthenticated: false,
        });
    },

    checkAuth: () => {
        const token = localStorage.getItem("idToken");

        if (token) {
            const user = parseUserFromToken(token);
            if (user) {
                set({ user, isAuthenticated: true });
            } else {
                localStorage.removeItem("idToken");
                set({ user: null, isAuthenticated: false });
            }
        } else {
            set({ user: null, isAuthenticated: false });
        }
    },
}));