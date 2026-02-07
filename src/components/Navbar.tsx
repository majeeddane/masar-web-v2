'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
    Menu,
    X,
    MessageCircle,
    Home,
    Briefcase,
    Users,
    LayoutDashboard,
    LogOut,
    User as UserIcon,
    FileText
} from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();
    const router = useRouter();

    const supabase = useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []);

    useEffect(() => {
        let channel: any = null;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);

            if (channel) {
                supabase.removeChannel(channel);
                channel = null;
            }

            if (session?.user) {
                const fetchCount = async () => {
                    const { count } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('receiver_id', session.user.id)
                        .is('read_at', null);
                    setUnreadCount(count || 0);
                };
                fetchCount();

                channel = supabase
                    .channel(`navbar_messages_${session.user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'messages',
                            filter: `receiver_id=eq.${session.user.id}`
                        },
                        () => fetchCount()
                    )
                    .subscribe();
            } else {
                setUnreadCount(0);
            }
        });

        return () => {
            subscription.unsubscribe();
            if (channel) supabase.removeChannel(channel);
        };
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    // --- تحديث الروابط: فصل الوظائف عن الباحثين عن عمل ---
    const navLinks = [
        { name: 'الرئيسية', href: '/', icon: Home },
        { name: 'الوظائف الشاغرة', href: '/jobs', icon: Briefcase },
        { name: 'الباحثين عن عمل', href: '/talents', icon: Users },
        ...(user ? [
            { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
            { name: 'وظائفي', href: '/my-jobs', icon: FileText },
        ] : []),
    ];

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/90 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">

                    {/* 1. Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-[#115d9a] rounded-xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
                                م
                            </div>
                            <span className="text-xl md:text-2xl font-black text-gray-900 tracking-tight group-hover:text-[#115d9a] transition-colors">
                                مسار
                            </span>
                        </Link>
                    </div>

                    {/* 2. Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-reverse space-x-6 lg:space-x-8">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-2 font-bold transition-all duration-200 ${isActive
                                            ? 'text-[#115d9a] bg-blue-50 px-3 py-1.5 rounded-lg'
                                            : 'text-gray-600 hover:text-[#115d9a] hover:bg-gray-50/50 px-3 py-1.5 rounded-lg'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* 3. Action Area */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {user ? (
                            <>
                                <Link href="/messages" className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors group">
                                    <MessageCircle className="w-6 h-6 group-hover:text-[#115d9a]" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white animate-pulse">
                                            {unreadCount > 9 ? '+9' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                <div className="hidden md:flex items-center gap-3 border-r border-gray-200 pr-4 mr-2">
                                    <Link href="/profile" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#115d9a] hover:text-white transition-all shadow-sm">
                                        <UserIcon className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors text-sm"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="hidden md:flex items-center gap-3">
                                <Link href="/login" className="text-gray-600 hover:text-[#115d9a] font-bold px-3 py-2">دخول</Link>
                                <Link href="/signup" className="bg-[#115d9a] text-white px-5 py-2 rounded-xl font-bold hover:bg-[#0e4d82] transition-colors shadow-md shadow-blue-900/10">حساب جديد</Link>
                            </div>
                        )}

                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-xl px-4 py-4 space-y-2 z-50">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${isActive
                                        ? 'bg-blue-50 text-[#115d9a]'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {link.name}
                            </Link>
                        );
                    })}
                    {user ? (
                        <>
                            <div className="h-px bg-gray-100 my-2"></div>
                            <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50">
                                <UserIcon className="w-5 h-5" /> ملفي الشخصي
                            </Link>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 text-right">
                                <LogOut className="w-5 h-5" /> تسجيل خروج
                            </button>
                        </>
                    ) : (
                        <div className="pt-2 space-y-2">
                            <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-3 rounded-xl font-bold text-gray-700 bg-gray-50">دخول</Link>
                            <Link href="/signup" onClick={() => setIsOpen(false)} className="block w-full text-center py-3 rounded-xl font-bold text-white bg-[#115d9a]">حساب جديد</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}