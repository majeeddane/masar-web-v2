import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import { Plus, Users, Eye, Calendar, Briefcase, ChevronLeft } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function EmployerDashboard() {
    const supabase = await createClient();

    // 1. التحقق من المستخدم
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 2. جلب وظائف المستخدم + عدد الطلبات
    // نستخدم (count) لحساب عدد المتقدمين دون جلب كل البيانات
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*, applications(count)') // السحر هنا: جلب العدد مباشرة
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <div className="container mx-auto max-w-5xl">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">لوحة التحكم 📊</h1>
                        <p className="text-gray-500">أدر وظائفك وشاهد طلبات التقديم</p>
                    </div>
                    <Link
                        href="/post/job"
                        className="bg-[#0084db] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#006bb3] transition-colors shadow-lg shadow-blue-100"
                    >
                        <Plus className="w-5 h-5" /> نشر وظيفة
                    </Link>
                </div>

                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                    {jobs && jobs.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {jobs.map((job: any) => (
                                <div key={job.id} className="p-6 md:p-8 hover:bg-gray-50 transition-colors flex flex-col md:flex-row justify-between items-center gap-6">

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(job.created_at).toLocaleDateString('ar-SA')}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${job.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {job.is_active ? 'نشط' : 'مغلق'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        {/* عداد المتقدمين */}
                                        <div className="flex flex-col items-center bg-blue-50 px-6 py-2 rounded-2xl border border-blue-100">
                                            <span className="text-2xl font-black text-[#0084db]">
                                                {job.applications[0]?.count || 0}
                                            </span>
                                            <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                                                <Users className="w-3 h-3" /> متقدم
                                            </span>
                                        </div>

                                        {/* أزرار الإجراءات */}
                                        <div className="flex gap-2 flex-1 md:flex-initial">
                                            <Link
                                                href={`/jobs/${job.id}`}
                                                className="flex-1 md:flex-initial bg-gray-100 text-gray-600 px-4 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors text-center"
                                                title="معاينة الوظيفة"
                                            >
                                                <Eye className="w-5 h-5 mx-auto" />
                                            </Link>

                                            <Link
                                                href={`/jobs/${job.id}/applications`}
                                                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${(job.applications[0]?.count || 0) > 0
                                                        ? 'bg-[#0084db] text-white hover:bg-[#006bb3] shadow-blue-100'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                                    }`}
                                            >
                                                عرض الطلبات <ChevronLeft className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 px-4">
                            <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">لم تنشر أي وظائف بعد</h3>
                            <p className="text-gray-500 mb-6 mt-2">ابدأ بنشر أول وظيفة واستقبل طلبات المبدعين</p>
                            <Link href="/post/job" className="text-[#0084db] font-bold hover:underline">
                                نشر وظيفة جديدة
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
