import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Building2, MapPin, Calendar, Briefcase, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ApplicationForm from '@/components/ApplicationForm';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Force dynamic rendering to ensure fresh data fetch
export const dynamic = 'force-dynamic';

interface JobDetailsProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function JobDetailsPage(props: JobDetailsProps) {
    const params = await props.params;
    const { id } = params;

    // Fetch Job Data
    const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !job) {
        console.error('Job Fetch Error:', error);
        notFound();
    }

    // Format Date
    const formattedDate = new Date(job.posted_at || job.created_at).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-4xl mx-auto">

                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors font-bold gap-2">
                        <ArrowRight className="w-5 h-5" />
                        عودة للوحة التحكم
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">

                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-8 sm:p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-blue-600/50 border border-blue-400/30 px-3 py-1 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
                                        <Briefcase className="w-4 h-4" />
                                        {job.category || 'عام'}
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
                                        {job.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-6 text-blue-100 font-medium text-sm sm:text-base">
                                        <span className="flex items-center gap-2 bg-blue-800/50 px-3 py-1.5 rounded-lg">
                                            <Building2 className="w-5 h-5" />
                                            {job.company || 'شركة غير محددة'}
                                        </span>
                                        <span className="flex items-center gap-2 bg-blue-800/50 px-3 py-1.5 rounded-lg">
                                            <MapPin className="w-5 h-5" />
                                            {job.city || 'السعودية'}
                                        </span>
                                        <span className="flex items-center gap-2 bg-blue-800/50 px-3 py-1.5 rounded-lg">
                                            <Calendar className="w-5 h-5" />
                                            {formattedDate}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 sm:p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                            {/* Description Column */}
                            <div className="lg:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-r-4 border-blue-600 pr-3">
                                        وصف الوظيفة
                                    </h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                        {job.description}
                                    </div>
                                </section>

                                {/* Application Form */}
                                <section className="border-t border-gray-100 pt-8 mt-8">
                                    <ApplicationForm jobId={job.id} />
                                </section>
                            </div>

                            {/* Sidebar / Action Column */}
                            <div className="lg:col-span-1">
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 sticky top-24">
                                    <h3 className="font-bold text-slate-900 mb-4 text-lg">تفاصيل التقديم</h3>

                                    <div className="space-y-4 mb-8">
                                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <div className="text-xs text-slate-400 font-bold mb-1">جهة العمل</div>
                                            <div className="font-bold text-slate-800">{job.company || 'غير محدد'}</div>
                                        </div>
                                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <div className="text-xs text-slate-400 font-bold mb-1">الموقع</div>
                                            <div className="font-bold text-slate-800">{job.city || 'السعودية'}</div>
                                        </div>
                                    </div>

                                    {job.source_url ? (
                                        <a
                                            href={job.source_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 font-bold py-3 px-6 rounded-xl transition-all"
                                        >
                                            <span>عرض المصدر الأصلي</span>
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                    ) : (
                                        <div className="text-center text-slate-400 text-sm font-bold">
                                            التقديم متاح عبر النموذج
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <a
                                            href="#application-form"
                                            className="w-full flex items-center justify-center gap-2 bg-[#0084db] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all hover:-translate-y-1"
                                        >
                                            <span>تقدم الآن</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </a>
                                    </div>

                                    <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                                        بياناتك محفوظة بشكل آمن ولن يتم مشاركتها إلا مع صاحب العمل
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
