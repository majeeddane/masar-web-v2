'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import { Bell, MessageSquare, Briefcase, User, Menu, X, Building2, BookOpen, LayoutDashboard, FileText, Home } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [unreadNotif, setUnreadNotif] = useState(0);
    const [unreadMsg, setUnreadMsg] = useState(0);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);

        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { count: notifCount } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false);
            setUnreadNotif(notifCount || 0);

            const { count: msgCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', user.id)
                .eq('is_read', false);
            setUnreadMsg(msgCount || 0);
        };

        fetchData();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [supabase]);

    const NAV_LINKS = [
        { name: 'الرئيسية', href: '/', icon: Home },
        { name: 'الوظائف الشاغرة', href: '/jobs', icon: Building2 },
        { name: 'الشركات المميزة', href: '/companies', icon: Briefcase },
        { name: 'الباحثين عن عمل', href: '/talents', icon: User },
        { name: 'مركز المعرفة', href: '/blog', icon: BookOpen },
        { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
        { name: 'وظائفي', href: '/dashboard/my-jobs', icon: FileText },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${isScrolled ? 'py-2 bg-white/95 backdrop-blur-xl shadow-md border-b border-slate-200' : 'py-3 bg-white border-b border-slate-100'}`} dir="rtl">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
                {/* Ensure flex layout justifies between the 3 main sections properly and centers them vertically */}
                <div className="flex items-center justify-between gap-4 md:gap-8">

                    <Link href="/" className="flex items-center gap-2 group flex-shrink-0 z-[1001]">
                        <div className="relative w-[130px] h-[45px] lg:w-[150px] lg:h-[55px] overflow-hidden transition-transform group-hover:scale-105 rounded-lg">
                            <Image
                                src="/logo.png"
                                alt="Masar Logo"
                                fill
                                className="object-cover md:object-contain object-right scale-110 md:scale-125 origin-right"
                                priority
                            />
                        </div>
                    </Link>

                    {/* القائمة الوسطى - Compact Layout */}
                    {/* flex-1 to allow flexible center space if needed, hidden on mobile/small tablets, visible from lg+ (1024px) */}
                    <div className="hidden lg:flex flex-1 justify-center items-center min-w-0">
                        <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-2xl border border-slate-200/50">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    // Reduced padding and font size slightly to fit nicely on standard laptops
                                    className={`flex items-center gap-1.5 px-2.5 py-2 xl:px-3 text-[12px] xl:text-[13px] font-bold transition-all whitespace-nowrap overflow-hidden text-ellipsis ${pathname === link.href ? 'bg-white text-[#115d9a] shadow-sm' : 'text-slate-500 hover:text-[#115d9a] hover:bg-white/50'}`}
                                >
                                    <link.icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0 ${pathname === link.href ? 'text-[#115d9a]' : 'text-slate-400'}`} />
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* الأزرار اليسرى */}
                    <div className="flex items-center justify-end gap-2 xl:gap-3 flex-shrink-0 z-[1001]">
                        <div className="flex items-center gap-1.5">
                            <Link href="/notifications" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#115d9a] transition-all relative">
                                <Bell className="w-5 h-5" />
                                {unreadNotif > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                        {unreadNotif}
                                    </span>
                                )}
                            </Link>
                            <Link href="/messages" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#115d9a] transition-all relative">
                                <MessageSquare className="w-5 h-5" />
                                {unreadMsg > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#115d9a] text-white text-[10px] font-black w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                        {unreadMsg}
                                    </span>
                                )}
                            </Link>
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

                        <Link href="/profile" className="flex items-center gap-2 p-1 pl-3 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-sm transition-all group bg-slate-50/50">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:bg-[#115d9a] group-hover:text-white transition-colors overflow-hidden shadow-sm flex-shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
                                <span className="text-[11px] font-black text-slate-800">حسابي</span>
                                <span className="text-[9px] text-slate-500 font-bold group-hover:text-[#115d9a] transition-colors">ملف شخصي</span>
                            </div>
                        </Link>

                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[#115d9a] text-white shadow-lg active:scale-95 transition-transform z-[1002]">
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* القائمة الجانبية للجوال */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-2xl p-4 max-h-[85vh] overflow-y-auto z-[998]">
                    <div className="grid grid-cols-1 gap-2">
                        {NAV_LINKS.map((link) => (
                            <Link key={link.href} href={link.href} className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${pathname === link.href ? 'bg-blue-50 text-[#115d9a]' : 'hover:bg-slate-50 text-slate-700'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                <link.icon className={`w-5 h-5 ${pathname === link.href ? 'text-[#115d9a]' : 'text-slate-400'}`} />
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}