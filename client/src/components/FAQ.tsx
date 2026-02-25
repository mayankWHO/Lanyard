"use client";

import { useState } from "react";

const faqs = [
    {
        question: "What exactly is Lanyard?",
        answer:
            "Lanyard is a project management tool designed for smaller, hungrier teams. It puts tasks, conversations, files, and deadlines in one predictably organized place — no setup complexity, no feature bloat.",
    },
    {
        question: "How is this different from Trello / Asana / Notion?",
        answer:
            "Most tools either overwhelm you with features or fall short when things get real. Lanyard hits the sweet spot — powerful enough to manage serious work, simple enough that everyone on your team actually uses it.",
    },
    {
        question: "Can I use it with clients?",
        answer:
            "Absolutely. Invite clients into specific projects, control what they can see, and keep all feedback, approvals, and decisions on the record — no more chasing emails.",
    },
    {
        question: "What about security and data?",
        answer:
            "Your data is stored in redundant, encrypted servers and backed up multiple times daily. We take security seriously — and we're happy to share our full security overview with your IT team.",
    },
    {
        question: "Is there a free plan?",
        answer:
            "Yes! You can try Lanyard completely free — no credit card required. When you're ready to upgrade, our pricing is straightforward with no hidden fees.",
    },
    {
        question: "Can I export my data?",
        answer:
            "Of course. You can export everything at any time, fully self-service. We provide it in a browsable format so it's actually useful, not just a data dump.",
    },
];

function FAQItem({
    question,
    answer,
    isOpen,
    onToggle,
}: {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border-b border-soft-border last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-6 text-left group cursor-pointer"
            >
                <span className="font-[family-name:var(--font-dm-serif)] text-lg text-charcoal group-hover:text-charcoal-light transition-colors pr-4">
                    {question}
                </span>
                <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full border border-soft-border flex items-center justify-center transition-all duration-300 ${isOpen
                            ? "bg-charcoal border-charcoal rotate-45"
                            : "bg-transparent group-hover:border-charcoal"
                        }`}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isOpen ? "#FFF9F0" : "#1D1D1F"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"
                    }`}
            >
                <p className="text-warm-gray leading-relaxed pr-12">{answer}</p>
            </div>
        </div>
    );
}

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 sm:py-32 bg-cream-dark">
            <div className="max-w-3xl mx-auto px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold-dark mb-4">
                        FAQ
                    </span>
                    <h2 className="font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl text-charcoal leading-tight">
                        Got questions? Great.
                    </h2>
                    <p className="mt-5 text-warm-gray text-lg">
                        Here are answers to the ones we hear most.
                    </p>
                </div>

                {/* Accordion */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-soft-border px-8">
                    {faqs.map((faq, i) => (
                        <FAQItem
                            key={i}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === i}
                            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
