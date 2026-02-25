/**
 * SVG illustrations for the Features bento grid.
 * Each illustration is a self-contained component sized for its card.
 */

/* ─── Dashboard / Kanban (Hero card — enlarged) ─── */

export function DashboardIllustration() {
    return (
        <svg width="340" height="280" viewBox="0 0 200 160" fill="none" className="select-none">
            {/* Board frame */}
            <rect x="20" y="10" width="160" height="140" rx="12" fill="#E8A83020" stroke="#E8A83050" strokeWidth="1.5" />

            {/* Column 1 — To Do */}
            <rect x="30" y="24" width="42" height="8" rx="4" fill="#E8A83060" />
            <rect x="30" y="38" width="42" height="28" rx="6" fill="white" stroke="#E8A83040" strokeWidth="1" />
            <rect x="36" y="44" width="20" height="3" rx="1.5" fill="#E8A83080" />
            <rect x="36" y="50" width="28" height="2" rx="1" fill="#E8A83040" />
            <rect x="36" y="55" width="16" height="2" rx="1" fill="#E8A83030" />
            <rect x="30" y="72" width="42" height="28" rx="6" fill="white" stroke="#E8A83040" strokeWidth="1" />
            <rect x="36" y="78" width="24" height="3" rx="1.5" fill="#E8A83080" />
            <rect x="36" y="84" width="30" height="2" rx="1" fill="#E8A83040" />
            <rect x="36" y="89" width="18" height="2" rx="1" fill="#E8A83030" />

            {/* Column 2 — In Progress */}
            <rect x="80" y="24" width="42" height="8" rx="4" fill="#5B9BF060" />
            <rect x="80" y="38" width="42" height="28" rx="6" fill="white" stroke="#5B9BF040" strokeWidth="1" />
            <rect x="86" y="44" width="18" height="3" rx="1.5" fill="#5B9BF080" />
            <rect x="86" y="50" width="26" height="2" rx="1" fill="#5B9BF040" />
            <rect x="86" y="55" width="14" height="2" rx="1" fill="#5B9BF030" />
            <rect x="80" y="72" width="42" height="28" rx="6" fill="white" stroke="#5B9BF040" strokeWidth="1" />
            <rect x="86" y="78" width="22" height="3" rx="1.5" fill="#5B9BF080" />
            <rect x="86" y="84" width="28" height="2" rx="1" fill="#5B9BF040" />

            {/* Column 3 — Done */}
            <rect x="130" y="24" width="42" height="8" rx="4" fill="#3CC08F60" />
            <rect x="130" y="38" width="42" height="28" rx="6" fill="white" stroke="#3CC08F40" strokeWidth="1" />
            <rect x="136" y="44" width="16" height="3" rx="1.5" fill="#3CC08F80" />
            <rect x="136" y="50" width="24" height="2" rx="1" fill="#3CC08F40" />
            <circle cx="162" cy="46" r="6" fill="#3CC08F30" />
            <path d="M159 46 L161 48.5 L165.5 43.5" stroke="#3CC08F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Person figure */}
            <circle cx="155" cy="120" r="10" fill="#E8A83040" />
            <circle cx="155" cy="116" r="4" fill="#E8A830" />
            <path d="M148 132 Q155 126 162 132" stroke="#E8A830" strokeWidth="2" strokeLinecap="round" fill="none" />
            <rect x="149" y="125" width="12" height="16" rx="6" fill="#E8A83060" />
        </svg>
    );
}

/* ─── Team / People Connected ─── */

