import { GoogleIcon, GitHubIcon } from "./AuthIcons";

interface SocialButtonsProps {
    label: string;
}

export default function SocialButtons({ label }: SocialButtonsProps) {
    return (
        <>
            <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-soft-border" />
                <span className="text-xs text-warm-gray font-medium">{label}</span>
                <div className="flex-1 h-px bg-soft-border" />
            </div>
            <div className="flex gap-3">
                <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-cream-dark/50 hover:bg-cream-dark text-charcoal rounded-2xl py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <GoogleIcon />
                    Google
                </button>
                <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-cream-dark/50 hover:bg-cream-dark text-charcoal rounded-2xl py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <GitHubIcon />
                    GitHub
                </button>
            </div>
        </>
    );
}
