"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { CheckCircleIcon } from "@/components/auth/AuthIcons";

export default function VerifyEmailContent() {
    const searchParams = useSearchParams();

    // Supabase verifies the token on its own server before redirecting here.
    // By the time the user lands on this page, verification is already complete.
    // We only show an error if Supabase explicitly includes one in the URL.
    const errorDesc = searchParams.get("error_description") || searchParams.get("error");
    const hasError = !!errorDesc;

    return (
        <AuthLayout>
            <div className="text-center mb-8">
                <Link href="/" className="inline-block mb-3">
                    <span className="font-[family-name:var(--font-dm-serif)] text-3xl text-charcoal">
                        Lanyard
                    </span>
                </Link>
            </div>

            {hasError ? (
                /* Error state — only when Supabase explicitly reports a problem */
                <div className="text-center py-6 space-y-5">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-red-500"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-charcoal font-[family-name:var(--font-poppins)]">
                            Verification failed
                        </h2>
                        <p className="mt-2 text-warm-gray text-sm max-w-xs mx-auto">
                            {errorDesc || "The link may be invalid or expired. Please try signing up again."}
                        </p>
                    </div>
                    <Link
                        href="/auth"
                        className="inline-block w-full bg-charcoal text-cream font-semibold py-3.5 rounded-full hover:bg-charcoal-light transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-charcoal/10 text-sm text-center"
                    >
                        Back to login
                    </Link>
                </div>
            ) : (
                /* Success state — default, since Supabase already verified the email */
                <div className="text-center py-6 space-y-5">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-green-cta/10 rounded-full flex items-center justify-center">
                            <CheckCircleIcon />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-charcoal font-[family-name:var(--font-poppins)]">
                            Email verified!
                        </h2>
                        <p className="mt-2 text-warm-gray text-sm max-w-xs mx-auto">
                            Your account is all set. You can now log in and start using Lanyard.
                        </p>
                    </div>
                    <Link
                        href="/auth"
                        className="inline-block w-full bg-charcoal text-cream font-semibold py-3.5 rounded-full hover:bg-charcoal-light transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-charcoal/10 text-sm text-center"
                    >
                        Go to login
                    </Link>
                </div>
            )}
        </AuthLayout>
    );
}
