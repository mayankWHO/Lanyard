"use client";

import { Suspense } from "react";
import VerifyEmailContent from "./VerifyEmailContent";

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-cream flex items-center justify-center">
                    <div className="text-warm-gray text-sm animate-pulse">Verifying…</div>
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
