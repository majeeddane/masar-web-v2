import { supabase as adminSupabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { MapPin, Calendar, Briefcase, Phone, Mail, ArrowRight, ExternalLink, Lock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Props {
    params: { id: string };
}

// Format date helper
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};

export default async function JobDetailsPage({ params }: Props) {
    const { id } = await params;

    // 1. Fetch Job Data (Public Data)
    // We use the admin client or standard client for fetching PUBLIC job data.
    // However, since we are fetching from 'news' table which likely has RLS, 
    // we should ensure we can read it. Assuming 'news' is public readable or we use service role if strictly backend.
    // For now, sticking to the existing pattern for data fetching, but we need auth check for UI.
    const { data: job, error } = await adminSupabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !job) {
        return notFound();
    }

    // 2. Check Auth State (Server Side)
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();
    const isLoggedIn = !!session;

    return (
        <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
            {/* Hero Section */}
            <div className="relative h-64 md:h-80 w-full bg-gray-900">
                {job.image_url ? (
                    <>
                        <img
                            src={job.image_url}
                            alt={job.title}
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                        <Briefcase className="w-24 h-24 text-white" />
                    </div>
                )}

                {/* Back Link */}
                <div className="absolute top-6 right-6 z-10">
                    <Link href="/news" className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-all">
                        <ArrowRight className="w-4 h-4" />
                        العودة للوظائف
                    </Link>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-32 relative z-10">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

                    {/* Header Info */}
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {job.location || 'السعودية'}
                            </span>
                            <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {formatDate(job.published)}
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                            {job.title}
                        </h1>
                    </div>

                    {/* Full Description */}
                    <div className="p-8 md:p-10">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                            تفاصيل الوظيفة
                        </h2>

                        <div className="prose max-w-none text-gray-700 leading-8 whitespace-pre-line text-lg bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            {job.description || "لا يوجد وصف تفصيلي متاح لهذه الوظيفة."}
                        </div>

                        {/* Contact Buttons Section */}
                        <div className="mt-10">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">بيانات التواصل:</h3>

                            {isLoggedIn ? (
                                /* Logged In State: Show Contact Buttons */
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {job.contact_phone && (
                                        <a
                                            href={`tel:${job.contact_phone}`}
                                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
                                        >
                                            <Phone className="w-6 h-6" />
                                            واتساب أو اتصال
                                        </a>
                                    )}

                                    {job.contact_email && (
                                        <a
                                            href={`mailto:${job.contact_email}`}
                                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
                                        >
                                            <Mail className="w-6 h-6" />
                                            إرسال إيميل
                                        </a>
                                    )}

                                    {!job.contact_phone && !job.contact_email && (
                                        <div className="col-span-full bg-yellow-50 text-yellow-800 p-6 rounded-xl text-center font-medium border border-yellow-100">
                                            لم يتم العثور على أرقام تواصل مباشرة. يرجى مراجعة المصدر الأصلي للتقديم.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Guest State: Show Lock Card */
                                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                                        بيانات التواصل مخفية
                                    </h4>
                                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                        يرجى تسجيل الدخول أو إنشاء حساب لمشاهدة الرقم والإيميل والتقدم للوظيفة.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Link
                                            href="/login"
                                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
                                        >
                                            تسجيل الدخول
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-8 py-3 rounded-xl font-bold transition-all"
                                        >
                                            إنشاء حساب جديد
                                        </Link>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Source Link */}
                        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                            <a
                                href={job.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 hover:underline transition-colors font-medium"
                            >
                                عرض المصدر الأصلي على الويب
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
