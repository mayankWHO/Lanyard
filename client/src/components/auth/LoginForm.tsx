"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthInput from "./AuthInput";
import SocialButtons from "./SocialButtons";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "./AuthIcons";

interface LoginFormProps {
    onForgotPassword: () => void;
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
    const router = useRouter();
    const { login, loading: authLoading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        setSubmitting(true);
        const res = await login(email, password);
        setSubmitting(false);

        if (res.success) {
            router.push("/dashboard");
        } else {
            setError(res.error || res.message || "Login failed. Please try again.");
        }
    };

    const isLoading = submitting || authLoading;

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
                    {error}
                </div>
            )}

            <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-sm font-medium text-charcoal-light">
                    Email or username
                </label>
                <AuthInput
                    id="login-email"
                    icon={<MailIcon />}
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    focusedField={focusedField}
                    fieldName="login-email"
                    onFocus={setFocusedField}
                    onBlur={() => setFocusedField(null)}
                />
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="block text-sm font-medium text-charcoal-light">
                        Password
                    </label>
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-xs text-gold-dark hover:text-gold font-medium transition-colors"
                    >
                        Forgot password?
                    </button>
                </div>
                <AuthInput
                    id="login-password"
                    icon={<LockIcon />}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    focusedField={focusedField}
                    fieldName="login-password"
                    onFocus={setFocusedField}
                    onBlur={() => setFocusedField(null)}
                    rightElement={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-warm-gray hover:text-charcoal transition-colors"
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    }
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-charcoal text-cream font-semibold py-3.5 rounded-full hover:bg-charcoal-light transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-charcoal/10 text-sm mt-2 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
                {isLoading ? "Logging in…" : "Log in"}
            </button>

            <SocialButtons label="or continue with" />
        </form>
    );
}
