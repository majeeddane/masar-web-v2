import { createClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { MapPin, Calendar, Briefcase, Phone, Mail, ArrowRight, ExternalLink, Lock, LogIn } from 'lucide-react';
import { notFound } from 'next/navigation';

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

    // Initialize Server Client
    const supabase = await createClient();

    // 1. Check Auth (Gatekeeper)
    const { data: { user } } = await supabase.auth.getUser();
    const isLoggedIn = !!user;

    // 2. Fetch Job Data
    const { data: job, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !job) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
            {/* Hero Section */}
            <div className="relative h-64 md:h-80 w-full bg-gray-900">
                {job.image_url ? (
                    <>
                        <img
                            src={job.image_url}
                            alt={job.title}
                            className="w-full h-full object-cover opacity-60"
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
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

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

                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-8">
                            {job.title}
                        </h1>

                        {/* --- GATEKEEPER LOGIC --- */}
                        <div className="mt-6">
                            {isLoggedIn ? (
                                // LOGGED IN VIEW: Show Contacts
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                                    {job.contact_phone && (
                                        <a href={`tel:${job.contact_phone}`} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold transition-all shadow-md hover:shadow-lg">
                                            <Phone className="w-5 h-5" />
                                            اتصال هاتفي
                                        </a>
                                    )}

                                    {job.contact_email && (
                                        <a href={`mailto:${job.contact_email}`} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold transition-all shadow-md hover:shadow-lg">
                                            <Mail className="w-5 h-5" />
                                            إرسال بريد إلكتروني
                                        </a>
                                    )}

                                    {!job.contact_phone && !job.contact_email && (
                                        <div className="col-span-full bg-yellow-50 text-yellow-800 p-4 rounded-xl text-center font-medium border border-yellow-100 flex items-center justify-center gap-2">
                                            <Briefcase className="w-5 h-5" />
                                            للتقديم يرجى زيارة رابط المصدر بالأسفل
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // LOCKED VIEW: Blur + Login Prompt
                                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
                                    <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-sm z-0"></div>

                                    <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                                            <Lock className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">بيانات التواصل مخفية</h3>
                                            <p className="text-gray-500 mb-6">يجب عليك تسجيل الدخول لرؤية رقم الهاتف والبريد الإلكتروني للشركة.</p>
                                        </div>
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-blue-900/30"
                                        >
                                            <LogIn className="w-5 h-5" />
                                            تسجيل الدخول الآن
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Full Description */}
                    <div className="p-8 md:p-10 bg-white">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100 w-fit">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                            تفاصيل الوظيفة
                        </h2>

                        <div className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
                            {job.description || "لا يوجد وصف تفصيلي متاح."}
                        </div>

                        {/* Source Link */}
                        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                            <p className="text-gray-400 text-sm mb-4"> المصدر الأصلي للإعلان:</p>
                            <a
                                href={job.source_url}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-gray-600 font-bold hover:text-blue-600 hover:underline transition-colors"
                            >
                                عرض الإعلان على الموقع الأصلي
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
