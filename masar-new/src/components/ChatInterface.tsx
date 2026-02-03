'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Send, User, Briefcase, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatInterfaceProps {
    currentUser: any;
    targetUserId?: string;
    jobId?: string;
    conversationId?: string;
}

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

interface Conversation {
    id: string;
    user1_id: string;
    user2_id: string;
    job_id?: string;
}

export default function ChatInterface({ currentUser, targetUserId, jobId, conversationId }: ChatInterfaceProps) {
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }, []);

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isOtherTyping, setIsOtherTyping] = useState(false);

    const currentUserId = currentUser?.id ?? null;

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Ref to store typing channel
    const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOtherTyping]);

    // Typing Indicator Listening (Production Grade)
    useEffect(() => {
        if (!conversationId || !currentUserId) return;

        // Cleanup previous channel if exists (safety check)
        if (typingChannelRef.current) {
            typingChannelRef.current.unsubscribe();
            supabase.removeChannel(typingChannelRef.current);
            typingChannelRef.current = null;
        }

        const channel = supabase.channel(`typing:${conversationId}`);
        typingChannelRef.current = channel;

        channel
            .on('broadcast', { event: 'typing' }, ({ payload }) => {
                // Ignore my own typing
                if (!payload?.userId || payload.userId === currentUserId) return;

                console.log("typing received", conversationId);
                setIsOtherTyping(true);

                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                    setIsOtherTyping(false);
                }, 2000);
            })
            .subscribe();

        return () => {
            // Cleanup on unmount or conversation change
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
            setIsOtherTyping(false);

            // cleanup THIS channel specifically
            channel.unsubscribe();
            supabase.removeChannel(channel);

            if (typingChannelRef.current === channel) {
                typingChannelRef.current = null;
            }
        };
    }, [conversationId, currentUserId, supabase]);

    // 1. Initialize Conversation
    useEffect(() => {
        async function initChat() {
            if (!currentUserId) return;

            // If we have a conversationId (from list click), fetch it directly
            if (conversationId) {
                // Optimistic Mark as Read
                supabase.rpc('mark_conversation_read', { p_conversation_id: conversationId });

                setIsLoading(true);

                // 2. Fetch details
                const { data: conv, error } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('id', conversationId)
                    .single();

                if (conv) {
                    setConversation(conv);
                    fetchMessages(conv.id, { initial: true });
                } else {
                    console.error("Conversation not found", error);
                    setIsLoading(false);
                }
                return;
            }

            // Fallback: If no conversationId but we have targetUserId (from "Execute" or "Contact" buttons)
            if (!targetUserId) {
                setIsLoading(false);
                setConversation(null);
                setMessages([]);
                return;
            }

            // Check for existing conversation with targetUser
            setIsLoading(true);
            let query = supabase.from('conversations').select('*')
                .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${currentUserId})`);

            if (jobId) {
                query = query.eq('job_id', jobId);
            }

            const { data: convs, error } = await query;

            if (convs && convs.length > 0) {
                setConversation(convs[0]);
                fetchMessages(convs[0].id, { initial: true });
                // Optimistic Mark as Read
                supabase.rpc('mark_conversation_read', { p_conversation_id: convs[0].id });
            } else {
                // Determine if we should create one.
                const { data: newConv, error: createError } = await supabase.from('conversations').insert({
                    user1_id: currentUserId,
                    user2_id: targetUserId,
                    job_id: jobId || null
                }).select().single();

                if (newConv) {
                    setConversation(newConv);
                    fetchMessages(newConv.id, { initial: true });
                } else if (createError) {
                    // Possible conflict or other error
                    console.error("Error creating conversation:", createError);
                }
            }
            setIsLoading(false);
        }

        initChat();
    }, [conversationId, currentUserId, targetUserId, jobId, supabase]);

    // ... fetchMessages ...
    // 2. Fetch Messages
    async function fetchMessages(convId: string, opts?: { initial?: boolean }) {
        if (opts?.initial) setIsLoading(true);

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) console.error('fetchMessages error:', error);

        setMessages(data ?? []);

        if (opts?.initial) setIsLoading(false);
    }

    // 3. Realtime Subscription (Optional for MVP)
    async function handleSend(e: React.FormEvent) {
        e.preventDefault();

        if (!newMessage.trim() || !conversationId || !currentUserId) return;

        if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);

        const content = newMessage.trim();
        setNewMessage('');

        const { error } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: currentUserId,
            content,
        });

        if (error) {
            console.error('Failed to send:', error);
            // optionally: setNewMessage(content);
            return;
        }

        fetchMessages(conversationId); // No loading spinner
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNewMessage(val);

        if (!conversationId || !currentUserId) return;

        // Broadcast typing event (Debounced) using the EXISTING channel ref
        if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);

        typingDebounceRef.current = setTimeout(() => {
            if (typingChannelRef.current) {
                typingChannelRef.current.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { userId: currentUserId, ts: Date.now() },
                });
            }
        }, 250);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full min-h-[400px]"><Loader2 className="animate-spin text-gray-400" /></div>;
    }

    if (!conversation) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-gray-400 p-8 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <User className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">اختر محادثة من القائمة للبدء</p>
                <p className="text-sm opacity-75">يمكنك التواصل مع المواهب والشركات مباشرة هنا.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">محادثة</h3>
                        {jobId && <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-md flex items-center w-fit gap-1 mt-1"><Briefcase className="w-3 h-3" /> بخصوص وظيفة</span>}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8faff] min-h-0">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-12 text-sm">
                        لا توجد رسائل بعد. ابدأ المحادثة الآن!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed ${isMe
                                    ? 'bg-[#0084db] text-white rounded-tl-none'
                                    : 'bg-white border border-gray-100 text-gray-700 rounded-tr-none shadow-sm'
                                    }`}>
                                    {msg.content}
                                    <div className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing Indicator */}
                {isOtherTyping && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-gray-100 border border-gray-200 text-gray-500 text-xs px-3 py-2 rounded-xl rounded-tr-none flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            <span className="mr-1">يكتب الآن...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleChange}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0084db] transition-colors text-right"
                    dir="rtl"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-[#0084db] text-white p-3 rounded-xl hover:bg-[#006bb3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5 ltr:rotate-180" />
                </button>
            </form>
        </div>
    );
}
