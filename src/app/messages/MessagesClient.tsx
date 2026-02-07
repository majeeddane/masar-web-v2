'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import ConversationsList from '@/components/ConversationsList';
import ChatInterface from '@/components/ChatInterface';
import { createBrowserClient } from '@supabase/ssr';
import { Home, MessageSquare, User, Briefcase } from 'lucide-react';

// 1. Internal Component
function MessagesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const rawConversationId = searchParams.get('c');

    // Sanitize ID
    const selectedConversationId = rawConversationId ? rawConversationId.replace(/['"]/g, '') : null;

    const [user, setUser] = useState<any>(null);

    // Fetch User
    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    // Handle Selection
    const handleSelectConversation = (id: string) => {
        router.push(`/messages?c=${id}`);
    };

    return (
        <div className="flex h-[calc(100dvh-80px)] md:h-[calc(100vh-100px)] overflow-hidden bg-white md:bg-transparent md:gap-4 font-sans">

            {/* --- Conversations List ---
               Mobile: Hidden if conversation is selected.
               Desktop: Always visible.
            */}
            <div className={`
                w-full md:w-1/3 lg:w-1/4 h-full bg-white md:rounded-3xl md:shadow-sm border-r md:border-0 border-gray-100 flex flex-col
                ${selectedConversationId ? 'hidden md:flex' : 'flex'} 
            `}>
                <div className="flex-1 overflow-y-auto">
                    <ConversationsList
                        currentUser={user}
                        selectedId={selectedConversationId || undefined}
                        onSelectConversation={handleSelectConversation}
                    />
                </div>

                {/* Mobile Bottom Nav (Visible only when List is visible on Mobile) */}
                <div className="md:hidden bg-white border-t border-gray-100 flex justify-around items-center p-3 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 flex-none">
                    <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Home className="w-6 h-6" />
                        <span className="text-[10px] font-medium">الرئيسية</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-blue-600">
                        <MessageSquare className="w-6 h-6 fill-blue-100" />
                        <span className="text-[10px] font-bold">الرسائل</span>
                    </button>
                    <button onClick={() => router.push('/jobs')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Briefcase className="w-6 h-6" />
                        <span className="text-[10px] font-medium">الوظائف</span>
                    </button>
                    <button onClick={() => router.push('/profile')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <User className="w-6 h-6" />
                        <span className="text-[10px] font-medium">حسابي</span>
                    </button>
                </div>
            </div>

            {/* --- Chat Interface ---
               Mobile: Visible ONLY if conversation selected (Fullscreen).
               Desktop: Always visible (Static).
            */}
            <div className={`
                ${selectedConversationId ? 'fixed inset-0 z-50 bg-white md:static md:z-auto' : 'hidden'} 
                md:block md:w-2/3 lg:w-3/4 h-full
            `}>
                <ChatInterface
                    currentUser={user}
                    conversationId={selectedConversationId || undefined}
                    targetUserId={undefined}
                    jobId={undefined}
                />
            </div>
        </div>
    );
}

// 2. Main Wrapper
export default function MessagesClient() {
    return (
        <div className="container mx-auto p-0 md:p-4 h-[calc(100dvh-64px)]">
            <Suspense fallback={<div className="flex justify-center p-10">جاري التحميل...</div>}>
                <MessagesContent />
            </Suspense>
        </div>
    );
}
