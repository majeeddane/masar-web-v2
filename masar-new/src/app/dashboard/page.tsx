'use client';

import { useEffect, useState } from 'react';
import { Activity, Eye, FileText, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardOverview() {
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const nameFromEmail = user.email?.split('@')[0];
                    // Capitalize first letter if it's from email
                    const formattedName = user.user_metadata?.full_name ||
                        (nameFromEmail ? nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1) : 'زائر');
                    setUserName(formattedName);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-40 bg-slate-200 rounded-2xl"></div>
                    <div className="h-40 bg-slate-200 rounded-2xl"></div>
                    <div className="h-40 bg-slate-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-x-12 -translate-y-12 group-hover:bg-teal-500/30 transition-all duration-700" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-x-12 translate-y-12 group-hover:bg-purple-500/30 transition-all duration-700" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span className="text-xs font-bold tracking-wider">النسخة الاحترافية</span>
                    </div>
                    <h1 className="text-4xl font-black mb-4 tracking-tight leading-tight">
                        مرحباً بك، <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-teal-200">{userName} 👋</span>
                    </h1>
                    <p className="text-blue-100 max-w-xl text-lg leading-relaxed opacity-90">
                        لوحة التحكم الخاصة بك جاهزة. أكمل ملفك الشخصي لزيادة فرصك في الحصول على الوظيفة المناسبة بنسبة 80%.
                    </p>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: CV Progress */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:translate-y-[-4px] transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">75%</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">اكتمال السيرة الذاتية</h3>
                    <p className="text-sm text-slate-500 mb-4 font-medium">أضف الخبرات السابقة لتحسين سيرتك</p>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: '75%' }}></div>
                    </div>
                </div>

                {/* Card 2: Active Jobs */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:translate-y-[-4px] transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full font-bold">12 وظيفة</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">وظائف تناسبك</h3>
                    <p className="text-sm text-slate-500 font-medium">بناءً على مهاراتك الحالية</p>
                </div>

                {/* Card 3: Profile Views */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:translate-y-[-4px] transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Eye className="w-6 h-6" />
                        </div>
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">+24%</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">مشاهدات الملف</h3>
                    <p className="text-sm text-slate-500 font-medium">في آخر 30 يوم</p>
                </div>
            </div>
        </div>
    );
}