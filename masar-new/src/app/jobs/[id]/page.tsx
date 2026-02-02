import { createClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import { MapPin, Building2, Clock, DollarSign, Calendar, Globe, Share2 } from 'lucide-react';
import ApplyButton from '@/components/ApplyButton';
import Link from 'next/link';

export default async function JobDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient();

    // 1. جلب تفاصيل الوظيفة
    const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !job) return notFound();

    // 2. التحقق مما إذا كان المستخدم الحالي قد قدم عليها مسبقاً
    const { data: { user } } = await supabase.auth.getUser();
    let hasApplied = false;

    if (user) {
        const { data: application } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', job.id)
            .eq('applicant_id', user.id)
            .single();

        if (application) hasApplied = true;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <div className="max-w-4xl mx-auto">

                {/* زر العودة */}
                <div className="mb-6">
                    <Link href="/jobs" className="text-gray-500 hover:text-[#0084db] font-bold text-sm">
                        &larr; العودة للوظائف
                    </Link>
                </div>

                {/* رأس الصفحة */}
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
                                {job.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-gray-500 font-medium">
                                <span className="flex items-center gap-1"><Building2 className="w-5 h-5" /> {job.company_name}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-5 h-5" /> {job.location}</span>
                                <span className="flex items-center gap-1"><Clock className="w-5 h-5" /> {job.type}</span>
                            </div>
                        </div>
                        <div className="bg-blue-50 text-[#0084db] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            نُشرت بتاريخ {new Date(job.created_at).toLocaleDateString('ar-SA')}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* العمود الأيمن: التفاصيل */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-black text-gray-900 mb-6 border-r-4 border-[#0084db] pr-4">تفاصيل الوظيفة</h2>
                            <div className="prose prose-blue max-w-none text-gray-600 leading-loose whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </div>
                    </div>

                    {/* العمود الأيسر: بطاقة التقديم */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-[30px] p-6 shadow-lg shadow-blue-50 border border-blue-100 sticky top-24">
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <span className="block text-gray-500 text-sm font-bold mb-1">الراتب المتوقع</span>
                                <div className="text-2xl font-black text-green-600 flex items-center gap-1">
                                    <DollarSign className="w-6 h-6" />
                                    {job.salary_range || 'غير محدد'}
                                </div>
                            </div>

                            {user ? (
                                <ApplyButton jobId={job.id} hasApplied={hasApplied} />
                            ) : (
                                <Link href="/login" className="block w-full bg-gray-900 text-white font-bold py-4 rounded-xl text-center hover:bg-gray-800 transition-colors">
                                    سجل دخولك للتقديم
                                </Link>
                            )}

                            <p className="text-center text-xs text-gray-400 mt-4">
                                عند التقديم، سيتم مشاركة ملفك الشخصي في مسار مع صاحب العمل.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
