export default function Footer() {
    return (
        <footer id="cta" className="relative bg-charcoal text-cream overflow-hidden">
            {/* CTA section */}
            <div className="relative z-10 py-24 sm:py-32">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl md:text-6xl text-cream leading-tight">
                        You wouldn&apos;t be here if the
                        <br className="hidden sm:block" /> way you&apos;ve been working
                        <br className="hidden sm:block" />{" "}
                        <span className="text-gold">was working.</span>
                    </h2>

                    <p className="mt-8 text-warm-gray text-lg max-w-2xl mx-auto leading-relaxed">
                        It&apos;s time for something better. Try Lanyard free.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="#"
                            className="group inline-flex items-center gap-2.5 bg-gold text-charcoal px-8 py-4 rounded-full text-base font-bold hover:bg-gold-dark transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-gold/20"
                        >
                            Try Lanyard
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
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                        
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="relative z-10 border-t border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <span className="font-[family-name:var(--font-dm-serif)] text-lg">
                            Lanyard
                        </span>
                        <span className="text-warm-gray text-sm">
                            Made by mayankWHO.
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* GitHub */}
                        <a
                            href="https://github.com/mayankWHO/"
                            target="_blank"
                            className="text-warm-gray hover:text-cream transition-colors"
                            aria-label="GitHub"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                        {/* Twitter/X */}
                        <a
                            href="https://x.com/kyaayaarmayank/"
                            target = "_blank"
                            className="text-warm-gray hover:text-cream transition-colors"
                            aria-label="Twitter"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        {/* Email */}
                        <a
                            href="mailto:mahavirmayank111@gmail.com"
                            target="_blank"
                            className="text-warm-gray hover:text-cream transition-colors"
                            aria-label="Email"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M22 7l-10 7L2 7" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Background decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
        </footer>
    );
}
