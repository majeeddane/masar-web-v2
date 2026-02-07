'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
// ✅ تم إضافة مكتبة الضغط هنا
import imageCompression from 'browser-image-compression';
import {
    Send, User, ArrowRight, Loader2, Search,
    MoreVertical, Camera, Paperclip, Mic, PenSquare
} from 'lucide-react';

function ChatInterface() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const searchParams = useSearchParams();
    const router = useRouter();
    const urlUserId = searchParams.get('user_id');

    // State
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [contacts, setContacts] = useState<any[]>([]);
    const [activeContact, setActiveContact] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Attachments
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Voice
    const [isRecording, setIsRecording] = useState(false);
    const [recordSeconds, setRecordSeconds] = useState(0);
    const [recordError, setRecordError] = useState<string>('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const recordTimerRef = useRef<number | null>(null);

    // Fake waveform animation
    const [wave, setWave] = useState<number[]>([10, 18, 8, 22, 12, 16, 9, 20]);
    const waveTimerRef = useRef<number | null>(null);

    // ✅ Image Preview (Lightbox)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewName, setPreviewName] = useState<string>('');

    // ✅ Top menu (3 dots)
    const [menuOpen, setMenuOpen] = useState(false);

    // ✅ Confirm delete chat
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmBusy, setConfirmBusy] = useState(false);

    // ✅ Limits
    const MAX_MB = 40;

    // Helpers
    const formatTime = (d: string) =>
        new Date(d).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    const getContactName = (c: any) => c?.full_name || c?.name || c?.username || 'مستخدم';
    const getContactAvatar = (c: any) => c?.avatar_url || c?.avatar || c?.image_url;

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
    };

    const upsertContactMeta = (contactId: string, patchOrFn: any) => {
        setContacts(prev => {
            const idx = prev.findIndex(c => c.id === contactId);
            if (idx === -1) return prev;

            const patch = typeof patchOrFn === 'function' ? patchOrFn(prev[idx]) : patchOrFn;
            const updated = { ...prev[idx], ...patch };
            const rest = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
            return [updated, ...rest];
        });
    };

    // Close menu when changing chat
    useEffect(() => {
        setMenuOpen(false);
        setConfirmOpen(false);
    }, [activeContact?.id]);

    // Close menu when clicking outside
    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (t.closest?.('[data-chat-menu]')) return;
            setMenuOpen(false);
        };
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    // 1) Viewport Height Fix + Scroll Lock (iOS friendly)
    useEffect(() => {
        const setVh = () => {
            const h = window.visualViewport?.height ?? window.innerHeight;
            document.documentElement.style.setProperty('--vh', `${h * 0.01}px`);
        };

        setVh();
        window.addEventListener('resize', setVh);
        window.visualViewport?.addEventListener('resize', setVh);
        window.visualViewport?.addEventListener('scroll', setVh);

        if (activeContact && window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }

        return () => {
            window.removeEventListener('resize', setVh);
            window.visualViewport?.removeEventListener('resize', setVh);
            window.visualViewport?.removeEventListener('scroll', setVh);
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [activeContact]);

    // 2) Initial Data Fetch
    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUser(user);

            const { data: allMessages } = await supabase
                .from('messages')
                .select('sender_id, receiver_id, content, created_at, is_read, attachment_type, attachment_url')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (allMessages) {
                const unreadCountBySender: Record<string, number> = {};
                for (const m of allMessages as any[]) {
                    if (m.receiver_id === user.id && m.is_read === false) {
                        unreadCountBySender[m.sender_id] = (unreadCountBySender[m.sender_id] || 0) + 1;
                    }
                }

                const contactIds = Array.from(new Set((allMessages as any[]).map(m =>
                    m.sender_id === user.id ? m.receiver_id : m.sender_id
                )));

                if (urlUserId && !contactIds.includes(urlUserId) && urlUserId !== user.id) {
                    contactIds.unshift(urlUserId);
                }

                if (contactIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles').select('*').in('id', contactIds);

                    const contactsWithMeta = profiles?.map(profile => {
                        const lastMsg = (allMessages as any[]).find(m =>
                            (m.sender_id === profile.id && m.receiver_id === user.id) ||
                            (m.receiver_id === profile.id && m.sender_id === user.id)
                        );

                        const lastLabel =
                            lastMsg?.content ||
                            (lastMsg?.attachment_type === 'image' ? 'صورة' :
                                lastMsg?.attachment_type === 'audio' ? 'رسالة صوتية' :
                                    lastMsg?.attachment_type === 'video' ? 'فيديو' :
                                        lastMsg?.attachment_type ? 'مرفق' : '');

                        return {
                            ...profile,
                            last_msg: lastLabel,
                            last_msg_time: lastMsg?.created_at,
                            unread_count: unreadCountBySender[profile.id] || 0
                        };
                    }).sort((a, b) =>
                        new Date(b.last_msg_time || 0).getTime() - new Date(a.last_msg_time || 0).getTime()
                    ) || [];

                    setContacts(contactsWithMeta);

                    if (urlUserId) {
                        const target = contactsWithMeta.find(p => p.id === urlUserId);
                        if (!target) {
                            const { data: targetProfile } = await supabase
                                .from('profiles').select('*').eq('id', urlUserId).single();
                            if (targetProfile) {
                                setActiveContact(targetProfile);
                                setContacts(prev => [{ ...targetProfile, unread_count: 0 }, ...prev]);
                            }
                        } else {
                            setActiveContact(target);
                        }
                    }
                } else if (urlUserId) {
                    const { data: targetProfile } = await supabase
                        .from('profiles').select('*').eq('id', urlUserId).single();
                    if (targetProfile) {
                        setActiveContact(targetProfile);
                        setContacts([{ ...targetProfile, unread_count: 0 }]);
                    }
                }
            }

            setLoading(false);
        }
        init();
    }, [urlUserId]);

    // Mark chat as read
    const markChatAsRead = async (contactId: string, userId: string) => {
        await supabase
            .from('messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('sender_id', contactId)
            .eq('receiver_id', userId)
            .eq('is_read', false);

        upsertContactMeta(contactId, { unread_count: 0 });
    };

    // 3) Fetch Messages + Realtime
    useEffect(() => {
        if (!activeContact || !currentUser) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(
                    `and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeContact.id}),and(sender_id.eq.${activeContact.id},receiver_id.eq.${currentUser.id})`
                )
                .order('created_at', { ascending: true });

            setMessages(data || []);
            scrollToBottom();
            await markChatAsRead(activeContact.id, currentUser.id);
        };

        fetchMessages();

        const channel = supabase.channel(`chat_${Date.now()}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${currentUser.id}`
            }, async (payload) => {
                const msg = payload.new as any;

                if (msg.sender_id === activeContact.id) {
                    setMessages(prev => [...prev, msg]);
                    scrollToBottom();
                    await markChatAsRead(activeContact.id, currentUser.id);

                    upsertContactMeta(activeContact.id, {
                        last_msg: msg.content ||
                            (msg.attachment_type === 'image' ? 'صورة' :
                                msg.attachment_type === 'audio' ? 'رسالة صوتية' :
                                    msg.attachment_type === 'video' ? 'فيديو' :
                                        msg.attachment_type ? 'مرفق' : ''),
                        last_msg_time: msg.created_at,
                        unread_count: 0
                    });
                    return;
                }

                setContacts(prev => {
                    const idx = prev.findIndex(c => c.id === msg.sender_id);
                    if (idx === -1) return prev;

                    const c = prev[idx];
                    const updated = {
                        ...c,
                        last_msg: msg.content ||
                            (msg.attachment_type === 'image' ? 'صورة' :
                                msg.attachment_type === 'audio' ? 'رسالة صوتية' :
                                    msg.attachment_type === 'video' ? 'فيديو' :
                                        msg.attachment_type ? 'مرفق' : ''),
                        last_msg_time: msg.created_at,
                        unread_count: (c.unread_count || 0) + 1
                    };
                    const rest = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
                    return [updated, ...rest];
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeContact, currentUser]);

    // Upload helper
    const uploadFileToStorage = async (file: File) => {
        if (!currentUser) throw new Error('No user');

        const ext = file.name.split('.').pop() || 'bin';
        const path = `${currentUser.id}/${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;

        const { error } = await supabase.storage
            .from('chat_uploads')
            .upload(path, file, { cacheControl: '3600', upsert: false });

        if (error) throw error;

        const { data } = supabase.storage.from('chat_uploads').getPublicUrl(path);
        return data.publicUrl;
    };

    // Attachment sender (with try/catch)
    const sendAttachmentMessage = async (file: File, type: 'image' | 'file' | 'audio' | 'video') => {
        if (!activeContact || !currentUser) return;

        const tempId = Date.now();
        const nowIso = new Date().toISOString();

        setMessages(prev => [
            ...prev,
            {
                id: tempId,
                sender_id: currentUser.id,
                receiver_id: activeContact.id,
                content: '',
                created_at: nowIso,
                attachment_url: 'uploading',
                attachment_type: type,
                attachment_name: file.name,
                attachment_size: file.size,
                is_delivered: true,
                delivered_at: nowIso,
                is_read: false
            }
        ]);
        scrollToBottom();

        try {
            const url = await uploadFileToStorage(file);

            const { error } = await supabase.from('messages').insert({
                sender_id: currentUser.id,
                receiver_id: activeContact.id,
                content: '',
                attachment_url: url,
                attachment_type: type,
                attachment_name: file.name,
                attachment_size: file.size,
                is_delivered: true,
                delivered_at: nowIso,
                is_read: false
            });

            if (error) throw error;

            setMessages(prev => prev.map(m => (m.id === tempId ? { ...m, attachment_url: url } : m)));

            upsertContactMeta(activeContact.id, {
                last_msg: type === 'image' ? 'صورة' : type === 'audio' ? 'رسالة صوتية' : type === 'video' ? 'فيديو' : 'مرفق',
                last_msg_time: nowIso
            });

        } catch (err: any) {
            console.error('Attachment send failed:', err);
            setMessages(prev => prev.map(m => (
                m.id === tempId
                    ? { ...m, attachment_url: '', content: `فشل إرسال المرفق: ${err?.message || 'خطأ غير معروف'}` }
                    : m
            )));
        }
    };

    const onPickImage = () => imageInputRef.current?.click();
    const onPickFile = () => fileInputRef.current?.click();

    // ✅ NEW: Compressed Image Handler
    const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        e.target.value = '';

        // 1. فحص الحجم الأصلي (Fast Fail)
        const sizeMb = f.size / (1024 * 1024);
        if (sizeMb > MAX_MB) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender_id: currentUser?.id,
                receiver_id: activeContact?.id,
                content: `الملف كبير جدًا (${sizeMb.toFixed(1)}MB). الحد الحالي ${MAX_MB}MB.`,
                created_at: new Date().toISOString()
            }]);
            return;
        }

        // 2. إعدادات الضغط
        const options = {
            maxSizeMB: 1,           // الهدف: 1 ميجابايت
            maxWidthOrHeight: 1920, // أبعاد FHD
            useWebWorker: true
        };

        try {
            // 3. محاولة الضغط
            const compressedFile = await imageCompression(f, options);
            // إرسال الملف المضغوط
            await sendAttachmentMessage(compressedFile, 'image');
        } catch (error) {
            console.error('Compression failed, falling back to original', error);
            // 4. في حال فشل الضغط، أرسل الأصلية
            await sendAttachmentMessage(f, 'image');
        }
    };

    const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        e.target.value = '';

        const sizeMb = f.size / (1024 * 1024);
        if (sizeMb > MAX_MB) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender_id: currentUser?.id,
                receiver_id: activeContact?.id,
                content: `الملف كبير جدًا (${sizeMb.toFixed(1)}MB). الحد الحالي ${MAX_MB}MB.`,
                created_at: new Date().toISOString()
            }]);
            return;
        }

        const isVideo = (f.type || '').startsWith('video/');
        await sendAttachmentMessage(f, isVideo ? 'video' : 'file');
    };

    // Voice UI helpers
    const startRecordUI = () => {
        setRecordError('');
        setIsRecording(true);
        setRecordSeconds(0);

        if (recordTimerRef.current) window.clearInterval(recordTimerRef.current);
        recordTimerRef.current = window.setInterval(() => setRecordSeconds(s => s + 1), 1000);

        if (waveTimerRef.current) window.clearInterval(waveTimerRef.current);
        waveTimerRef.current = window.setInterval(() => {
            setWave(prev => prev.map(() => 6 + Math.floor(Math.random() * 20)));
        }, 180);
    };

    const stopRecordUI = () => {
        setIsRecording(false);
        if (recordTimerRef.current) window.clearInterval(recordTimerRef.current);
        if (waveTimerRef.current) window.clearInterval(waveTimerRef.current);
        recordTimerRef.current = null;
        waveTimerRef.current = null;
    };

    const cancelRecording = () => {
        try {
            mediaRecorderRef.current?.stop();
            audioChunksRef.current = [];
        } catch { }
        stopRecordUI();
    };

    const startRecording = async () => {
        if (isRecording) return;

        setRecordError('');

        if (!window.isSecureContext) {
            setRecordError('التسجيل على الجوال يحتاج HTTPS أو localhost');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            let mime = 'audio/webm;codecs=opus';
            if (typeof MediaRecorder !== 'undefined' && (MediaRecorder as any).isTypeSupported) {
                if (!(MediaRecorder as any).isTypeSupported(mime)) mime = 'audio/webm';
            }

            const mr = new MediaRecorder(stream, { mimeType: mime } as any);
            mediaRecorderRef.current = mr;
            audioChunksRef.current = [];

            mr.ondataavailable = (ev) => {
                if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
            };

            mr.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                if (!audioChunksRef.current.length) return;

                const blob = new Blob(audioChunksRef.current, { type: mime });
                const file = new File([blob], `voice_${Date.now()}.webm`, { type: mime });

                const sizeMb = file.size / (1024 * 1024);
                if (sizeMb > MAX_MB) {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        sender_id: currentUser?.id,
                        receiver_id: activeContact?.id,
                        content: `الملف كبير جدًا (${sizeMb.toFixed(1)}MB). الحد الحالي ${MAX_MB}MB.`,
                        created_at: new Date().toISOString()
                    }]);
                    return;
                }

                await sendAttachmentMessage(file, 'audio');
            };

            mr.start(250);
            startRecordUI();

        } catch (err: any) {
            console.error(err);
            setRecordError(err?.message || 'فشل تشغيل المايك');
        }
    };

    const stopRecording = () => {
        if (!isRecording) return;
        stopRecordUI();
        try { mediaRecorderRef.current?.stop(); } catch (e) { console.error(e); }
    };

    // Send text message
    const sendMessage = async () => {
        if (!newMessage.trim() || !activeContact || !currentUser) return;

        const content = newMessage;
        setNewMessage('');
        const nowIso = new Date().toISOString();

        setMessages(prev => [...prev, {
            id: Date.now(),
            sender_id: currentUser.id,
            receiver_id: activeContact.id,
            content,
            created_at: nowIso,
            is_delivered: true,
            delivered_at: nowIso,
            is_read: false
        }]);
        scrollToBottom();

        await supabase.from('messages').insert({
            sender_id: currentUser.id,
            receiver_id: activeContact.id,
            content,
            is_delivered: true,
            delivered_at: nowIso,
            is_read: false
        });

        upsertContactMeta(activeContact.id, { last_msg: content, last_msg_time: nowIso });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const closeChat = () => {
        setActiveContact(null);
        router.push('/messages');
    };

    const renderStatus = (m: any) => {
        if (m?.is_read) return <span className="text-blue-500 text-[12px]">✔✔</span>;
        if (m?.is_delivered) return <span className="text-gray-500 text-[12px]">✔✔</span>;
        return <span className="text-gray-500 text-[12px]">✔</span>;
    };

    const openImagePreview = (url: string, name?: string) => {
        setPreviewUrl(url);
        setPreviewName(name || '');
    };

    const renderMessageBody = (m: any) => {
        if (m?.attachment_url) {
            if (m.attachment_url === 'uploading') {
                return <span className="text-gray-500">جاري رفع الملف...</span>;
            }

            const fallbackLink = (
                <a
                    href={m.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                >
                    {m.attachment_name || 'فتح المرفق'}
                </a>
            );

            if (m.attachment_type === 'image') {
                return (
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => openImagePreview(m.attachment_url, m.attachment_name)}
                            className="block"
                        >
                            <img
                                src={m.attachment_url}
                                className="max-w-[240px] rounded-lg cursor-zoom-in"
                                loading="lazy"
                                alt={m.attachment_name || 'image'}
                                onError={(e) => { (e.currentTarget.style.display = 'none'); }}
                            />
                        </button>
                        {fallbackLink}
                    </div>
                );
            }

            if (m.attachment_type === 'audio') {
                return (
                    <div className="space-y-2">
                        <audio controls src={m.attachment_url} className="w-[260px]" />
                        {fallbackLink}
                    </div>
                );
            }

            if (m.attachment_type === 'video') {
                return (
                    <div className="space-y-2">
                        <video
                            controls
                            playsInline
                            src={m.attachment_url}
                            className="w-[260px] max-w-full rounded-lg bg-black"
                        />
                        {fallbackLink}
                    </div>
                );
            }

            return fallbackLink;
        }

        return <span className="text-black leading-relaxed">{m.content}</span>;
    };

    // ✅ Clear chat content in DB
    const deleteChatContent = async () => {
        if (!currentUser || !activeContact) return;
        setConfirmBusy(true);

        try {
            const a = currentUser.id;
            const b = activeContact.id;

            const { error } = await supabase
                .from('messages')
                .delete()
                .or(`and(sender_id.eq.${a},receiver_id.eq.${b}),and(sender_id.eq.${b},receiver_id.eq.${a})`);

            if (error) throw error;

            setMessages([]);
            upsertContactMeta(activeContact.id, { last_msg: '', last_msg_time: null });
            setConfirmOpen(false);
            setMenuOpen(false);
        } catch (err: any) {
            console.error(err);
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender_id: currentUser?.id,
                receiver_id: activeContact?.id,
                content: `فشل حذف الدردشة: ${err?.message || 'خطأ غير معروف'}`,
                created_at: new Date().toISOString()
            }]);
        } finally {
            setConfirmBusy(false);
        }
    };

    const mm = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
    const ss = String(recordSeconds % 60).padStart(2, '0');

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex w-full bg-white overflow-hidden relative font-sans" dir="rtl" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>

            {/* Sidebar / Contacts List */}
            <div className={`flex flex-col w-full md:w-[360px] md:border-l h-full absolute md:relative z-10 bg-white transition-transform duration-300 ${activeContact ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <div className="h-[60px] bg-[#115d9a] flex items-center justify-between px-4 text-white shrink-0 shadow-sm">
                    <div className="w-8"></div>
                    <h1 className="font-bold text-lg">الرسائل</h1>
                    <button onClick={() => router.back()}><ArrowRight className="h-6 w-6 rotate-180" /></button>
                </div>

                <div className="p-3 bg-white border-b">
                    <div className="bg-gray-100 rounded-lg flex items-center px-3 h-10">
                        <Search className="h-5 w-5 text-gray-400 ml-2" />
                        <input placeholder="ابحث في الرسائل..." className="bg-transparent flex-1 focus:outline-none text-sm" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {contacts.map(c => (
                        <div
                            key={c.id}
                            onClick={() => {
                                setActiveContact(c);
                                router.push(`?user_id=${c.id}`);
                            }}
                            className="flex items-center gap-3 p-3 border-b hover:bg-gray-50 cursor-pointer"
                        >
                            <Avatar url={getContactAvatar(c)} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1 gap-2">
                                    <h3 className="font-bold text-sm text-gray-900 truncate">{getContactName(c)}</h3>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {c.unread_count > 0 && (
                                            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#115d9a] text-white text-[11px] flex items-center justify-center">
                                                {c.unread_count}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-400">
                                            {c.last_msg_time ? new Date(c.last_msg_time).toLocaleDateString('ar-SA') : ''}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{c.last_msg}</p>
                            </div>
                        </div>
                    ))}

                    {contacts.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-10 text-gray-400">
                            <p>لا توجد رسائل</p>
                        </div>
                    )}
                </div>

                <button className="absolute bottom-6 left-6 w-14 h-14 bg-[#115d9a] rounded-full shadow-lg flex items-center justify-center text-white md:hidden">
                    <PenSquare className="h-6 w-6" />
                </button>
            </div>

            {/* Chat Area */}
            <div className={`
        fixed inset-0 z-50 bg-[#e4e4e4] flex flex-col
        md:static md:z-auto md:w-full md:h-full md:bg-[#e4e4e4]
        transition-transform duration-300
        ${activeContact ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none md:pointer-events-auto md:translate-x-0'}
      `}>
                {activeContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="
              fixed top-0 left-0 right-0 z-[80] h-[60px] bg-[#115d9a] flex items-center justify-between px-2 text-white shadow-md
              md:relative md:z-auto md:shrink-0
            ">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <button onClick={closeChat} className="p-2 md:hidden"><ArrowRight className="h-6 w-6" /></button>
                                <Avatar url={getContactAvatar(activeContact)} size="sm" className="border border-white/20" />
                                <div className="flex-1 min-w-0" onClick={() => router.push(`/profile/${activeContact.id}`)}>
                                    <h3 className="font-bold text-sm truncate">{getContactName(activeContact)}</h3>
                                    <p className="text-[10px] text-blue-200 truncate hidden md:block">متصل الآن</p>
                                </div>
                            </div>

                            {/* ✅ 3 dots menu */}
                            <div className="relative" data-chat-menu>
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen(v => !v)}
                                    className="p-2 rounded-md hover:bg-white/10 active:bg-white/10 pointer-events-auto"
                                    aria-label="menu"
                                >
                                    <MoreVertical className="h-6 w-6" />
                                </button>

                                {menuOpen && (
                                    <div className="absolute left-2 top-[44px] w-56 bg-white text-gray-800 rounded-xl shadow-lg border overflow-hidden z-[999]">
                                        <button
                                            type="button"
                                            onClick={() => { setMenuOpen(false); router.push(`/profile/${activeContact.id}`); }}
                                            className="w-full text-right px-4 py-2 hover:bg-gray-50"
                                        >
                                            عرض الملف الشخصي
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { setMenuOpen(false); scrollToBottom(); }}
                                            className="w-full text-right px-4 py-2 hover:bg-gray-50"
                                        >
                                            الانتقال لآخر رسالة
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { setMenuOpen(false); setConfirmOpen(true); }}
                                            className="w-full text-right px-4 py-2 hover:bg-gray-50 text-red-600"
                                        >
                                            حذف محتوى الدردشة
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { setMenuOpen(false); closeChat(); }}
                                            className="w-full text-right px-4 py-2 hover:bg-gray-50"
                                        >
                                            إغلاق
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages List */}
                        <div
                            className="
                flex-1 overflow-y-auto space-y-2 bg-[#e4e4e4]
                pt-[60px] pb-[110px] px-4
                md:pt-4 md:pb-4 md:px-8
              "
                            style={{
                                backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                                backgroundBlendMode: 'soft-light'
                            }}
                            onClick={() => setMenuOpen(false)}
                        >
                            {messages.map((m, i) => {
                                const isMe = m.sender_id === currentUser.id;
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] px-3 py-1.5 rounded-lg text-sm shadow-sm relative ${isMe ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                                            {renderMessageBody(m)}
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[10px] text-gray-500">{formatTime(m.created_at)}</span>
                                                {isMe && renderStatus(m)}
                                            </div>
                                            <div className={`absolute top-0 w-0 h-0 border-[8px] border-transparent ${isMe ? 'right-[-8px] border-t-[#dcf8c6]' : 'left-[-8px] border-t-white'}`}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Recording Bar */}
                        {isRecording && (
                            <div className="fixed bottom-[72px] left-0 right-0 z-[90] px-3">
                                <div className="bg-white border rounded-2xl shadow-sm px-3 py-2 flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                                    <div className="text-sm text-red-600 font-bold">{mm}:{ss}</div>

                                    <div className="flex-1 flex items-center gap-1 h-6">
                                        {wave.map((h, idx) => (
                                            <div
                                                key={idx}
                                                className="w-1 rounded-full bg-gray-400/80"
                                                style={{ height: `${h}px` }}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={cancelRecording}
                                        className="text-sm text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Chat Footer */}
                        <div className="
              fixed bottom-0 left-0 right-0 z-[60] bg-white px-2 py-2 flex items-end gap-2 border-t
              pb-[calc(8px+env(safe-area-inset-bottom))]
              md:relative md:z-auto md:pb-2
            ">
                            <div className="flex gap-3 pb-3 text-gray-400 px-1">
                                <button type="button" onClick={onPickImage} className="active:opacity-60" disabled={isRecording}>
                                    <Camera className="h-6 w-6" />
                                </button>

                                <button type="button" onClick={onPickFile} className="active:opacity-60" disabled={isRecording}>
                                    <Paperclip className="h-6 w-6 -rotate-45" />
                                </button>

                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={onImageSelected}
                                />

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,image/*"
                                    className="hidden"
                                    onChange={onFileSelected}
                                />
                            </div>

                            <div className="flex-1 bg-white border rounded-3xl min-h-[45px] px-4 flex items-center mb-1">
                                <input
                                    className="flex-1 bg-transparent focus:outline-none h-full py-2 text-gray-900"
                                    placeholder={recordError ? recordError : (isRecording ? 'جاري التسجيل...' : 'اكتب رسالة')}
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    style={{ fontSize: '16px' }}
                                    disabled={isRecording}
                                />
                            </div>

                            <button
                                onClick={() => {
                                    if (newMessage.trim()) {
                                        sendMessage();
                                        return;
                                    }
                                    if (isRecording) stopRecording();
                                    else startRecording();
                                }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mb-1 transition-colors ${isRecording ? 'bg-red-600' : 'bg-[#115d9a]'}`}
                            >
                                {newMessage.trim()
                                    ? <Send className="h-5 w-5 text-white ml-1" />
                                    : <Mic className="h-6 w-6 text-white" />
                                }
                            </button>
                        </div>

                        {/* ✅ Confirm Delete Modal */}
                        {confirmOpen && (
                            <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4" onClick={() => !confirmBusy && setConfirmOpen(false)}>
                                <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="font-bold text-lg text-gray-900">تأكيد حذف محتوى الدردشة</h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        هذا سيحذف كل رسائل هذه الدردشة من قاعدة البيانات بينك وبين هذا المستخدم. العملية لا يمكن التراجع عنها.
                                    </p>

                                    <div className="mt-4 flex gap-2 justify-end">
                                        <button
                                            type="button"
                                            disabled={confirmBusy}
                                            onClick={() => setConfirmOpen(false)}
                                            className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                                        >
                                            إلغاء
                                        </button>

                                        <button
                                            type="button"
                                            disabled={confirmBusy}
                                            onClick={deleteChatContent}
                                            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                        >
                                            {confirmBusy ? 'جاري الحذف...' : 'نعم، احذف'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ✅ Lightbox for images */}
                        {previewUrl && (
                            <div
                                className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4"
                                onClick={() => { setPreviewUrl(null); setPreviewName(''); }}
                            >
                                <div className="max-w-[95vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                                    <img
                                        src={previewUrl}
                                        alt={previewName || 'preview'}
                                        className="max-w-[95vw] max-h-[90vh] rounded-lg object-contain"
                                    />
                                    <div className="mt-3 flex justify-center gap-3">
                                        <a
                                            href={previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white underline"
                                        >
                                            فتح في تبويب جديد
                                        </a>
                                        <button
                                            type="button"
                                            className="text-white underline"
                                            onClick={() => { setPreviewUrl(null); setPreviewName(''); }}
                                        >
                                            إغلاق
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 bg-[#f0f2f5] border-b-[6px] border-green-500">
                        <div className="w-64 h-64 bg-contain bg-no-repeat bg-center opacity-50 mb-4" style={{ backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v3/yO/r/FsWUqRoOsIy.png")' }}></div>
                        <p className="text-xl">اختر محادثة للبدء</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const Avatar = ({ url, size = 'md', className = '' }: any) => (
    <div className={`rounded-full bg-gray-200 overflow-hidden shrink-0 ${size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'} ${className}`}>
        {url ? <img src={url} className="w-full h-full object-cover" /> : <User className="w-1/2 h-1/2 m-auto mt-1/4 text-gray-400" />}
    </div>
);

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <ChatInterface />
        </Suspense>
    );
}