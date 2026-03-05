"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthInput from "./AuthInput";
import PasswordStrength from "./PasswordStrength";
import SocialButtons from "./SocialButtons";
import { MailIcon, LockIcon, UserIcon, AtIcon, EyeIcon, EyeOffIcon } from "./AuthIcons";

interface SignupFormProps {
    onSwitchToLogin?: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
    const { register, loading: authLoading } = useAuth();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEmailTaken, setIsEmailTaken] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setSubmitting(true);
        const res = await register(email, password, {
            full_name: name || undefined,
            username: username || undefined,
        });
        setSubmitting(false);

        if (res.success) {
            router.push("/dashboard");
        } else {
            const errMsg = res.message || res.error || "Registration failed. Please try again.";
            setError(errMsg);
            setIsEmailTaken(errMsg.toLowerCase().includes("already exists"));
        }
    };

    const isLoading = submitting || authLoading;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
                    {error}
                    {isEmailTaken && onSwitchToLogin && (
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="block mt-1.5 text-charcoal font-semibold hover:underline"
                        >
                            Log in instead →
                        </button>
                    )}
                </div>
            )}

            <div className="space-y-1.5">
                <label htmlFor="signup-name" className="block text-sm font-medium text-charcoal-light">
                    Full name
                </label>
                <AuthInput
                    id="signup-name"
                    icon={<UserIcon />}
                    value={name}
                    onChange={setName}
                    placeholder="Jane Doe"
                    focusedField={focusedField}
                    fieldName="signup-name"
                    onFocus={setFocusedField}
                    onBlur={() => setFocusedField(null)}
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="signup-username" className="block text-sm font-medium text-charcoal-light">
                    Username
                </label>
                <AuthInput
                    id="signup-username"
                    icon={<AtIcon />}
                    value={username}
                    onChange={setUsername}
                    placeholder="janedoe"
                    focusedField={focusedField}
                    fieldName="signup-username"
                    onFocus={setFocusedField}
                    onBlur={() => setFocusedField(null)}
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="signup-email" className="block text-sm font-medium text-charcoal-light">
                    Email
                </label>
                <AuthInput
                    id="signup-email"
                    icon={<MailIcon />}
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    focusedField={focusedField}
                    fieldName="signup-email"
                    onFocus={setFocusedField}
                    onBlur={() => setFocusedField(null)}
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="signup-password" className="block text-sm font-medium text-charcoal-light">
                    Password
                </label>
                <AuthInput
                    id="signup-password"
                    icon={<LockIcon />}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="At least 6 characters"
                    focusedField={focusedField}
                    fieldName="signup-password"
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

            {/* Terms */}
            <p className="text-xs text-warm-gray leading-relaxed">
                By creating an account, you agree to our{" "}
                <span className="text-charcoal-light font-medium cursor-pointer hover:text-charcoal transition-colors">
                    Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-charcoal-light font-medium cursor-pointer hover:text-charcoal transition-colors">
                    Privacy Policy
                </span>
                .
            </p>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-charcoal text-cream font-semibold py-3.5 rounded-full hover:bg-charcoal-light transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-charcoal/10 text-sm disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
                {isLoading ? "Creating account…" : "Create account"}
            </button>

            <SocialButtons label="or sign up with" />
        </form>
    );
}
