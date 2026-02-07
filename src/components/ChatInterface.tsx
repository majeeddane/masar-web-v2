'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Send, User, Briefcase, Loader2, Phone, Video, MoreVertical, ArrowRight } from 'lucide-react';
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
    const supabase = useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []);

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- Hooks ---
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!conversation?.id || !currentUser?.id) return;
        supabase.rpc('mark_conversation_read', { p_conversation_id: conversation.id })
            .then(({ error }) => {
                if (error) console.error('mark_conversation_read error:', error);
            });
    }, [conversation?.id, currentUser?.id, supabase]);

    useEffect(() => {
        async function initChat() {
            if (!currentUser) {
                setIsLoading(false);
                return;
            }

            // Case A: Prioritize conversationId from props (Navigation Sync)
            if (conversationId) {
                const { data: conv, error } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('id', conversationId)
                    .single();

                if (conv) {
                    setConversation(conv);
                    fetchMessages(conv.id);
                } else {
                    console.error('Conversation not found for ID:', conversationId);
                }
                setIsLoading(false);
                return;
            }

            // Case B: Fallback to targetUserId (Direct Message)
            if (targetUserId) {
                let query = supabase.from('conversations').select('*')
                    .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${currentUser.id})`);

                if (jobId) {
                    query = query.eq('job_id', jobId);
                }

                const { data: convs, error } = await query;

                if (convs && convs.length > 0) {
                    setConversation(convs[0]);
                    fetchMessages(convs[0].id);
                } else {
                    const { data: newConv, error: createError } = await supabase.from('conversations').insert({
                        user1_id: currentUser.id,
                        user2_id: targetUserId,
                        job_id: jobId || null
                    }).select().single();

                    if (newConv) {
                        setConversation(newConv);
                    } else if (createError) {
                        console.error("Error creating conversation:", createError);
                    }
                }
            }
            setIsLoading(false);
        }

        initChat();
    }, [currentUser, targetUserId, jobId, conversationId, supabase]);

    async function fetchMessages(convId: string) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true })
            .limit(50);

        if (data) {
            setMessages(data);
        }
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || !conversation) return;

        const content = newMessage.trim();
        setNewMessage('');

        const { error } = await supabase.from('messages').insert({
            conversation_id: conversation.id,
            sender_id: currentUser.id,
            content: content
        });

        if (error) {
            console.error("Failed to send:", error);
        } else {
            fetchMessages(conversation.id);
        }
    }

    // --- Loading ---
    if (isLoading) {
        return <div className="flex justify-center items-center h-[calc(100dvh-100px)] bg-slate-50"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
    }

    // --- Empty State ---
    if (!targetUserId && !conversation) {
        return (
            <div className="hidden md:flex flex-col items-center justify-center h-full bg-slate-50 rounded-3xl text-center p-8">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                    <User className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">اختر محادثة</h3>
                <p className="text-gray-500 mt-2">اضغط على أي اسم للبدء</p>
            </div>
        );
    }

    // --- Main UI (Mobile Optimized: Fixed Flex Layout) ---
    return (
        <div className="fixed inset-0 z-50 h-[100dvh] flex flex-col bg-slate-50 md:static md:h-full md:rounded-3xl md:border md:border-white/50 md:shadow-xl font-sans">

            {/* 1. Header (Rigid, no shrink) */}
            <div className="flex-none bg-white/90 backdrop-blur-md border-b border-gray-200/50 p-3 md:p-4 flex justify-between items-center shadow-sm z-20">
                <div className="flex items-center gap-3">
                    {/* Back Button (Mobile Only) */}
                    <button
                        onClick={() => router.push('/messages')}
                        className="md:hidden p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </button>

                    <div className="relative">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-md border-2 border-white">
                            <User className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight">مستخدم مسار</h3>
                        {jobId ? (
                            <span className="text-[10px] md:text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 mt-0.5 border border-blue-100">
                                <Briefcase className="w-3 h-3" />
                                <span>وظيفة</span>
                            </span>
                        ) : (
                            <span className="text-xs text-green-600 font-medium hidden md:block">متصل الآن</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 text-gray-400">
                    <button className="p-2 hover:bg-gray-100 rounded-full"><Phone className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full hidden md:block"><Video className="w-5 h-5" /></button>
                </div>
            </div>

            {/* 2. Messages Area (Flex Grow, Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-hide">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-60">
                        <p className="text-gray-500 text-sm">ابدأ المحادثة الآن!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-2.5 text-[14px] md:text-[15px] leading-relaxed shadow-sm relative ${isMe
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] mt-1 px-1 text-gray-400 opacity-80">
                                        {new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 3. Input Area (Rigid Footer, Sticky Bottom) */}
            <div className="flex-none p-3 md:p-5 bg-white md:bg-transparent border-t md:border-t-0 border-gray-100 z-30 pb-safe">
                <form onSubmit={handleSend} className="flex gap-2 md:gap-3 items-end max-w-4xl mx-auto">
                    <div className="flex-1 relative shadow-sm rounded-[2rem] bg-gray-50 md:bg-white ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="اكتب رسالة..."
                            className="w-full bg-transparent border-none px-4 py-3 md:px-6 md:py-4 rounded-[2rem] focus:ring-0 text-gray-800 text-sm md:text-base text-right"
                            dir="rtl"
                            style={{ fontSize: '16px' }} // Prevent iOS zoom
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white p-3 md:p-4 rounded-full shadow-lg disabled:opacity-50 disabled:shadow-none flex-shrink-0"
                    >
                        <Send className="w-5 h-5 md:w-6 md:h-6 ltr:rotate-180" />
                    </button>
                </form>
            </div>
        </div>
    );
}
