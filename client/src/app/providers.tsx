"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionProvider } from "@/contexts/PermissionContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <PermissionProvider>{children}</PermissionProvider>
        </AuthProvider>
    );
}