export function TeamIllustration() {
    return (
        <svg width="180" height="120" viewBox="0 0 180 120" fill="none" className="select-none">
            {/* Central person */}
            <circle cx="90" cy="40" r="16" fill="#F2D6E8" />
            <circle cx="90" cy="35" r="7" fill="#E870A8" />
            <rect x="82" y="48" width="16" height="20" rx="8" fill="#E870A880" />

            {/* Left person */}
            <circle cx="40" cy="55" r="13" fill="#D6E4F2" />
            <circle cx="40" cy="51" r="6" fill="#5B9BF0" />
            <rect x="33" y="61" width="14" height="16" rx="7" fill="#5B9BF080" />

            {/* Right person */}
            <circle cx="140" cy="55" r="13" fill="#D6F2E4" />
            <circle cx="140" cy="51" r="6" fill="#3CC08F" />
            <rect x="133" y="61" width="14" height="16" rx="7" fill="#3CC08F80" />

            {/* Connection lines */}
            <path d="M58 52 Q75 30 82 40" stroke="#5B9BF060" strokeWidth="2" strokeDasharray="4 3" fill="none" />
            <path d="M122 52 Q105 30 98 40" stroke="#3CC08F60" strokeWidth="2" strokeDasharray="4 3" fill="none" />
            <path d="M50 72 Q90 95 130 72" stroke="#E870A840" strokeWidth="2" strokeDasharray="4 3" fill="none" />

            {/* Online status dots */}
            <circle cx="52" cy="48" r="3" fill="#3CC08F" />
            <circle cx="128" cy="48" r="3" fill="#3CC08F" />
            <circle cx="105" cy="38" r="3" fill="#3CC08F" />
        </svg>
    );
}

/* ─── Bar Chart with Trend Line ─── */

export function ChartIllustration() {
    return (
        <svg width="160" height="100" viewBox="0 0 160 100" fill="none" className="select-none">
            {/* Grid lines */}
            <line x1="20" y1="85" x2="145" y2="85" stroke="#3CC08F20" strokeWidth="1" />
            <line x1="20" y1="65" x2="145" y2="65" stroke="#3CC08F15" strokeWidth="1" />
            <line x1="20" y1="45" x2="145" y2="45" stroke="#3CC08F15" strokeWidth="1" />
            <line x1="20" y1="25" x2="145" y2="25" stroke="#3CC08F15" strokeWidth="1" />

            {/* Bars (progressive opacity) */}
            <rect x="25" y="60" width="14" height="25" rx="4" fill="#3CC08F30" />
            <rect x="45" y="45" width="14" height="40" rx="4" fill="#3CC08F50" />
            <rect x="65" y="50" width="14" height="35" rx="4" fill="#3CC08F40" />
            <rect x="85" y="35" width="14" height="50" rx="4" fill="#3CC08F60" />
            <rect x="105" y="20" width="14" height="65" rx="4" fill="#3CC08F80" />
            <rect x="125" y="12" width="14" height="73" rx="4" fill="#3CC08F" />

            {/* Trend line */}
            <path d="M32 55 L52 40 L72 45 L92 30 L112 16 L132 8" stroke="#E8A830" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="132" cy="8" r="4" fill="#E8A830" opacity="0.3" />
            <circle cx="132" cy="8" r="2" fill="#E8A830" />
        </svg>
    );
}

/* ─── Calendar with Highlighted Date ─── */

