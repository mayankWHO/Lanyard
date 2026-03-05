import Link from "next/link";
import Iridescence from "@/components/Iridescence";
import { ArrowLeftIcon } from "./AuthIcons";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12">
            {/* Iridescence background */}
            <div className="absolute inset-0 opacity-20">
                <Iridescence
                    color={[0.95, 0.85, 0.6]}
                    mouseReact={false}
                    amplitude={0.06}
                    speed={0.4}
                />
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cream/80 via-cream/50 to-cream/90" />

            {/* Floating decorative orbs */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float animation-delay-300" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md mx-auto px-6">
                {/* Back to home */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-warm-gray hover:text-charcoal transition-colors mb-8 group"
                >
                    <span className="transition-transform group-hover:-translate-x-1 inline-block">
                        <ArrowLeftIcon />
                    </span>
                    <span className="text-sm font-medium">Back to home</span>
                </Link>

                {/* Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_40px_rgba(29,29,31,0.08)] border border-soft-border/50">
                    {children}
                </div>

                {/* Bottom branding */}
                <p className="text-center text-xs text-warm-gray/60 mt-6">
                    © 2026 Lanyard. Built with care.
                </p>
            </div>
        </div>
    );
}
