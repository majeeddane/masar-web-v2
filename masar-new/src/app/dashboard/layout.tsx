'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Briefcase, Settings, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const menuItems = [
        { name: 'نظرة عامة', href: '/dashboard', icon: Home },
        { name: 'سيرتي الذاتية', href: '/dashboard/cv', icon: FileText },
        { name: 'مطابقة الوظائف', href: '/dashboard/jobs', icon: Briefcase },
        { name: 'الإعدادات', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex" dir="rtl">
            {/* Sidebar (Right Side) */}
            <aside className="w-64 bg-blue-950 text-white flex flex-col shadow-xl z-20">
                <div className="h-20 flex items-center gap-3 px-6 border-b border-blue-900/50">
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">مسار</span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-teal-500/10 text-teal-400 font-bold'
                                        : 'text-blue-200/80 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-blue-400 group-hover:text-white'}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-blue-900/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content (Left Side) */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header for Mobile/Profile (Optional, simplified here) */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800">
                        {menuItems.find(i => i.href === pathname)?.name || 'لوحة التحكم'}
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="text-left hidden md:block">
                            <div className="text-sm font-bold text-slate-700">المستخدم</div>
                            <div className="text-xs text-slate-500">مرحباً بك</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
