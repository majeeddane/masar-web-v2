'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
// التصحيح: استيراد العميل الجاهز مباشرة من ملف المكتبة الخاص بك
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Notification {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // تم حذف سطر const supabase = createClient() لأنه خطأ برمجي هنا

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setNotifications(data as Notification[]);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
    };

    const markAsRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    useEffect(() => {
        fetchNotifications();

        // Realtime subscription
        const channel = supabase
            .channel('notifications-changes')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    const newNotif = payload.new as Notification;
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100]">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">الإشعارات</h3>
                        <span className="text-xs text-blue-600 cursor-pointer hover:underline">تحديد الكل كمقروء</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm text-gray-800">{notif.title}</h4>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(notif.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">{notif.message}</p>
                                    {notif.link && (
                                        <Link href={notif.link} className="text-xs text-blue-600 font-bold hover:underline">
                                            عرض التفاصيل
                                        </Link>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                لا توجد إشعارات جديدة
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}