'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Send, User, Briefcase, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatInterfaceProps {
    currentUser: any;
    targetUserId?: string;
    jobId?: string;
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

export default function ChatInterface({ currentUser, targetUserId, jobId }: ChatInterfaceProps) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Initialize Conversation
    useEffect(() => {
        async function initChat() {
            if (!currentUser || !targetUserId) {
                setIsLoading(false);
                return;
            }

            // Check for existing conversation
            // We need to check both (user1=me, user2=target) AND (user1=target, user2=me)
            // But for simplicity of query, we can use OR logic or just check both combinations.

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
                // Determine if we should create one.
                // If we are here because of ?to=... query param, we initiate.
                // Create new conversation
                // To avoid duplicate key error race conditions, we attempt insert.
                // Ideally we handle this robustly, but for MVP:
                const { data: newConv, error: createError } = await supabase.from('conversations').insert({
                    user1_id: currentUser.id,
                    user2_id: targetUserId,
                    job_id: jobId || null
                }).select().single();

                if (newConv) {
                    setConversation(newConv);
                } else if (createError) {
                    // Possible conflict or other error
                    console.error("Error creating conversation:", createError);
                    // It might exist now (race condition), try fetching again?
                    // For MVP, just show error or retry.
                }
            }
            setIsLoading(false);
        }

        initChat();
    }, [currentUser, targetUserId, jobId, supabase]);

    // 2. Fetch Messages
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

    // 3. Realtime Subscription (Optional for MVP, but requested "Messaging behavior")
    // "Insert new message, then refresh list (simple refetch ok)" -> Simple refetch is acceptable.
    // We will setup simple refetch on send.

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || !conversation) return;

        const content = newMessage.trim();
        setNewMessage(''); // Optimistic clear

        const { error } = await supabase.from('messages').insert({
            conversation_id: conversation.id,
            sender_id: currentUser.id,
            content: content
        });

        if (error) {
            console.error("Failed to send:", error);
            // Ideally restore message to input or show error
        } else {
            // Refresh
            fetchMessages(conversation.id);
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-gray-400" /></div>;
    }

    if (!targetUserId && !conversation) {
        return <div className="text-center p-8 text-gray-500">اختر محادثة للبدء</div>;
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8faff]">
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
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0084db] transition-colors text-right"
                    dir="rtl"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-[#0084db] text-white p-3 rounded-xl hover:bg-[#006bb3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5 ltr:rotate-180" /> {/* Rotate if needed for RTL feel, usually Send icon points right which is out in RTL? Left? Lucide send points right. In RTL right is 'back'. We want it to point Left? Actually standard is send icon points direction of reading flow usually or just generic paper plane. */}
                </button>
            </form>
        </div>
    );
}
