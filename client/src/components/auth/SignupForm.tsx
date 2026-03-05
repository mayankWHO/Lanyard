"use client";

import { useState } from "react";
import AuthInput from "./AuthInput";
import PasswordStrength from "./PasswordStrength";
import SocialButtons from "./SocialButtons";
import { MailIcon, LockIcon, UserIcon, AtIcon, EyeIcon, EyeOffIcon } from "./AuthIcons";

export default function SignupForm() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    return (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
                    placeholder="At least 8 characters"
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
                className="w-full bg-charcoal text-cream font-semibold py-3.5 rounded-full hover:bg-charcoal-light transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-charcoal/10 text-sm"
            >
                Create account
            </button>

            <SocialButtons label="or sign up with" />
        </form>
    );
}
