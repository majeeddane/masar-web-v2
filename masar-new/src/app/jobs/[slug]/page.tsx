import Link from 'next/link';
import { Briefcase, MapPin, Clock, ArrowRight, Share2, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';

// Allow params to be passed correctly in Next.js 15
export default async function JobDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const supabase = await createClient();

    // Fetch Job Data
    const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('seo_url', decodedSlug)
        .single();

    if (!job || error) {
        notFound();
    }

    // Check if saved (if user is logged in - logic to be added later)
    const isSaved = false;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
            {/* Simple Navbar */}
            <nav className="fixed w-full z-50 bg-white border-b border-slate-100 shadow-sm h-20 flex items-center">
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group text-slate-600 hover:text-blue-700 font-bold transition-colors">
                        <ArrowRight className="w-5 h-5" />
                        عودة للرئيسية
                    </Link>
                    <Link href="/" className="text-2xl font-black text-blue-900 tracking-tighter">مسار</Link>
                </div>
            </nav>

            <div className="pt-32 pb-20 container mx-auto px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Job Header */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-cyan-500" />

                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                                <span className="inline-block bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg text-sm mb-4">
                                    {job.category || 'عام'}
                                </span>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                                    {job.title}
                                </h1>

                                <div className="flex flex-wrap gap-6 text-slate-500 font-medium">
                                    <span className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-gray-400" />
                                        مؤسسة توظيف
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        {job.city || 'غير محدد'}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        {new Date(job.created_at).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 w-full md:w-auto">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-all w-full md:w-auto text-center">
                                    تقديم الآن
                                </button>
                                <button className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 font-bold px-8 py-4 rounded-xl transition-all w-full md:w-auto flex items-center justify-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    مشاركة
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                    الوصف الوظيفي
                                </h2>
                                <div
                                    className="prose prose-lg prose-blue max-w-none text-slate-600 leading-loose"
                                    dangerouslySetInnerHTML={{ __html: job.description }}
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-24">
                                <h3 className="font-bold text-slate-900 mb-4 text-lg">تفاصيل إضافية</h3>
                                <ul className="space-y-4">
                                    <li className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                        <span className="text-gray-500">الراتب</span>
                                        <span className="font-bold text-slate-800">{job.salary || 'غير محدد'}</span>
                                    </li>
                                    <li className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                        <span className="text-gray-500">نوع العمل</span>
                                        <span className="font-bold text-slate-800">دوام كامل</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
