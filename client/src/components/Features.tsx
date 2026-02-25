"use client";

import { useEffect, useRef, useState } from "react";
import {
    DashboardIllustration,
    TeamIllustration,
    ChartIllustration,
    CalendarIllustration,
    ChatIllustration,
    ShieldIllustration,
} from "@/components/features/illustrations";

/* ─── Types ─── */

interface FeatureItem {
    title: string;
    description: string;
    bg: string;
    illustration: React.ReactNode;
    gridClass: string;
    isHero?: boolean;
}

/* ─── Feature data ─── */

const features: FeatureItem[] = [
    {
        title: "Everything in one place",
        description:
            "No more scattered tools. Tasks, files, conversations, and deadlines live together — right where you need them.",
        bg: "bg-[#FFF6E9]",
        illustration: <DashboardIllustration />,
        gridClass: "md:col-span-2 md:row-span-2",
        isHero: true,
    },
    {
        title: "Teams stay in sync",
        description:
            "Everyone sees the same picture. No more status meetings just to find out what's going on.",
        bg: "bg-[#FCE8F0]",
        illustration: <TeamIllustration />,
        gridClass: "md:col-span-2",
    },
    {
        title: "See real progress",
        description: "Reports show actual work — not abstract percentages.",
        bg: "bg-[#E8F5EC]",
        illustration: <ChartIllustration />,
        gridClass: "md:col-span-1",
    },
    {
        title: "Deadlines that stick",
        description: "Set milestones, track due dates, and never miss a deadline.",
        bg: "bg-[#EDE8F8]",
        illustration: <CalendarIllustration />,
        gridClass: "md:col-span-1",
    },
    {
        title: "Focused conversations",
        description:
            "Discussions stay attached to the work. No more hunting through email threads or chat apps.",
        bg: "bg-[#E4F4F9]",
        illustration: <ChatIllustration />,
        gridClass: "md:col-span-2",
    },
    {
        title: "Calm & reliable",
        description:
            "No notification overload. No feature bloat. Just a calm, clean tool that does its job — and does it well.",
        bg: "bg-[#FCEEF4]",
        illustration: <ShieldIllustration />,
        gridClass: "md:col-span-2",
    },
];

/* ─── Bento Card ─── */

function BentoCard({ title, description, bg, illustration, isHero, index }: FeatureItem & { index: number }) {
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
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`
                group relative h-full overflow-hidden rounded-3xl ${bg}
                transition-all duration-500 ease-out cursor-default
                hover:shadow-[0_8px_32px_rgba(29,29,31,0.06)] hover:-translate-y-0.5
                ${isHero ? "p-8 sm:p-10" : "p-7 sm:p-8"}
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
            `}
            style={{ transitionDelay: `${index * 80}ms` }}
        >
            {/* Text */}
            <div className="relative z-10">
                <h3
                    className={`font-[family-name:var(--font-poppins)] font-semibold text-charcoal leading-tight mb-3
                        ${isHero ? "text-[28px] sm:text-[34px] max-w-[280px]" : "text-xl sm:text-2xl"}`}
                >
                    {title}
                </h3>
                <p
                    className={`text-warm-gray leading-relaxed
                        ${isHero ? "text-[15px] max-w-[300px]" : "text-[13px] sm:text-sm max-w-[260px]"}`}
                >
                    {description}
                </p>
            </div>

            {/* Illustration */}
            <div
                className={`transition-transform duration-500 group-hover:scale-[1.03]
                    ${isHero
                        ? "absolute bottom-0 right-0 sm:-bottom-4 sm:-right-4"
                        : "mt-4 flex justify-end -mr-2 -mb-2"
                    }`}
            >
                {illustration}
            </div>
        </div>
    );
}

/* ─── Zigzag Underline ─── */

function ZigzagUnderline() {
    return (
        <svg
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[110%]"
            viewBox="0 0 200 12"
            fill="none"
            preserveAspectRatio="none"
        >
            <path
                d="M2 8 L12 3 L22 8 L32 3 L42 8 L52 3 L62 8 L72 3 L82 8 L92 3 L102 8 L112 3 L122 8 L132 3 L142 8 L152 3 L162 8 L172 3 L182 8 L192 3 L198 6"
                stroke="#d4a843"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/* ─── Features Section ─── */

export default function Features() {
    return (
        <section id="features" className="py-24 sm:py-32 bg-cream">
            <div className="max-w-5xl mx-auto px-6">
                {/* Heading */}
                <div className="text-center mb-16">
                    <div className="inline-block relative">
                        <h1 className="font-[family-name:var(--font-poppins)] font-semibold text-5xl sm:text-6xl text-charcoal tracking-tight">
                            Features
                        </h1>
                        <ZigzagUnderline />
                    </div>
                    <p className="mt-8 text-warm-gray text-lg leading-relaxed max-w-xl mx-auto">
                        Everything you need to stop wrestling with chaos and start shipping
                        with confidence.
                    </p>
                </div>

                {/* Bento grid (4 cols)
                    Row 1: [Hero 2×2]         [Teams 2×1]
                    Row 2: [Hero cont.]       [Progress] [Deadlines]
                    Row 3: [Conversations 2×1] [Calm 2×1]
                */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {features.map((feature, i) => (
                        <div key={i} className={feature.gridClass}>
                            <BentoCard {...feature} index={i} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
