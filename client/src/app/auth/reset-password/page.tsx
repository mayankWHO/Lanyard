"use client";

import { Suspense } from "react";
import ResetPasswordContent from "./ResetPasswordContent";

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-cream flex items-center justify-center">
                    <div className="text-warm-gray text-sm animate-pulse">Loading…</div>
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
