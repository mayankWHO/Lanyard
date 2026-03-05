"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

type AuthView = "login" | "signup" | "forgot";

const headings: Record<AuthView, { title: string; subtitle: string }> = {
    login: { title: "Welcome back", subtitle: "Pick up where you left off." },
    signup: { title: "Create your account", subtitle: "Start building something great." },
    forgot: { title: "Reset password", subtitle: "We\u2019ll email you a link to get back in." },
};

export default function AuthPage() {
    const [view, setView] = useState<AuthView>("login");
    const [transitioning, setTransitioning] = useState(false);

    const switchView = useCallback((target: AuthView) => {
        setTransitioning(true);
        setTimeout(() => {
            setView(target);
            setTransitioning(false);
        }, 250);
    }, []);

    return (
        <AuthLayout>
            {/* ── Header ── */}
            <div
                className={`text-center mb-8 transition-all duration-300 ${transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                    }`}
            >
                <Link href="/" className="inline-block mb-3">
                    <span className="font-[family-name:var(--font-dm-serif)] text-3xl text-charcoal">
                        Lanyard
                    </span>
                </Link>
                <h2 className="text-xl font-semibold text-charcoal font-[family-name:var(--font-poppins)]">
                    {headings[view].title}
                </h2>
                <p className="mt-1 text-warm-gray text-sm">
                    {headings[view].subtitle}
                </p>
            </div>

            {/* ── Pill toggle (login / signup) ── */}
            {view !== "forgot" && (
                <div className="flex bg-cream-dark/60 rounded-full p-1 mb-6">
                    <button
                        type="button"
                        onClick={() => view !== "login" && switchView("login")}
                        className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${view === "login"
                                ? "bg-white text-charcoal shadow-sm"
                                : "text-warm-gray hover:text-charcoal"
                            }`}
                    >
                        Log in
                    </button>
                    <button
                        type="button"
                        onClick={() => view !== "signup" && switchView("signup")}
                        className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${view === "signup"
                                ? "bg-white text-charcoal shadow-sm"
                                : "text-warm-gray hover:text-charcoal"
                            }`}
                    >
                        Sign up
                    </button>
                </div>
            )}

            {/* ── Animated form body ── */}
            <div
                className={`transition-all duration-300 ${transitioning
                        ? "opacity-0 translate-y-3 scale-[0.98]"
                        : "opacity-100 translate-y-0 scale-100"
                    }`}
            >
                {view === "login" && <LoginForm onForgotPassword={() => switchView("forgot")} />}
                {view === "signup" && <SignupForm />}
                {view === "forgot" && <ForgotPasswordForm onBackToLogin={() => switchView("login")} />}
            </div>
        </AuthLayout>
    );
}
