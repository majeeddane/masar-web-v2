
import Link from 'next/link';
import { Briefcase, LayoutDashboard, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
    return (
        <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all h-20 flex items-center">
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo & Main Links */}
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:bg-blue-800 transition-colors">
                            <Briefcase className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <span className="text-3xl font-black text-blue-950 tracking-tighter">مسار</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8 text-[15px] font-bold text-gray-600">
                        <Link href="/" className="hover:text-blue-700 transition-colors">الرئيسية</Link>
                        <Link href="/jobs" className="hover:text-blue-700 transition-colors">الوظائف</Link>
                        <Link href="/companies" className="hover:text-blue-700 transition-colors">الدليل</Link>
                        <Link href="/blog" className="hover:text-blue-700 transition-colors">المقالات</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <NotificationBell />

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden md:inline">لوحة التحكم</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
