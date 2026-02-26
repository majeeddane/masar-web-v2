'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Bell, ArrowRight, Clock, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchNotifications = async () => {
            // هنا نقوم بجلب الإشعارات من جدول notifications الحقيقي
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setNotifications(data);
            }
            setLoading(false);
        };

        fetchNotifications();
    }, [supabase]);

    // ✅ حساب عدد الإشعارات غير المقروءة ديناميكياً
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4" dir="rtl">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 mb-6 font-bold hover:text-[#115d9a]">
                    <ArrowRight className="w-5 h-5" /> العودة
                </button>

                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <Bell className="w-6 h-6 text-[#115d9a]" /> الإشعارات
                        </h1>
                        {/* ✅ الرقم الآن يظهر بناءً على البيانات الحقيقية */}
                        <span className="bg-blue-50 text-[#115d9a] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            {unreadCount} غير مقروءة
                        </span>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {loading ? (
                            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <Link key={notif.id} href={notif.href || '#'} className={`p-6 hover:bg-slate-50 transition-all flex gap-4 items-start group ${!notif.is_read ? 'bg-blue-50/30' : ''}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {notif.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-[#115d9a]">{notif.title}</h3>
                                        <p className="text-slate-500 text-sm">{notif.message}</p>
                                        <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-bold">
                                            <Clock className="w-3 h-3" /> {new Date(notif.created_at).toLocaleTimeString('ar-SA')}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-20 text-center text-slate-400 font-bold">لا توجد إشعارات حالياً</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}