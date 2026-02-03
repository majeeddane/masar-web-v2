'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import ConversationsList from '@/components/ConversationsList';
import { Loader2 } from 'lucide-react';

export default function MessagesClient() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read params
    const c = searchParams.get('c');
    const to = searchParams.get('to');
    const job = searchParams.get('job');

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/login?next=/messages');
                return;
            }
            setUser(session.user);
            setLoading(false);
        }
        checkAuth();
    }, [router, supabase]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-[#0084db]" />
            </div>
        );
    }

    if (!user) return null; // Logic handles redirect

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex" dir="rtl">
            <div className="container mx-auto p-4 md:p-6 max-w-7xl h-[calc(100vh-80px)]">
                <div className="flex h-full gap-6 bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden p-1">

                    {/* Sidebar: Conversations List */}
                    <div className={`w-full md:w-[350px] lg:w-[400px] flex-shrink-0 border-l border-gray-100 bg-white ${c ? 'hidden md:block' : 'block'}`}>
                        <ConversationsList currentUser={user} selectedId={c || undefined} />
                    </div>

                    {/* Main: Chat Thread */}
                    <div className={`flex-1 flex flex-col bg-[#f8faff] md:rounded-[25px] overflow-hidden ${!c && !to ? 'hidden md:flex' : 'flex'}`}>
                        <ChatInterface
                            currentUser={user}
                            targetUserId={to || undefined}
                            jobId={job || undefined}
                            conversationId={c || undefined}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
