'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Briefcase, User, FileText, Settings, Heart, Bell, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserHub() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
            }
            setLoading(false);
        };
        checkUser();
    }, [router]);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'المستخدم';

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">

            {/* Top Bar */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 font-bold text-blue-900 text-xl">
                    <Briefcase className="w-6 h-6" />
                    <span>مسار</span>
                </Link>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><Bell className="w-5 h-5" /></button>
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar */}
                    <aside className="space-y-2">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-6 text-center">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="font-bold text-lg mb-1">{userName}</h2>
                            <p className="text-slate-500 text-sm mb-4">مطور برمجيات</p>
                            <Link href="/u/editprofile" className="block w-full py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                                تعديل الملف الشخصي
                            </Link>
                        </div>

                        <nav className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            {[
                                { icon: Briefcase, label: 'لوحة التحكم', href: '/u', active: true },
                                { icon: User, label: 'الملف الشخصي', href: '/u/profile' },
                                { icon: FileText, label: 'سيرتي الذاتية', href: '/dashboard/cv' },
                                { icon: Heart, label: 'الوظائف المحفوظة', href: '/u/saved' },
                                { icon: Settings, label: 'الإعدادات', href: '/u/settings' },
                            ].map((item, i) => (
                                <Link key={i} href={item.href} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium hover:bg-slate-50 transition-colors ${item.active ? 'text-blue-600 bg-blue-50/50 border-r-4 border-blue-600' : 'text-slate-600'}`}>
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            ))}
                            <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100">
                                <LogOut className="w-5 h-5" />
                                تسجيل الخروج
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-6">

                        {/* Welcome Card */}
                        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h1 className="text-3xl font-bold mb-2">أهلاً، {userName} 👋</h1>
                                <p className="text-blue-100 max-w-xl">
                                    أكملت 70% من ملفك الشخصي. أضف مهاراتك الآن لتظهر في نتائج البحث الأولى.
                                </p>
                            </div>
                        </div>

                        {/* Recent Activity / Jobs */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">وظائف قد تهمك</h2>
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">لم نجد وظائف جديدة تطابق مهاراتك اليوم.</p>
                                <button className="text-blue-600 text-sm font-bold mt-2 hover:underline">تحديث تفضيلات الوظيفة</button>
                            </div>
                        </div>

                    </main>
                </div>
            </div>
        </div>
    );
}
