'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
    Loader2, User as UserIcon, MapPin, Briefcase, Mail, Phone,
    Calendar, DollarSign, Award, Grid, MessageCircle, CheckCircle2,
    Share2, ExternalLink, Globe, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PublicProfilePage() {
    const params = useParams();
    const profileId = params?.id as string;

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (profileId) {
            fetchProfile();
        }
    }, [profileId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-[#115d9a] animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
                <UserIcon className="h-20 w-20 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">الملف غير موجود</h1>
                <p className="text-gray-500 mb-6">لم يتم العثور على ملف المستخدم المطلوب. ربما تم حذفه أو الرابط غير صحيح.</p>
                <Link href="/talents" className="btn-primary">
                    تصفح كفاءات أخرى
                </Link>
            </div>
        );
    }

    const skillsList = profile.skills && typeof profile.skills === 'string'
        ? profile.skills.split(',').filter(Boolean)
        : [];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12" dir="rtl">

            {/* 1. Hero / Header Section */}
            <div className="bg-white border-b border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-r from-[#115d9a] to-[#0e4d82]"></div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 relative pt-16 pb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-right">

                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-white p-1.5 shadow-lg mx-auto md:mx-0">
                                <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100 border border-gray-100 relative">
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={profile.full_name}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                            <UserIcon className="h-16 w-16" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {profile.is_looking_for_work && (
                                <div className="absolute -bottom-3 left-1/2 md:left-auto md:-right-3 -translate-x-1/2 md:translate-x-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm flex items-center gap-1 whitespace-nowrap">
                                    <CheckCircle2 className="h-3 w-3" />
                                    متاح للعمل
                                </div>
                            )}
                        </div>

                        {/* Name & Title */}
                        <div className="flex-1 pb-2">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center md:justify-start gap-2">
                                {profile.full_name || 'مستخدم مسار'}
                                {profile.is_verified && (
                                    <div className="bg-blue-50 text-[#115d9a] text-xs px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1 shadow-sm" title="حساب موثق">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span className="font-bold">موثق</span>
                                    </div>
                                )}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-600">
                                {profile.job_title && (
                                    <span className="flex items-center gap-1.5 bg-blue-50 text-[#115d9a] px-3 py-1 rounded-lg text-sm font-medium">
                                        <Briefcase className="h-4 w-4" />
                                        {profile.job_title}
                                    </span>
                                )}
                                {profile.category && (
                                    <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm">
                                        <Grid className="h-4 w-4" />
                                        {profile.category}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <Link
                                href={`/messages?user_id=${profileId}`}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#115d9a] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0e4d82] transition-colors shadow-lg shadow-blue-900/10"
                            >
                                <MessageCircle className="h-5 w-5" />
                                تواصل معي
                            </Link>
                            <button className="flex items-center justify-center p-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Layout (Grid) */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Column: Sidebar Details */}
                    <div className="space-y-6">
                        {/* Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-[#115d9a]" />
                                معلومات الملف
                            </h3>
                            <div className="space-y-4">
                                {profile.expected_salary && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-green-50 p-2 rounded-lg shrink-0">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">الراتب المتوقع</p>
                                            <p className="font-semibold text-gray-900">{profile.expected_salary}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                                        <Calendar className="h-5 w-5 text-[#115d9a]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">تاريخ الانضمام</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(profile.created_at || Date.now()).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {profile.location && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-gray-50 p-2 rounded-lg shrink-0">
                                            <MapPin className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">الموقع</p>
                                            <p className="font-semibold text-gray-900">{profile.location}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Preview (Optional / Placeholder) */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-sm p-6 text-white text-center">
                            <h3 className="font-bold text-lg mb-2">هل ترغب بالتوظيف؟</h3>
                            <p className="text-gray-300 text-sm mb-4">تواصل مباشرة للاتفاق على التفاصيل.</p>
                            <Link href={`/messages?user_id=${profileId}`} className="text-white bg-white/10 hover:bg-white/20 block w-full py-2.5 rounded-lg text-sm font-bold transition-colors border border-white/10">
                                إرسال رسالة
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Main Content */}
                    <div className="md:col-span-2 space-y-8">

                        {/* Bio Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-[#115d9a]"></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Briefcase className="h-6 w-6 text-[#115d9a]" />
                                النبذة المهنية
                            </h3>
                            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {profile.bio ? profile.bio : (
                                    <p className="text-gray-400 italic">لا توجد نبذة شخصية متاحة لهذا المستخدم.</p>
                                )}
                            </div>
                        </div>

                        {/* Skills Section */}
                        {skillsList.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Award className="h-6 w-6 text-[#115d9a]" />
                                    المهارات والخبرات
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {skillsList.map((skill: string, idx: number) => (
                                        <div
                                            key={idx}
                                            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium flex items-center gap-2 hover:border-[#115d9a] hover:text-[#115d9a] transition-colors cursor-default"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                                            {skill.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>

        </div>
    );
}