import Link from 'next/link';
import { Briefcase, Users, ArrowRight, Download, Star, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabaseServer';

export default async function JobApplicantsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Job Info
    const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

    // Fetch Applicants with User profile and CV
    const { data: applications } = await supabase
        .from('applications')
        .select(`
        *,
        users (name, email),
        cv_url
    `)
        .eq('job_id', id)
        .order('match_score', { ascending: false }); // AI RANKING LOGIC

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white border-b border-gray-100 shadow-sm h-20 flex items-center">
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link href="/dashboard/employer" className="flex items-center gap-2 group text-slate-600 hover:text-blue-700 font-bold transition-colors">
                        <ArrowRight className="w-5 h-5" />
                        عودة للوحة التحكم
                    </Link>
                    <span className="text-xl font-black text-blue-900">مسار</span>
                </div>
            </nav>

            <div className="pt-32 pb-20 container mx-auto px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">المتقدمين للوظيفة</h1>
                    <p className="text-slate-500 font-bold text-lg">{job?.title}</p>
                    <div className="mt-2 flex gap-4 text-sm">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold">{applications?.length || 0} متقدم</span>
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg font-bold">AI Matching Active</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 text-slate-500 font-bold text-sm">
                                <tr>
                                    <th className="px-6 py-4">الترتيب (AI)</th>
                                    <th className="px-6 py-4">اسم المتقدم</th>
                                    <th className="px-6 py-4">نسبة التطابق</th>
                                    <th className="px-6 py-4">تاريخ التقديم</th>
                                    <th className="px-6 py-4">السيرة الذاتية</th>
                                    <th className="px-6 py-4">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {applications?.map((app, index) => {
                                    const rank = index + 1;
                                    const isTop3 = rank <= 3;
                                    return (
                                        <tr key={app.id} className={`hover:bg-slate-50/50 transition-colors ${isTop3 ? 'bg-blue-50/40' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {rank === 1 && <span className="bg-yellow-100 text-yellow-700 p-1.5 rounded-lg flex items-center justify-center"><Star className="w-4 h-4 fill-current" /></span>}
                                                    {rank === 2 && <span className="bg-gray-200 text-gray-700 p-1.5 rounded-lg flex items-center justify-center"><Star className="w-4 h-4 fill-current" /></span>}
                                                    {rank === 3 && <span className="bg-orange-100 text-orange-700 p-1.5 rounded-lg flex items-center justify-center"><Star className="w-4 h-4 fill-current" /></span>}
                                                    <span className={`font-black ${isTop3 ? 'text-blue-900 text-lg' : 'text-slate-500'}`}>#{rank}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{app.users?.name || 'مجهول'}</div>
                                                <div className="text-xs text-slate-400">{app.users?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 w-32">
                                                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                                                        <span className={`${(app.match_score || 0) >= 80 ? 'text-green-600' :
                                                                (app.match_score || 0) >= 50 ? 'text-yellow-600' : 'text-red-500'
                                                            }`}>
                                                            {app.match_score || 0}% تطابق
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${(app.match_score || 0) >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                                                    (app.match_score || 0) >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-rose-400'
                                                                }`}
                                                            style={{ width: `${app.match_score || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">{new Date(app.applied_at).toLocaleDateString('ar-EG')}</td>
                                            <td className="px-6 py-4">
                                                <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 text-sm font-bold transition-colors bg-white border border-gray-200 hover:border-blue-200 px-3 py-1.5 rounded-lg shadow-sm">
                                                    <Download className="w-4 h-4" />
                                                    <span>CV</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold text-xs">{app.status || 'قيد المراجعة'}</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {(!applications || applications.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            لا يوجد متقدمين حتى الآن
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
