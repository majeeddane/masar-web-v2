'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
// استيراد الأيقونات لتجميل التصميم
import { Home, FileText, Settings, LogOut, User, LayoutDashboard, FolderOpen } from 'lucide-react';
// استيراد العميل الذي أصلحناه للتو
import { supabase } from '@/lib/supabaseClient';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname(); // لمعرفة الصفحة الحالية وتلوين الزر النشط

    // دالة تسجيل الخروج
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    // قائمة الروابط في القائمة الجانبية
    const menuItems = [
        { name: 'الرئيسية', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'مشاريعي', icon: FolderOpen, path: '/dashboard/projects' },
        { name: 'الفواتير', icon: FileText, path: '/dashboard/invoices' },
        { name: 'الإعدادات', icon: Settings, path: '/dashboard/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 text-right dir-rtl">

            {/* 1. القائمة الجانبية (Sidebar) */}
            <aside className="w-64 bg-white border-l border-gray-200 hidden md:flex flex-col justify-between shadow-sm">

                {/* اللوجو في الأعلى */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        M
                    </div>
                    <span className="text-xl font-bold text-gray-800 tracking-wide">مسار</span>
                </div>

                {/* روابط التنقل */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* زر تسجيل الخروج في الأسفل */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* 2. منطقة المحتوى (Main Content) */}
            <main className="flex-1 overflow-y-auto">
                {/* شريط علوي بسيط (Header) */}
                <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
                    <h1 className="text-lg font-semibold text-gray-700">لوحة التحكم</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* هنا يظهر محتوى الصفحات */}
                <div className="p-8">
                    {children}
                </div>
            </main>

        </div>
    );
}