export function CalendarIllustration() {
    return (
        <svg width="140" height="110" viewBox="0 0 140 110" fill="none" className="select-none">
            {/* Frame */}
            <rect x="10" y="15" width="120" height="90" rx="10" fill="white" stroke="#9B7EE840" strokeWidth="1.5" />
            <rect x="10" y="15" width="120" height="24" rx="10" fill="#9B7EE820" />
            <rect x="10" y="29" width="120" height="10" fill="#9B7EE820" />

            {/* Rings */}
            <rect x="35" y="10" width="4" height="14" rx="2" fill="#9B7EE8" />
            <rect x="65" y="10" width="4" height="14" rx="2" fill="#9B7EE8" />
            <rect x="95" y="10" width="4" height="14" rx="2" fill="#9B7EE8" />

            {/* Day labels */}
            {[20, 38, 56, 74, 92, 110].map((x) => (
                <rect key={x} x={x} y={22} width="10" height="3" rx="1.5" fill="#9B7EE860" />
            ))}

            {/* Date grid */}
            {[0, 1, 2, 3].map((row) =>
                [0, 1, 2, 3, 4, 5].map((col) => (
                    <rect
                        key={`${row}-${col}`}
                        x={20 + col * 18}
                        y={44 + row * 14}
                        width="10"
                        height="8"
                        rx="2"
                        fill={row === 1 && col === 3 ? "#9B7EE8" : "#9B7EE815"}
                    />
                ))
            )}

            {/* Highlighted date circle + checkmark */}
            <circle cx="97" cy="62" r="9" fill="#9B7EE830" stroke="#9B7EE8" strokeWidth="1.5" />
            <path d="M93 62 L96 65 L101 59" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ─── Chat Bubbles with Typing Animation ─── */

export function ChatIllustration() {
    return (
        <svg width="180" height="110" viewBox="0 0 180 110" fill="none" className="select-none">
            {/* Bubble 1 — outgoing */}
            <rect x="10" y="10" width="100" height="36" rx="12" fill="white" stroke="#38B8E840" strokeWidth="1.5" />
            <rect x="22" y="22" width="50" height="4" rx="2" fill="#38B8E860" />
            <rect x="22" y="30" width="35" height="3" rx="1.5" fill="#38B8E830" />
            <polygon points="30,46 40,46 28,55" fill="white" stroke="#38B8E840" strokeWidth="1.5" />
            <rect x="28" y="44" width="14" height="4" fill="white" />

            {/* Bubble 2 — incoming */}
            <rect x="70" y="50" width="100" height="36" rx="12" fill="#38B8E815" stroke="#38B8E840" strokeWidth="1.5" />
            <rect x="82" y="62" width="55" height="4" rx="2" fill="#38B8E860" />
            <rect x="82" y="70" width="40" height="3" rx="1.5" fill="#38B8E840" />
            <polygon points="140,86 130,86 142,95" fill="#38B8E815" stroke="#38B8E840" strokeWidth="1.5" />
            <rect x="128" y="84" width="16" height="4" fill="#38B8E815" />

            {/* Typing indicator */}
            <rect x="12" y="58" width="52" height="20" rx="10" fill="#38B8E810" stroke="#38B8E825" strokeWidth="1" />
            <circle cx="28" cy="68" r="2.5" fill="#38B8E860">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="38" cy="68" r="2.5" fill="#38B8E860">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="48" cy="68" r="2.5" fill="#38B8E860">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
            </circle>
        </svg>
    );
}

/* ─── Shield with Sparkles ─── */

export function ShieldIllustration() {
    return (
        <svg width="140" height="120" viewBox="0 0 140 120" fill="none" className="select-none">
            {/* Glow rings */}
            <ellipse cx="70" cy="58" rx="55" ry="50" fill="#E870A808" />
            <ellipse cx="70" cy="58" rx="42" ry="38" fill="#E870A810" />

            {/* Shield body */}
            <path d="M70 10L30 28V56C30 80 70 100 70 100C70 100 110 80 110 56V28L70 10Z" fill="#E870A818" stroke="#E870A860" strokeWidth="2" strokeLinejoin="round" />
            <path d="M70 22L40 36V56C40 74 70 90 70 90C70 90 100 74 100 56V36L70 22Z" fill="white" stroke="#E870A830" strokeWidth="1" strokeLinejoin="round" />

            {/* Checkmark */}
            <path d="M55 58L65 68L87 46" stroke="#E870A8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Sparkles */}
            <circle cx="25" cy="25" r="2" fill="#E8A830" opacity="0.5" />
            <circle cx="115" cy="30" r="1.5" fill="#5B9BF0" opacity="0.5" />
            <circle cx="118" cy="80" r="2" fill="#3CC08F" opacity="0.4" />
            <circle cx="22" cy="75" r="1.5" fill="#9B7EE8" opacity="0.4" />

            {/* Star accents */}
            <path d="M120 20L122 16L124 20L128 22L124 24L122 28L120 24L116 22Z" fill="#E8A830" opacity="0.3" />
            <path d="M18 48L20 44L22 48L26 50L22 52L20 56L18 52L14 50Z" fill="#5B9BF0" opacity="0.25" />
        </svg>
    );
}
