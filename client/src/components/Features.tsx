"use client";

import { useEffect, useRef, useState } from "react";

const features = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
        title: "Everything in one place",
        description:
            "No more scattered tools. Tasks, files, conversations, and deadlines live together — right where you need them.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        title: "Teams stay in sync",
        description:
            "Everyone sees the same picture. No more status meetings just to find out what's going on.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
        ),
        title: "See real progress",
        description:
            "Reports show actual work completed — not abstract percentages. Confidence, not confusion.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
            </svg>
        ),
        title: "Deadlines that stick",
        description:
            "Set milestones, track due dates, and never let a deadline sneak up on you again.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        title: "Focused conversations",
        description:
            "Discussions stay attached to the work. No more hunting through email threads or chat apps.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Calm & reliable",
        description:
            "No notification overload. No feature bloat. Just a calm, clean tool that does its job — and does it well.",
    },
];

function FeatureCard({
    icon,
    title,
    description,
    index,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`group relative bg-white/70 backdrop-blur-sm border border-soft-border rounded-2xl p-8 transition-all duration-500 hover:shadow-xl hover:shadow-charcoal/5 hover:-translate-y-1 ${visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            {/* Icon container */}
            <div className="w-12 h-12 rounded-xl bg-cream-dark flex items-center justify-center text-charcoal mb-5 group-hover:bg-gold/20 transition-colors duration-300">
                {icon}
            </div>

            <h3 className="font-[family-name:var(--font-dm-serif)] text-xl text-charcoal mb-3">
                {title}
            </h3>

            <p className="text-warm-gray text-sm leading-relaxed">
                {description}
            </p>

            {/* Hover accent bar */}
            <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
        </div>
    );
}

export default function Features() {
    return (
        <section id="features" className="py-24 sm:py-32 bg-cream">
            <div className="max-w-6xl mx-auto px-6">
                {/* Section header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold-dark mb-4">
                        Features
                    </span>
                    <h2 className="font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl text-charcoal leading-tight">
                        Let&apos;s walk through it.
                    </h2>
                    <p className="mt-5 text-warm-gray text-lg leading-relaxed">
                        Everything you need to stop wrestling with chaos and start shipping
                        with confidence.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <FeatureCard key={i} {...feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
