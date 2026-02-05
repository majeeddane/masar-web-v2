import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import { MapPin, Building2, Clock, DollarSign, Briefcase, Plus } from 'lucide-react';

// لجعل الصفحة ديناميكية وتتحدث باستمرار عند نشر وظيفة جديدة
export const dynamic = 'force-dynamic';

export default async function JobsPage() {
    const supabase = await createClient();

    // جلب الوظائف النشطة فقط، مرتبة من الأحدث للأقدم
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <div className="container mx-auto max-w-5xl">

                {/* --- رأس الصفحة --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">سوق العمل 💼</h1>
                        <p className="text-gray-500 font-medium">اكتشف أحدث الفرص الوظيفية أو انشر وظيفة لفريقك</p>
                    </div>

                    <Link
                        href="/jobs/new"
                        className="bg-[#0084db] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-[#006bb3] transition-all flex items-center gap-2 hover:-translate-y-1"
                    >
                        <Plus className="w-5 h-5" />
                        نشر وظيفة جديدة
                    </Link>
                </div>

                {/* --- قائمة الوظائف --- */}
                <div className="grid grid-cols-1 gap-4">
                    {jobs && jobs.length > 0 ? (
                        jobs.map((job) => (
                            <Link
                                href={`/jobs/${job.id}`} // سنبني صفحة التفاصيل لاحقاً
                                key={job.id}
                                className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0084db]/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-black text-gray-900 group-hover:text-[#0084db] transition-colors">
                                            {job.title}
                                        </h2>
                                        {/* وسم "جديد" إذا كانت الوظيفة مضافة اليوم (اختياري) */}
                                        <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-lg font-bold">نشط</span>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                                        <div className="flex items-center gap-1">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            {job.company_name}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            {job.type}
                                        </div>
                                        {job.salary_range && (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <DollarSign className="w-4 h-4" />
                                                {job.salary_range}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full md:w-auto">
                                    <span className="block text-center md:inline-block bg-gray-50 text-gray-600 px-6 py-2.5 rounded-xl font-bold text-sm group-hover:bg-[#0084db] group-hover:text-white transition-colors">
                                        التفاصيل والتقديم
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        // --- حالة عدم وجود وظائف ---
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">لا توجد وظائف حالياً</h3>
                            <p className="text-gray-500 mb-6">كن أول من ينشر وظيفة في منصة مسار!</p>
                            <Link href="/jobs/new" className="text-[#0084db] font-bold hover:underline">
                                نشر وظيفة الآن
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
