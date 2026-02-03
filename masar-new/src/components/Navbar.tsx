import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import LogoutButton from './LogoutButton';
import { User, Briefcase, LayoutDashboard, MessageCircle } from 'lucide-react';
import UnreadBadge from './UnreadBadge';

export default async function Navbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/80" dir="rtl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* الشعار */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-[#0084db] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                            م
                        </div>
                        <span className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-[#0084db] transition-colors">
                            مسار
                        </span>
                    </Link>

                    {/* القائمة الرئيسية */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/talents" className="text-gray-600 hover:text-[#0084db] font-bold transition-colors">
                            تصفح الكفاءات
                        </Link>
                        <Link href="/jobs" className="text-gray-600 hover:text-[#0084db] font-bold transition-colors flex items-center gap-2">
                            سوق العمل
                        </Link>
                    </div>

                    {/* منطقة الإجراءات */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                {/* رابط لوحة التحكم (جديد) */}
                                <Link
                                    href="/jobs/dashboard"
                                    className="hidden md:flex items-center gap-2 text-gray-700 font-bold hover:text-[#0084db] transition-colors bg-gray-50 px-3 py-2 rounded-lg"
                                    title="إدارة الوظائف"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    لوحة التحكم
                                </Link>

                                <Link
                                    href="/messages"
                                    className="hidden md:flex items-center gap-2 text-gray-700 font-bold hover:text-[#0084db] transition-colors bg-gray-50 px-3 py-2 rounded-lg relative"
                                    title="الرسائل"
                                >
                                    <div className="relative">
                                        <MessageCircle className="w-4 h-4" />
                                        <UnreadBadge />
                                    </div>
                                    المحادثات
                                </Link>

                                <Link
                                    href="/talents/join"
                                    className="hidden md:flex items-center gap-2 text-gray-700 font-bold hover:text-[#0084db] transition-colors"
                                    title="ملفي الشخصي"
                                >
                                    <User className="w-5 h-5" />
                                </Link>

                                <div className="border-r border-gray-200 pr-4 mr-2">
                                    <LogoutButton />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="text-gray-600 hover:text-[#0084db] font-bold px-4 py-2 transition-colors"
                                >
                                    دخول
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-[#0084db] text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-[#006bb3] hover:shadow-xl transition-all hover:-translate-y-0.5"
                                >
                                    حساب جديد
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}
