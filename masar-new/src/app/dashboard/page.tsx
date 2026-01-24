'use client';

import { useEffect, useState } from 'react';
import { Activity, Eye, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardOverview() {
    // متغير لتخزين اسم المستخدم
    const [userName, setUserName] = useState('...');

    // دالة لجلب بيانات المستخدم عند فتح الصفحة
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // محاولة أخذ الاسم من البيانات، أو أخذ الجزء الأول من الإيميل
                const nameFromEmail = user.email?.split('@')[0];
                setUserName(user.user_metadata?.full_name || nameFromEmail || 'زائر');
            }
        };
        getUser();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-x-12 -translate-y-12" />
                <div className="relative z-10">
                    {/* هنا يعرض الاسم الحقيقي */}
                    <h1 className="text-3xl font-bold mb-2">مرحباً بك، {userName} 👋</h1>
                    <p className="text-blue-100 max-w-xl">
                        لوحة التحكم الخاصة بك جاهزة. أكمل ملفك الشخصي لزيادة فرصك في الحصول على الوظيفة المناسبة.
                    </p>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: CV Progress */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">75%</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">اكتمال السيرة الذاتية</h3>
                    <p className="text-sm text-slate-500 mb-4">أضف الخبرات السابقة لتحسين سيرتك</p>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                </div>

                {/* Card 2: Active Jobs */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full font-bold">12 وظيفة</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">وظائف تناسبك</h3>
                    <p className="text-sm text-slate-500">بناءً على مهاراتك الحالية</p>
                </div>

                {/* Card 3: Profile Views */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Eye className="w-6 h-6" />
                        </div>
                        <span className="text-green-600 text-xs font-bold">+24%</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">مشاهدات الملف</h3>
                    <p className="text-sm text-slate-500">في آخر 30 يوم</p>
                </div>
            </div>
        </div>
    );
}