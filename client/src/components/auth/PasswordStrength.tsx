export function getPasswordStrength(password: string) {
    if (password.length === 0) return { label: "", color: "", width: "0%" };
    if (password.length < 6) return { label: "Weak", color: "bg-red-400", width: "25%" };
    if (password.length < 10) return { label: "Fair", color: "bg-yellow-400", width: "50%" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password))
        return { label: "Strong", color: "bg-green-500", width: "100%" };
    return { label: "Good", color: "bg-gold", width: "75%" };
}

interface PasswordStrengthProps {
    password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
    const strength = getPasswordStrength(password);

    if (password.length === 0) return null;

    return (
        <div className="pt-1.5 space-y-1">
            <div className="h-1 bg-cream-dark rounded-full overflow-hidden">
                <div
                    className={`h-full ${strength.color} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: strength.width }}
                />
            </div>
            <p className="text-xs text-warm-gray">
                Password strength: <span className="font-medium">{strength.label}</span>
            </p>
        </div>
    );
}
