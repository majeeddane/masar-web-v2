'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowRight, MapPin, Building2, Clock,
    Phone, Mail, Globe, MessageSquare,
    Loader2, ChevronDown, MessageCircle
} from 'lucide-react';

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showContactOptions, setShowContactOptions] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchJob = async () => {
            const { data, error } = await supabase
                .from('jobs')
                .select(`*, profiles:user_id (full_name, avatar_url)`)
                .eq('id', params.id)
                .single();

            if (!error) setJob(data);
            setLoading(false);
        };
        if (params.id) fetchJob();
    }, [params.id, supabase]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600 w-10 h-10" /></div>;
    if (!job) return <div className="text-center py-20 font-bold">الوظيفة غير موجودة</div>;

    const whatsappMessage = encodeURIComponent(`أهلاً، أنا مهتم بخصوص إعلان الوظيفة: (${job.title}) المنشور على منصة مسار.`);
    const whatsappUrl = `https://wa.me/${(job.contact_phone || job.phone_number)?.replace(/\s/g, '')}?text=${whatsappMessage}`;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 mb-6 font-bold hover:text-emerald-600 transition-colors">
                    <ArrowRight className="w-5 h-5" /> العودة للنتائج
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100"> {/* ⚠️ تم حذف overflow-hidden للسماح للقائمة بالظهور */}
                    <div className="h-4 bg-gradient-to-r from-[#115d9a] to-emerald-500 rounded-t-[2.5rem]"></div>

                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden">
                                    {job.profiles?.avatar_url ? <img src={job.profiles.avatar_url} className="w-full h-full object-cover" /> : <Building2 className="w-10 h-10 text-slate-300" />}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 mb-2">{job.title}</h1>
                                    <p className="text-[#115d9a] font-bold">
                                        {job.profiles?.full_name} • <span className="text-slate-400">{job.city || job.location}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-lg max-w-none text-slate-600 mb-12 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                            <h3 className="text-slate-900 font-black mb-4">الوصف الوظيفي:</h3>
                            <p className="whitespace-pre-wrap">{job.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href={`/messages?userId=${job.user_id}&refJob=${job.id}&title=${encodeURIComponent(job.title)}`} className="flex items-center justify-center gap-3 bg-purple-50 text-purple-700 py-4 rounded-2xl font-black border border-purple-100 hover:bg-purple-100 transition-all shadow-sm">
                                <MessageSquare className="w-6 h-6" /> محادثة عبر الموقع
                            </Link>

                            <div className="relative">
                                <button onClick={() => setShowContactOptions(!showContactOptions)} className="w-full flex items-center justify-center gap-3 bg-[#115d9a] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-[#0e4d82] transition-all">
                                    <Phone className="w-6 h-6" /> تواصل مع المعلن <ChevronDown className={`w-5 h-5 transition-transform ${showContactOptions ? 'rotate-180' : ''}`} />
                                </button>

                                {showContactOptions && (
                                    <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                        {(job.contact_phone || job.phone_number) && (
                                            <a href={`tel:${job.contact_phone || job.phone_number}`} className="flex items-center gap-4 px-6 py-5 hover:bg-slate-50 border-b border-slate-50">
                                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Phone className="w-6 h-6" /></div>
                                                <div className="text-right">
                                                    <span className="block text-sm font-black text-slate-800">اتصال هاتف</span>
                                                    <span className="text-xs text-slate-400 font-bold" suppressHydrationWarning>{job.contact_phone || job.phone_number}</span>
                                                </div>
                                            </a>
                                        )}
                                        {(job.contact_phone || job.phone_number) && (
                                            <a href={whatsappUrl} target="_blank" className="flex items-center gap-4 px-6 py-5 hover:bg-green-50 transition-colors border-b border-slate-50">
                                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><MessageCircle className="w-6 h-6" /></div>
                                                <div className="text-right"><span className="block text-sm font-black text-slate-800">واتساب</span><span className="text-xs text-slate-400 font-bold">مراسلة فورية</span></div>
                                            </a>
                                        )}
                                        {job.contact_email && (
                                            <a href={`mailto:${job.contact_email}`} className="flex items-center gap-4 px-6 py-5 hover:bg-orange-50 transition-colors">
                                                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Mail className="w-6 h-6" /></div>
                                                <div className="text-right"><span className="block text-sm font-black text-slate-800">البريد الإلكتروني</span><span className="text-xs text-slate-400 font-bold" suppressHydrationWarning>{job.contact_email}</span></div>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* زر مراسلة الإيميل المباشر (اختياري - يظهر كزر منفصل إذا طلب المستخدم ذلك، لكنه مدمج في القائمة أعلاه للأناقة. سأضيفه كزر منفصل أيضاً ليكون واضحاً كما طلب المستخدم "بتنسيق برتقالي") */}
                            {job.contact_email && (
                                <a href={`mailto:${job.contact_email}`} className="flex items-center justify-center gap-3 bg-orange-50 text-orange-600 py-4 rounded-2xl font-black border border-orange-100 hover:bg-orange-100 transition-all shadow-sm">
                                    <Mail className="w-6 h-6" /> مراسلة الإيميل
                                </a>
                            )}

                            {/* رابط التقديم الخارجي */}
                            {job.application_link && (
                                <div className="md:col-span-2">
                                    <a href={job.application_link} target="_blank" className="flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg w-full">
                                        <Globe className="w-6 h-6 text-emerald-400" /> رابط التقديم الخارجي
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}