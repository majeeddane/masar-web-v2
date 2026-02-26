'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import {
    LayoutDashboard, Users, Briefcase, CheckCircle2, XCircle,
    Clock, Loader2, ChevronDown, ChevronUp, FileText
} from 'lucide-react';

export default function DashboardPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalJobs: 0, totalApplications: 0, pending: 0 });
    const [expandedJob, setExpandedJob] = useState<string | null>(null);

    // جلب البيانات
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. جلب الوظائف التي نشرها المستخدم
            const { data: myJobs, error: jobsError } = await supabase
                .from('jobs')
                .select('*, applications(*)') // جلب الطلبات مع كل وظيفة
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (jobsError) console.error(jobsError);

            if (myJobs) {
                setJobs(myJobs);

                // حساب الإحصائيات
                let totalApps = 0;
                let pendingApps = 0;
                myJobs.forEach(job => {
                    totalApps += job.applications.length;
                    pendingApps += job.applications.filter((app: any) => app.status === 'pending').length;
                });

                setStats({
                    totalJobs: myJobs.length,
                    totalApplications: totalApps,
                    pending: pendingApps
                });
            }
            setLoading(false);
        };

        fetchData();
    }, [supabase]);

    // دالة تغيير حالة الطلب (قبول/رفض)
    const updateStatus = async (appId: string, newStatus: string, jobId: string) => {
        // تحديث الواجهة فوراً (Optimistic UI)
        setJobs(jobs.map(job => {
            if (job.id === jobId) {
                return {
                    ...job,
                    applications: job.applications.map((app: any) =>
                        app.id === appId ? { ...app, status: newStatus } : app
                    )
                };
            }
            return job;
        }));

        // التحديث في قاعدة البيانات
        const { error } = await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', appId);

        if (error) alert('فشل تحديث الحالة');
    };

    // جلب بيانات المتقدم (البروفايل) عند فتح القائمة
    const [applicantsData, setApplicantsData] = useState<any>({});

    const handleExpand = async (jobId: string) => {
        if (expandedJob === jobId) {
            setExpandedJob(null);
            return;
        }
        setExpandedJob(jobId);

        // إذا لم نكن قد جلبنا بيانات المتقدمين لهذه الوظيفة من قبل
        if (!applicantsData[jobId]) {
            const job = jobs.find(j => j.id === jobId);
            const seekerIds = job.applications.map((app: any) => app.seeker_id);

            if (seekerIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, job_title')
                    .in('id', seekerIds);

                setApplicantsData((prev: any) => ({ ...prev, [jobId]: profiles }));
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-10 h-10 animate-spin text-[#115d9a]" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12" dir="rtl">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-[#115d9a]" /> لوحة التحكم
                    </h1>
                    <p className="text-gray-500 mt-2">أهلاً بك! إليك ملخص نشاط التوظيف الخاص بك.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#115d9a]">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-gray-900">{stats.totalJobs}</div>
                            <div className="text-sm text-gray-500 font-bold">وظيفة منشورة</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-gray-900">{stats.totalApplications}</div>
                            <div className="text-sm text-gray-500 font-bold">إجمالي المتقدمين</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-gray-900">{stats.pending}</div>
                            <div className="text-sm text-gray-500 font-bold">قيد الانتظار</div>
                        </div>
                    </div>
                </div>

                {/* Jobs & Applications List */}
                <h2 className="text-xl font-bold text-gray-900 mb-4">إدارة الوظائف والطلبات</h2>

                {jobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">لم تنشر أي وظائف بعد</h3>
                        <Link href="/jobs/new" className="inline-block mt-4 bg-[#115d9a] text-white px-6 py-2 rounded-xl font-bold">
                            انشر وظيفتك الأولى
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md">

                                {/* Job Header Row */}
                                <div
                                    onClick={() => handleExpand(job.id)}
                                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-[#115d9a] font-bold">
                                            {job.title.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> نشرت في {new Date(job.created_at).toLocaleDateString('ar-SA')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-left hidden sm:block">
                                            <div className="text-sm font-bold text-gray-900">{job.applications.length} متقدم</div>
                                            <div className="text-xs text-orange-500 font-bold">
                                                {job.applications.filter((a: any) => a.status === 'pending').length} جديد
                                            </div>
                                        </div>
                                        {expandedJob === job.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                    </div>
                                </div>

                                {/* Applications List (Accordion) */}
                                {expandedJob === job.id && (
                                    <div className="bg-gray-50 border-t border-gray-100 p-4 sm:p-6 animate-in slide-in-from-top-2">
                                        {job.applications.length === 0 ? (
                                            <p className="text-center text-gray-500 py-4 font-bold text-sm">لا يوجد متقدمين حتى الآن 😔</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {job.applications.map((app: any) => {
                                                    const profile = applicantsData[job.id]?.find((p: any) => p.id === app.seeker_id);
                                                    return (
                                                        <div key={app.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                                                    {profile?.avatar_url ? (
                                                                        <img src={profile.avatar_url} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Users className="w-6 h-6 m-auto mt-3 text-gray-400" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <Link href={`/profile/${app.seeker_id}`} className="font-bold text-gray-900 hover:text-[#115d9a] hover:underline">
                                                                        {profile?.full_name || 'مستخدم مسار'}
                                                                    </Link>
                                                                    <p className="text-sm text-gray-500">{profile?.job_title || 'باحث عن عمل'}</p>
                                                                    <p className="text-xs text-gray-400 mt-1">تقدم: {new Date(app.created_at).toLocaleDateString('ar-SA')}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                                {app.status === 'pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => updateStatus(app.id, 'accepted', job.id)}
                                                                            className="bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                                                                        >
                                                                            <CheckCircle2 className="w-4 h-4" /> قبول
                                                                        </button>
                                                                        <button
                                                                            onClick={() => updateStatus(app.id, 'rejected', job.id)}
                                                                            className="bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                                                                        >
                                                                            <XCircle className="w-4 h-4" /> رفض
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {app.status === 'accepted' && (
                                                                    <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1">
                                                                        <CheckCircle2 className="w-4 h-4" /> مقبول
                                                                    </span>
                                                                )}

                                                                {app.status === 'rejected' && (
                                                                    <span className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1">
                                                                        <XCircle className="w-4 h-4" /> مرفوض
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}