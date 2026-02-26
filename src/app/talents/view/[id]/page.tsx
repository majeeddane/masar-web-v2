'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowRight, MapPin, User, Clock,
    FileText, Phone, Loader2, Briefcase,
    Mail, Globe, MessageSquare, MessageCircle, ChevronDown, Share2
} from 'lucide-react';

export default function PostDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id;

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showContactMenu, setShowContactMenu] = useState(false);
    const contactMenuRef = useRef<HTMLDivElement>(null);

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (contactMenuRef.current && !contactMenuRef.current.contains(event.target as Node)) {
                setShowContactMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('talent_posts')
                .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            job_title
          )
        `)
                .eq('id', postId)
                .single();

            if (error) console.error(error);
            setPost(data);
            setLoading(false);
        };

        if (postId) fetchPost();
    }, [postId, supabase]);

    const getWhatsAppUrl = (phone: string) => {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        if (!cleanPhone.startsWith('966')) cleanPhone = '966' + cleanPhone;
        return `https://wa.me/${cleanPhone}`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-10 h-10 animate-spin text-[#115d9a]" />
        </div>
    );

    if (!post) return <div className="text-center py-20">المنشور غير موجود</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-12 px-4" dir="rtl">
            <div className="max-w-3xl mx-auto">

                {/* زر العودة */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#115d9a] font-bold transition-colors"
                >
                    <ArrowRight className="w-5 h-5" /> العودة للقائمة
                </button>

                {/* الكارت الرئيسي */}
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">

                    {/* Header Colored Strip */}
                    <div className="h-3 w-full bg-gradient-to-r from-[#115d9a] to-purple-600"></div>

                    <div className="p-8 md:p-10">
                        {/* User Info */}
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 border-2 border-white shadow-md overflow-hidden">
                                {post.profiles?.avatar_url ? (
                                    <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-8 h-8 m-auto mt-4 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{post.profiles?.full_name}</h2>
                                <p className="text-sm text-[#115d9a] font-bold">{post.profiles?.job_title}</p>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> تم النشر: {new Date(post.created_at).toLocaleDateString('ar-SA')}
                                </p>
                            </div>
                        </div>

                        {/* Post Content */}
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 leading-snug">
                            {post.post_title}
                        </h1>

                        <div className="flex flex-wrap gap-3 mb-8">
                            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold flex items-center gap-2">
                                <Briefcase className="w-4 h-4" /> {post.category}
                            </span>
                            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> {post.city}
                            </span>
                        </div>

                        <div className="prose prose-lg max-w-none text-gray-600 mb-10 whitespace-pre-line leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            {post.content}
                        </div>

                        {/* Action Buttons Area */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 1. زر التواصل */}
                            {post.phone_number && (
                                <div className="relative" ref={contactMenuRef}>
                                    <button
                                        onClick={() => setShowContactMenu(!showContactMenu)}
                                        className="w-full py-4 bg-[#115d9a] hover:bg-[#0e4d82] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Phone className="w-5 h-5" /> تواصل مع المعلن <ChevronDown className={`w-4 h-4 transition-transform ${showContactMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showContactMenu && (
                                        <div className="absolute bottom-full mb-2 left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-2 z-20">
                                            <a href={getWhatsAppUrl(post.phone_number)} target="_blank" className="flex items-center gap-3 px-6 py-4 hover:bg-green-50 text-green-700 font-bold border-b border-gray-50">
                                                <MessageCircle className="w-5 h-5" /> واتساب
                                            </a>
                                            <a href={`tel:${post.phone_number}`} className="flex items-center gap-3 px-6 py-4 hover:bg-blue-50 text-blue-700 font-bold">
                                                <Phone className="w-5 h-5" /> اتصال هاتفي
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 2. زر الشات */}
                            <Link href="/messages" className="w-full py-4 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                <MessageSquare className="w-5 h-5" /> محادثة عبر الموقع
                            </Link>

                            {/* 3. الإيميل */}
                            {post.contact_email && (
                                <a href={`mailto:${post.contact_email}`} className="w-full py-4 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                    <Mail className="w-5 h-5" /> البريد الإلكتروني
                                </a>
                            )}

                            {/* 4. السيرة الذاتية */}
                            {post.cv_url && (
                                <a href={post.cv_url} target="_blank" className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all md:col-span-2">
                                    <FileText className="w-5 h-5" /> عرض السيرة الذاتية (CV)
                                </a>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}