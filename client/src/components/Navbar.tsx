"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-cream/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    : "bg-transparent"
                }`}
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <a
                    href="#"
                    className="font-[family-name:var(--font-dm-serif)] text-2xl text-charcoal tracking-tight"
                >
                    Lanyard
                </a>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-8">
                    <a
                        href="#features"
                        className="text-sm font-medium text-charcoal-light hover:text-charcoal transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#faq"
                        className="text-sm font-medium text-charcoal-light hover:text-charcoal transition-colors"
                    >
                        FAQ
                    </a>
                    <a
                        href="#cta"
                        className="inline-flex items-center gap-2 bg-charcoal text-cream px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-charcoal-light transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        Get Started
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-2"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <span
                        className={`block w-5 h-0.5 bg-charcoal transition-transform duration-200 ${mobileOpen ? "rotate-45 translate-y-2" : ""
                            }`}
                    />
                    <span
                        className={`block w-5 h-0.5 bg-charcoal transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""
                            }`}
                    />
                    <span
                        className={`block w-5 h-0.5 bg-charcoal transition-transform duration-200 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""
                            }`}
                    />
                </button>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="md:hidden bg-cream/95 backdrop-blur-xl border-t border-soft-border px-6 py-4 flex flex-col gap-4 animate-fade-in">
                    <a
                        href="#features"
                        className="text-sm font-medium text-charcoal-light"
                        onClick={() => setMobileOpen(false)}
                    >
                        Features
                    </a>
                    <a
                        href="#faq"
                        className="text-sm font-medium text-charcoal-light"
                        onClick={() => setMobileOpen(false)}
                    >
                        FAQ
                    </a>
                    <a
                        href="#cta"
                        className="inline-flex items-center justify-center gap-2 bg-charcoal text-cream px-5 py-2.5 rounded-full text-sm font-semibold"
                        onClick={() => setMobileOpen(false)}
                    >
                        Get Started
                    </a>
                </div>
            )}
        </nav>
    );
}
