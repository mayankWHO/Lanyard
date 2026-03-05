"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthInput from "./AuthInput";
import { MailIcon, CheckCircleIcon } from "./AuthIcons";

interface ForgotPasswordFormProps {
    onBackToLogin: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
    const { forgotPassword } = useAuth();

    const [email, setEmail] = useState("");
    const [resetSent, setResetSent] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        setSubmitting(true);
        const res = await forgotPassword(email);
        setSubmitting(false);

        if (res.success) {
            setResetSent(true);
        } else {
            const raw = res.error || res.message || "";
            if (raw.toLowerCase().includes("rate limit")) {
                setError("Too many requests. Please wait a few minutes before trying again.");
            } else {
                setError(raw || "Failed to send reset link.");
            }
        }
    };

    if (resetSent) {
        return (
            <div className="text-center py-4 space-y-4">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-cta/10 rounded-full flex items-center justify-center">
                        <CheckCircleIcon />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-charcoal">Check your inbox</h3>
                    <p className="text-sm text-warm-gray mt-1 max-w-xs mx-auto">
                        We&apos;ve sent a password reset link to{" "}
                        <span className="font-medium text-charcoal-light">{email || "your email"}</span>.
                        It may take a minute to arrive.
                    </p>
                </div>
                <div className="space-y-3 pt-2">
                    <button
                        type="button"
                        onClick={() => {
                            setResetSent(false);
                            setError(null);
                        }}
                        className="w-full bg-cream-dark/60 hover:bg-cream-dark text-charcoal font-semibold py-3 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
                    >
                        Resend email
                    </button>
                    <button
                        type="button"
                        onClick={onBackToLogin}
                        className="w-full text-center text-sm text-warm-gray hover:text-charcoal transition-colors font-medium"
                    >
                        ← Back to log in
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
                    {error}
                </div>
            )}

            <div className="space-y-1.5">
                <label htmlFor="forgot-email" className="block text-sm font-medium text-charcoal-light">
                    Email address
                </label>
                <AuthInput
                    id="forgot-email"
                    icon={<MailIcon />}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    focusedField={focusedField}
                    fieldName="forgot-email"
                    onFocus={setFocusedField}
                    onBlur={() => setFocusedField(null)}
                />
                <p className="text-xs text-warm-gray mt-1">
                    Enter the email associated with your account and we&apos;ll send a reset link.
                </p>
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-charcoal text-cream font-semibold py-3.5 rounded-full hover:bg-charcoal-light transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-charcoal/10 text-sm disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
                {submitting ? "Sending…" : "Send reset link"}
            </button>

            <button
                type="button"
                onClick={onBackToLogin}
                className="w-full text-center text-sm text-warm-gray hover:text-charcoal transition-colors font-medium"
            >
                ← Back to log in
            </button>
        </form>
    );
}
