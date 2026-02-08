'use client';
import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
    Send, ArrowRight, Loader2, MoreVertical,
    Paperclip, Mic, Image as ImageIcon, Video, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import Link from 'next/link';

interface ChatInterfaceProps {
    currentUserId: string;
    contactId: string;
}

export default function ChatInterface({ currentUserId, contactId }: ChatInterfaceProps) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();

    // State
    const [contact, setContact] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    useEffect(() => {
        fetchChatData();
    }, [contactId]);

    const fetchChatData = async () => {
        setLoading(true);
        // 1. Fetch Contact Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', contactId)
            .single();

        setContact(profile);

        // 2. Fetch Messages
        const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${currentUserId})`)
            .order('created_at', { ascending: true });

        setMessages(msgs || []);
        setLoading(false);
        scrollToBottom();
        markAsRead();
    };

    const markAsRead = async () => {
        await supabase
            .from('messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('sender_id', contactId)
            .eq('receiver_id', currentUserId)
            .eq('is_read', false);
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // Real-time subscription
    useEffect(() => {
        const channel = supabase.channel(`chat_${contactId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${currentUserId}`
            }, (payload) => {
                const newMsg = payload.new as any;
                if (newMsg.sender_id === contactId) {
                    setMessages(prev => [...prev, newMsg]);
                    scrollToBottom();
                    markAsRead();
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [contactId, currentUserId]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const content = newMessage.trim();
        setNewMessage('');

        const tempId = Date.now(); // Optimistic push
        const optimisticMsg = {
            id: tempId,
            sender_id: currentUserId,
            receiver_id: contactId,
            content: content,
            created_at: new Date().toISOString(),
            is_read: false
        };

        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        const { data, error } = await supabase.from('messages').insert({
            sender_id: currentUserId,
            receiver_id: contactId,
            content: content
        }).select().single();

        if (error) {
            console.error('Send failed', error);
            // Could add error handling UI here
        } else {
            // Replace temp msg with real one
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));
        }
    };

    const handleFileUpload = async (file: File, type: 'image' | 'video' | 'audio' | 'file') => {
        const ext = file.name.split('.').pop();
        const path = `${currentUserId}/${Date.now()}_${Math.random().toString().slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('chat_uploads')
            .upload(path, file);

        if (uploadError) {
            console.error('Upload failed', uploadError);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('chat_uploads').getPublicUrl(path);

        await supabase.from('messages').insert({
            sender_id: currentUserId,
            receiver_id: contactId,
            content: '',
            attachment_url: publicUrl,
            attachment_type: type,
            attachment_name: file.name
        });

        // Optimistic update not strictly needed for file uploads as they take time, 
        // but can rely on realtime subscription to show it when done.
    };

    const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        if (type === 'image') {
            try {
                const compressedFile = await imageCompression(file, { maxSizeMB: 1, useWebWorker: true });
                await handleFileUpload(compressedFile, 'image');
            } catch (err) {
                await handleFileUpload(file, 'image');
            }
        } else {
            await handleFileUpload(file, 'file');
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            audioChunksRef.current = [];

            mr.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mr.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'voice_message.webm', { type: 'audio/webm' });
                await handleFileUpload(audioFile, 'audio');
            };

            mr.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Mic access denied', err);
            alert('الرجاء السماح بصلاحية المايكروفون');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };


    const renderMessage = (msg: any) => {
        const isMe = msg.sender_id === currentUserId;
        return (
            <div key={msg.id} className={`flex mb-4 ${isMe ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-2xl p-3 ${isMe
                        ? 'bg-[#115d9a] text-white rounded-tr-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                    }`}>
                    {msg.attachment_url ? (
                        <div className="space-y-2">
                            {msg.attachment_type === 'image' && (
                                <img src={msg.attachment_url} alt="Image" className="rounded-lg max-w-full" />
                            )}
                            {msg.attachment_type === 'audio' && (
                                <audio controls src={msg.attachment_url} className="max-w-[250px]" />
                            )}
                            {msg.attachment_type === 'video' && (
                                <video controls src={msg.attachment_url} className="rounded-lg max-w-full" />
                            )}
                            {msg.attachment_type === 'file' && (
                                <a href={msg.attachment_url} target="_blank" className="flex items-center gap-2 underline">
                                    <Paperclip className="h-4 w-4" /> {msg.attachment_name || 'ملف مرفق'}
                                </a>
                            )}
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    )}
                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="flex h-full items-center justify-center bg-[#e5e7eb]"><Loader2 className="animate-spin text-[#115d9a]" /></div>;

    if (!contact) return <div className="flex h-full items-center justify-center">خطأ في تحميل المحادثة</div>;

    return (
        <div className="flex flex-col h-full bg-[#e5e7eb]">
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/messages')} className="md:hidden p-2 -mr-2 text-gray-600">
                        <ArrowRight className="h-6 w-6" />
                    </button>
                    <div className="relative">
                        <img
                            src={contact.avatar_url || 'https://via.placeholder.com/150'}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-sm">{contact.full_name || 'مستخدم'}</h2>
                        <p className="text-xs text-green-600 font-medium">متصل الآن</p>
                    </div>
                </div>
                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-3 border-t border-gray-200 shrink-0">
                <div className="flex items-end gap-2 max-w-4xl mx-auto">
                    {!isRecording ? (
                        <>
                            <button
                                onClick={() => imageInputRef.current?.click()}
                                className="p-3 text-gray-400 hover:text-[#115d9a] hover:bg-blue-50 rounded-xl transition-colors"
                            >
                                <ImageIcon className="h-5 w-5" />
                            </button>
                            <input
                                type="file"
                                ref={imageInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onFileSelected(e, 'image')}
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-gray-400 hover:text-[#115d9a] hover:bg-blue-50 rounded-xl transition-colors"
                            >
                                <Paperclip className="h-5 w-5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={(e) => onFileSelected(e, 'file')}
                            />
                        </>
                    ) : (
                        <button onClick={stopRecording} className="p-3 text-red-500 hover:bg-red-50 rounded-xl animate-pulse">
                            <X className="h-5 w-5" />
                        </button>
                    )}

                    <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 py-2 min-h-[48px]">
                        {isRecording ? (
                            <div className="text-red-500 font-bold flex items-center gap-2 w-full">
                                <span className="animate-pulse">●</span> جاري التسجيل...
                            </div>
                        ) : (
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="اكتب رسالتك هنا..."
                                className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm max-h-20"
                                rows={1}
                            />
                        )}
                    </div>

                    {newMessage.trim() ? (
                        <button
                            onClick={sendMessage}
                            className="p-3 bg-[#115d9a] text-white rounded-xl hover:bg-[#0d4a7d] transition-colors shadow-lg shadow-blue-900/20"
                        >
                            <Send className="h-5 w-5 -rotate-45" />
                        </button>
                    ) : (
                        <button
                            onClick={startRecording}
                            className={`p-3 rounded-xl transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            <Mic className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
