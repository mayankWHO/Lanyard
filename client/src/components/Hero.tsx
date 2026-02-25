"use client";

import Iridescence from "@/components/Iridescence";

export default function Hero() {
    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
            {/* Iridescence background */}
            <div className="absolute inset-0 opacity-30">
                <Iridescence
                    color={[0.95, 0.85, 0.6]}
                    mouseReact={false}
                    amplitude={0.08}
                    speed={0.5}
                />
            </div>

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-cream/60 via-cream/40 to-cream/90" />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">


                {/* Main headline */}
                <h1 className="font-[family-name:var(--font-poppins)] font-semibold text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-charcoal leading-[1.05] tracking-tight animate-fade-in-up opacity-0 animation-delay-100">
                    Build something
                    <br />
                    <span className="relative inline-block">
                        people love.
                        {/* Underline accent */}
                        <svg
                            className="absolute -bottom-2 left-0 w-full"
                            viewBox="0 0 300 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M2 8.5C50 2 100 4 150 6C200 8 250 3 298 7"
                                stroke="#F5C547"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="animate-fade-in animation-delay-500"
                                style={{ opacity: 0 }}
                            />
                        </svg>
                    </span>
                </h1>

                {/* Subheading */}
                <p className="mt-8 text-lg sm:text-xl text-warm-gray max-w-2xl mx-auto leading-relaxed animate-fade-in-up opacity-0 animation-delay-200">
                    Build and manage your projects with ease. The Lanyard way.
                </p>

                {/* CTA buttons */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0 animation-delay-300">
                    <a
                        href="#features"
                        className="group inline-flex items-center gap-2.5 bg-charcoal text-cream px-8 py-4 rounded-full text-base font-semibold hover:bg-charcoal-light transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-charcoal/10"
                    >
                        Let&apos;s walk through it
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform group-hover:translate-x-0.5"
                        >
                            <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                    </a>
                    <a
                        href="#cta"
                        className="inline-flex items-center gap-2 text-charcoal-light font-medium hover:text-charcoal transition-colors text-sm"
                    >
                        
                        
                    </a>
                </div>

                
                
            </div>

            
        </section>
    );
}
