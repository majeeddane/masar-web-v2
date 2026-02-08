'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import ConversationsList from '@/components/ConversationsList';
import ChatInterface from '@/components/ChatInterface';
import { Loader2 } from 'lucide-react';

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('user_id');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            setLoading(false);
        };
        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 text-[#115d9a] animate-spin" />
            </div>
        );
    }

    if (!currentUser) {
        // Ideally redirect or show login prompt, but for now just empty
        return null;
    }

    return (
        <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-gray-50 overflow-hidden font-sans" dir="rtl">

            {/* Conversations List - Hidden on mobile if chat is open */}
            <div className={`w-full md:w-[350px] lg:w-[400px] border-l border-gray-200 bg-white z-10 ${userId ? 'hidden md:block' : 'block'}`}>
                <ConversationsList />
            </div>

            {/* Chat Interface - Hidden on mobile if no chat open */}
            <div className={`flex-1 bg-gray-100 relative ${!userId ? 'hidden md:block' : 'block fixed inset-0 z-20 md:static'}`}>
                {userId ? (
                    <ChatInterface currentUserId={currentUser.id} contactId={userId} />
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400">
                        <img src="https://cdni.iconscout.com/illustration/premium/thumb/start-messaging-8075364-6499874.png" alt="Select Chat" className="w-64 opacity-50 mb-4 mix-blend-multiply" />
                        <h2 className="text-xl font-bold text-gray-600">اختر محادثة للبدء</h2>
                        <p className="text-sm mt-2">تواصل مع الشركات والباحثين عن عمل فوراً</p>
                    </div>
                )}
            </div>
        </div>
    );
}