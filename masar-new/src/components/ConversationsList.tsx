'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User, Search, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface InboxItem {
    conversation_id: string;
    other_user_id: string;
    other_user_name: string;
    other_user_avatar: string | null;
    job_id: string | null;
    last_message: string | null;
    last_message_time: string | null;
    last_message_is_read: boolean | null;
    last_message_sender_id: string | null;
    unread_count: number;
}

interface ConversationsListProps {
    currentUser: any;
    selectedId?: string;
}

export default function ConversationsList({ currentUser, selectedId, onSelectConversation }: ConversationsListProps & { onSelectConversation?: (id: string) => void }) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();
    const [conversations, setConversations] = useState<InboxItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchInbox() {
            // Call the RPC function
            const { data, error } = await supabase.rpc('get_inbox');
            if (data) {
                setConversations(data);
            }
            setIsLoading(false);
        }
        fetchInbox();

        // Realtime subscription for list updates
        const channel = supabase
            .channel('inbox_updates')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                () => {
                    fetchInbox();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const filtered = conversations.filter(c => {
        const matchesSearch = c.other_user_name?.toLowerCase().includes(search.toLowerCase()) ||
            c.last_message?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || (c.unread_count > 0);
        return matchesSearch && matchesFilter;
    });

    const handleItemClick = async (conversationId: string) => {
        // 1. Optimistic Update: Clear unread count locally immediately
        setConversations(prev => prev.map(c =>
            c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c
        ));

        // 2. RPC Call: Mark as read in DB
        try {
            console.log("mark_read", conversationId);
            const { error } = await supabase.rpc('mark_conversation_read', {
                p_conversation_id: conversationId
            });

            if (error) {
                console.error("Error marking read:", error);
            }
        } catch (err) {
            console.error("Exception marking read:", err);
        }

        if (onSelectConversation) {
            onSelectConversation(conversationId);
        }
        router.push(`/messages?c=${conversationId}`);
    };

    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>لا توجد لديك محادثات حتى الآن.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl md:border border-gray-100 overflow-hidden">
            {/* Header / Search */}
            <div className="p-4 border-b border-gray-100 space-y-4">
                <h2 className="text-xl font-black text-gray-900 px-1">الرسائل</h2>

                <div className="relative">
                    <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:border-blue-500 outline-none transition-all"
                        placeholder="بحث في المحادثات..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex bg-gray-50 p-1 rounded-xl">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        الكل
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${filter === 'unread' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        غير مقروء
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filtered.map(item => {
                    const isSelected = selectedId === item.conversation_id;
                    return (
                        <div
                            role="button"
                            key={item.conversation_id}
                            onClick={() => handleItemClick(item.conversation_id)}
                            className={`block p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer text-right ${isSelected ? 'bg-blue-50/60 border-blue-100' : ''}`}
                        >
                            <div className="flex gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                        <User className="w-6 h-6" />
                                    </div>
                                    {item.unread_count > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                                            {item.unread_count}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-sm truncate ${item.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {item.other_user_name}
                                        </h3>
                                        {item.last_message_time && (
                                            <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
                                                {new Date(item.last_message_time).toLocaleDateString('ar-SA')}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm truncate ${item.unread_count > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                        {item.last_message || 'مرفق'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
