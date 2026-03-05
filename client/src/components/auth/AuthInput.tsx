interface AuthInputProps {
    id: string;
    icon: React.ReactNode;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    focusedField: string | null;
    fieldName: string;
    onFocus: (f: string) => void;
    onBlur: () => void;
    rightElement?: React.ReactNode;
}

export default function AuthInput({
    id,
    icon,
    type = "text",
    value,
    onChange,
    placeholder,
    focusedField,
    fieldName,
    onFocus,
    onBlur,
    rightElement,
}: AuthInputProps) {
    return (
        <div
            className={`relative rounded-2xl transition-all duration-300 ${focusedField === fieldName
                    ? "ring-2 ring-gold/50 shadow-[0_0_0_4px_rgba(245,197,71,0.1)]"
                    : ""
                }`}
        >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray">
                {icon}
            </div>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => onFocus(fieldName)}
                onBlur={onBlur}
                placeholder={placeholder}
                className={`w-full bg-cream-dark/40 text-charcoal placeholder:text-warm-gray/60 rounded-2xl pl-12 ${rightElement ? "pr-12" : "pr-4"
                    } py-3.5 text-sm focus:outline-none focus:bg-white/80 transition-all duration-300`}
            />
            {rightElement && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {rightElement}
                </div>
            )}
        </div>
    );
}
