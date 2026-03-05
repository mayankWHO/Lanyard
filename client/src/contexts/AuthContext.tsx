"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import {
    authApi,
    storeTokens,
    clearTokens,
    getStoredTokens,
    type UserData,
    type ApiResponse,
    type LoginResponse,
    type RegisterResponse,
} from "@/lib/api";

/* ─── Types ─── */

interface AuthState {
    user: UserData | null;
    loading: boolean;
    error: string | null;
}

interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<ApiResponse<LoginResponse>>;
    register: (
        email: string,
        password: string,
        metadata?: { full_name?: string; username?: string }
    ) => Promise<ApiResponse<RegisterResponse>>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<ApiResponse>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Provider ─── */

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
    });

    const setError = (error: string | null) =>
        setState((s) => ({ ...s, error }));

    const clearError = () => setError(null);

    /* ── Bootstrap: check for existing session on mount ── */
    const bootstrap = useCallback(async () => {
        const tokens = getStoredTokens();
        if (!tokens) {
            setState({ user: null, loading: false, error: null });
            return;
        }

        try {
            const res = await authApi.verifyToken();
            if (res.success && res.data?.user) {
                setState({ user: res.data.user, loading: false, error: null });
            } else {
                clearTokens();
                setState({ user: null, loading: false, error: null });
            }
        } catch {
            clearTokens();
            setState({ user: null, loading: false, error: null });
        }
    }, []);

    useEffect(() => {
        bootstrap();
    }, [bootstrap]);

    /* ── Login ── */
    const login = async (email: string, password: string) => {
        setState((s) => ({ ...s, loading: true, error: null }));

        const res = await authApi.login({ email, password });

        if (res.success && res.data) {
            storeTokens({
                access_token: res.data.access_token,
                refresh_token: res.data.refresh_token,
            });
            setState({ user: res.data.user, loading: false, error: null });
        } else {
            setState((s) => ({
                ...s,
                loading: false,
                error: res.error || res.message || "Login failed",
            }));
        }

        return res;
    };

    /* ── Register ── */
    const register = async (
        email: string,
        password: string,
        metadata?: { full_name?: string; username?: string }
    ) => {
        setState((s) => ({ ...s, loading: true, error: null }));

        const res = await authApi.register({ email, password, metadata });

        if (res.success) {
            if (res.data?.access_token && res.data?.refresh_token && res.data?.user) {
                storeTokens({
                    access_token: res.data.access_token,
                    refresh_token: res.data.refresh_token,
                });
                setState((s) => ({ ...s, user: res.data!.user, loading: false, error: null }));
            } else {
                setState((s) => ({ ...s, loading: false, error: null }));
            }
        } else {
            setState((s) => ({
                ...s,
                loading: false,
                error: res.error || res.message || "Registration failed",
            }));
        }

        return res;
    };

    /* ── Logout ── */
    const logout = async () => {
        await authApi.logout();
        clearTokens();
        setState({ user: null, loading: false, error: null });
    };

    /* ── Forgot Password ── */
    const forgotPassword = async (email: string) => {
        return authApi.forgotPassword(email);
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                forgotPassword,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/* ─── Hook ─── */

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
