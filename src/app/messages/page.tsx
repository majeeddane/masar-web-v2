'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import ConversationsList from '@/components/ConversationsList';
import ChatInterface from '@/components/ChatInterface';
import { Loader2, MessageSquare, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Support all query parameter variations
    const userId = searchParams.get('user_id') || searchParams.get('userId') || searchParams.get('to') || searchParams.get('contact_id');
    const jobId = searchParams.get('job_id') || searchParams.get('refJob') || searchParams.get('job');
    const talentId = searchParams.get('talent_id') || searchParams.get('talent');
    const title = searchParams.get('title') || searchParams.get('item_title');
    const type = searchParams.get('type') || (jobId ? 'job' : talentId ? 'talent' : undefined);

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const supabase = getSupabaseBrowserClient();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            setLoading(false);
        };
        checkAuth();
    }, [supabase]);

    if (loading) {
        return (
            <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 text-[#115d9a] animate-spin" />
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 p-4 font-sans" dir="rtl">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-100">
                    <div className="w-16 h-16 bg-blue-50 text-[#115d9a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">تسجيل الدخول للمحادثة</h2>
                    <p className="text-slate-500 mb-6 text-sm">
                        يجب عليك تسجيل الدخول بحسابك في مسار لتتمكن من إرسال واستقبال الرسائل بخصوص الإعلانات.
                    </p>
                    <Link
                        href={`/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/messages')}`}
                        className="w-full py-3.5 bg-[#115d9a] hover:bg-[#0e4d82] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                        <LogIn className="w-5 h-5" /> تسجيل الدخول الآن
                    </Link>
                </div>
            </div>
        );
    }

    const adContext = (jobId || talentId || title) ? {
        id: jobId || talentId || undefined,
        title: title || undefined,
        type: type || (jobId ? 'job' : 'talent'),
        url: jobId ? `/jobs/view/${jobId}` : talentId ? `/talents/view/${talentId}` : undefined
    } : undefined;

    return (
        <div className="flex h-[calc(100vh-54px)] md:h-[calc(100vh-70px)] lg:h-[calc(100vh-80px)] bg-gray-50 overflow-hidden font-sans" dir="rtl">

            {/* Conversations List - Hidden on mobile if chat is open */}
            <div className={`w-full md:w-[350px] lg:w-[400px] border-l border-gray-200 bg-white z-10 ${userId ? 'hidden md:block' : 'block'}`}>
                <ConversationsList />
            </div>

            {/* Chat Interface - Hidden on mobile if no chat open */}
            <div className={`flex-1 bg-gray-100 relative ${!userId ? 'hidden md:block' : 'block fixed inset-0 z-20 md:static'}`}>
                {userId ? (
                    <ChatInterface 
                        currentUserId={currentUser.id} 
                        contactId={userId} 
                        adContext={adContext}
                    />
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                        <div className="w-20 h-20 bg-blue-50 text-[#115d9a] rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-700 mb-1">اختر محادثة للبدء</h2>
                        <p className="text-sm text-gray-500 max-w-sm">تواصل مع أصحاب العمل والباحثين عن كفاءات فوراً من خلال نظام المحادثات المباشرة.</p>
                    </div>
                )}
            </div>
        </div>
    );
}