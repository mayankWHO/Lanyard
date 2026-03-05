"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { LockIcon, EyeIcon, EyeOffIcon, CheckCircleIcon } from "@/components/auth/AuthIcons";
import Link from "next/link";

export default function ResetPasswordContent() {
    const searchParams = useSearchParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const accessToken =
            searchParams.get("access_token") ||
            searchParams.get("token") ||
            (typeof window !== "undefined"
                ? new URLSearchParams(window.location.hash.substring(1)).get("access_token")
                : null);
        setToken(accessToken);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!password || !confirmPassword) {
            setError("Both fields are required.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (!token) {
            setError("Invalid or missing reset token. Please request a new reset link.");
            return;
        }

        setSubmitting(true);
        const res = await authApi.resetPassword(token, password);
        setSubmitting(false);

        if (res.success) {
            setSuccess(true);
        } else {
            setError(res.error || res.message || "Failed to reset password.");
        }
    };

    return (
        <AuthLayout>
            <div className="text-center mb-8">
                <Link href="/" className="inline-block mb-3">
                    <span className="font-[family-name:var(--font-dm-serif)] text-3xl text-charcoal">
                        Lanyard
                    </span>
                </Link>
                <h2 className="text-xl font-semibold text-charcoal font-[family-name:var(--font-poppins)]">
                    {success ? "Password reset!" : "Set new password"}
                </h2>
                <p className="mt-1 text-warm-gray text-sm">
                    {success
                        ? "You can now log in with your new password."
                        : "Choose a strong new password for your account."}
                </p>
            </div>

            {success ? (
                <div className="text-center py-4 space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-green-cta/10 rounded-full flex items-center justify-center">
                            <CheckCircleIcon />
                        </div>
                    </div>
                    <Link
                        href="/auth"
                        className="inline-block w-full bg-charcoal text-cream font-semibold py-3.5 rounded-full hover:bg-charcoal-light transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-charcoal/10 text-sm text-center"
                    >
                        Go to login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label htmlFor="reset-password" className="block text-sm font-medium text-charcoal-light">
                            New password
                        </label>
                        <AuthInput
                            id="reset-password"
                            icon={<LockIcon />}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={setPassword}
                            placeholder="At least 6 characters"
                            focusedField={focusedField}
                            fieldName="reset-password"
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
                        <PasswordStrength password={password} />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="reset-confirm" className="block text-sm font-medium text-charcoal-light">
                            Confirm password
                        </label>
                        <AuthInput
                            id="reset-confirm"
                            icon={<LockIcon />}
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="Repeat your password"
                            focusedField={focusedField}
                            fieldName="reset-confirm"
                            onFocus={setFocusedField}
                            onBlur={() => setFocusedField(null)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-charcoal text-cream font-semibold py-3.5 rounded-full hover:bg-charcoal-light transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-charcoal/10 text-sm disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Resetting…" : "Reset password"}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
}
