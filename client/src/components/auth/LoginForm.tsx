"use client";

import { useState } from "react";
import AuthInput from "./AuthInput";
import SocialButtons from "./SocialButtons";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "./AuthIcons";

interface LoginFormProps {
    onForgotPassword: () => void;
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    return (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
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
                className="w-full bg-charcoal text-cream font-semibold py-3.5 rounded-full hover:bg-charcoal-light transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-charcoal/10 text-sm mt-2"
            >
                Log in
            </button>

            <SocialButtons label="or continue with" />
        </form>
    );
}
