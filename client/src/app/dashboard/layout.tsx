"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    HomeIcon,
    BriefcaseIcon,
    CheckSquareIcon,
    SettingsIcon,
    LogOutIcon
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    // Sidebar is collapsed by default, expands on hover
    const isCollapsed = !isHovered;

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
            </div>
        );
    }

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    const sidebarWidth = isCollapsed ? "w-20" : "w-64";
    const mainMargin = isCollapsed ? "ml-20" : "ml-64";

    const getLinkClasses = (path: string) => {
        const isActive = pathname === path;
        return isActive
            ? "flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-900 bg-stone-100 font-medium transition-colors"
            : "flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors font-medium";
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] font-[family-name:var(--font-poppins)] flex text-stone-800">
            {/* ── Sidebar ── */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`${sidebarWidth} bg-white border-r border-stone-200 flex flex-col fixed inset-y-0 left-0 transition-all duration-300 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-stone-100 relative">
                    <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-lg leading-none">
                                L
                            </span>
                        </div>
                        {!isCollapsed && (
                            <span className="font-bold text-xl tracking-tight text-stone-900 whitespace-nowrap animate-in fade-in duration-300">
                                Lanyard
                            </span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
                    {!isCollapsed && (
                        <p className="px-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 animate-in fade-in">
                            Menu
                        </p>
                    )}
                    <Link
                        href="/dashboard"
                        className={getLinkClasses("/dashboard")}
                        title="Overview"
                    >
                        <HomeIcon size={18} className="shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">Overview</span>}
                    </Link>
                    <Link
                        href="/dashboard/projects"
                        className={getLinkClasses("/dashboard/projects")}
                        title="Projects"
                    >
                        <BriefcaseIcon size={18} className="shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">Projects</span>}
                    </Link>
                    <Link
                        href="/dashboard/tasks"
                        className={getLinkClasses("/dashboard/tasks")}
                        title="My Tasks"
                    >
                        <CheckSquareIcon size={18} className="shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">My Tasks</span>}
                    </Link>
                </nav>

                {/* User Footer */}
                <div className="p-3 border-t border-stone-100">
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent ${isCollapsed ? 'justify-center' : 'hover:bg-stone-50 hover:border-stone-200'} transition-all cursor-pointer`}>
                        <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 font-semibold shrink-0 uppercase">
                            {user.user_metadata?.full_name ? String(user.user_metadata.full_name).charAt(0) : user.email.charAt(0)}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 animate-in fade-in">
                                <p className="text-sm font-semibold text-stone-900 truncate">
                                    {user.user_metadata?.full_name ? String(user.user_metadata.full_name) : "User"}
                                </p>
                                <p className="text-xs text-stone-500 truncate">{user.email}</p>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 mt-1 w-full rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors font-medium text-left text-sm"
                        >
                            <LogOutIcon size={16} />
                            <span>Log out</span>
                        </button>
                    )}

                    {isCollapsed && (
                        <button
                            onClick={handleLogout}
                            title="Log out"
                            className="flex items-center justify-center w-full px-3 py-3 mt-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOutIcon size={18} />
                        </button>
                    )}
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <main className={`flex-1 ${mainMargin} min-h-screen flex flex-col transition-all duration-300`}>
                <header className="h-20 bg-[#fafaf9]/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between border-b border-stone-200/50">
                    <div className="flex items-center">
                        <h2 className="text-lg font-semibold text-stone-800">Workspace</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:border-stone-300 shadow-sm transition-all">
                            <SettingsIcon size={16} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8 max-w-7xl w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
