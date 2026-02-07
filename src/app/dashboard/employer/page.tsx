import Link from 'next/link';
import { Briefcase, Users, Plus, LayoutGrid, Search } from 'lucide-react';
import { createClient } from '@/lib/supabaseServer';

export const metadata = {
    title: 'لوحة تحكم صاحب العمل | مسار',
};

export default async function EmployerDashboard() {
    const supabase = await createClient();

    // In a real app, we filter by created_by = auth.uid()
    // For demo purposes (admin view), we show all active jobs
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*, applications(count)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white border-b border-gray-100 shadow-sm h-20 flex items-center">
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black text-blue-900">مسار</Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-600">شركة التقنية المتطورة</span>
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">T</div>
                    </div>
                </div>
            </nav>

            <div className="pt-32 pb-20 container mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">لوحة التحكم</h1>
                        <p className="text-slate-500">إدارة الوظائف والمتقدمين</p>
                    </div>
                    <Link href="/dashboard/employer/post-job" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all">
                        <Plus className="w-5 h-5" />
                        <span>نشر وظيفة جديدة</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Briefcase className="w-6 h-6" /></div>
                            <span className="text-slate-500 font-bold">الوظائف النشطة</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900">{jobs?.length || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users className="w-6 h-6" /></div>
                            <span className="text-slate-500 font-bold">إجمالي المتقدمين</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900">
                            {jobs?.reduce((acc, job) => acc + (job.applications?.[0]?.count || 0), 0) || 0}
                        </div>
                    </div>
                </div>

                {/* Jobs Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-xl text-slate-800">الوظائف المنشورة</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 text-slate-500 font-bold text-sm">
                                <tr>
                                    <th className="px-6 py-4">المسمى الوظيفي</th>
                                    <th className="px-6 py-4">تاريخ النشر</th>
                                    <th className="px-6 py-4">المتقدمين</th>
                                    <th className="px-6 py-4">الحالة</th>
                                    <th className="px-6 py-4">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {jobs?.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{job.title}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(job.created_at).toLocaleDateString('ar-EG')}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold text-sm">
                                                {job.applications?.[0]?.count || 0} متقدم
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg font-bold text-xs">نشط</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/dashboard/employer/job/${job.id}`} className="text-blue-600 hover:text-blue-800 font-bold text-sm">
                                                عرض المتقدمين
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {(!jobs || jobs.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            لا توجد وظائف منشورة حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
