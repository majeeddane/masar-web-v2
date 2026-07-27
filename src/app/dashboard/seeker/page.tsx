
import Link from 'next/link';
import { Briefcase, FileText, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabaseServer';

export default async function SeekerDashboard() {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Fetch Stats & Applications
    let applications: any[] = [];
    let stats = {
        totalApplied: 0,
        interviewing: 0,
        avgScore: 0
    };

    if (user) {
        const { data: apps } = await supabase
            .from('applications')
            .select('*, jobs(*)')
            .eq('user_id', user.id)
            .order('applied_at', { ascending: false });

        if (apps) {
            applications = apps;
            stats.totalApplied = apps.length;
            stats.interviewing = apps.filter(a => a.status === 'interview').length;

            const scoredApps = apps.filter(a => a.match_score > 0);
            const totalScore = scoredApps.reduce((acc, curr) => acc + curr.match_score, 0);
            stats.avgScore = scoredApps.length > 0 ? Math.round(totalScore / scoredApps.length) : 0;
        }
    }

    // 4. Fetch User Skills (CV) & Recommendations
    let recommendedJobs: any[] = [];
    let userSkills: string[] = [];
    let hasCV = false;

    if (user) {
        const { data: cv } = await supabase
            .from('cvs')
            .select('skills_extracted')
            .eq('user_id', user.id)
            .single();

        if (cv?.skills_extracted) {
            hasCV = true;
            userSkills = Array.isArray(cv.skills_extracted) ? cv.skills_extracted : [];

            // Fetch active jobs to match against
            const { data: allJobs } = await supabase
                .from('jobs')
                .select('id, title, city, skills_required, seo_url, created_at')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(50); // Limit pool for performance

            if (allJobs && userSkills.length > 0) {
                // Client-side simple matching (Intersection of skills)
                recommendedJobs = allJobs.map(job => {
                    const jobSkills: string[] = Array.isArray(job.skills_required) ? job.skills_required : [];
                    // Case-insensitive comparison
                    const intersection = jobSkills.filter(js =>
                        userSkills.some(us => us.toLowerCase() === js.toLowerCase())
                    );
                    const matchPercent = Math.round((intersection.length / (jobSkills.length || 1)) * 100);
                    return { ...job, matchPercent, intersectionCount: intersection.length };
                })
                    .filter(j => j.intersectionCount > 0) // Only show if at least 1 skill matches
                    .sort((a, b) => b.intersectionCount - a.intersectionCount) // Sort by most matched skills
                    .slice(0, 3); // Top 3
            }
        }
    }

    // 3. Status Badge Helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> قيد المراجعة</span>;
            case 'interview': return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Briefcase className="w-3 h-3" /> مقابلة</span>;
            case 'accepted': return <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> مقبول</span>;
            case 'rejected': return <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> مرفوض</span>;
            default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans" dir="rtl">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black text-blue-900">مسار</Link>
                    <div className="flex items-center gap-4">
                        <span className="text-slate-500 text-sm font-bold hidden md:block">مرحباً، {user?.user_metadata?.name || 'باحث عن عمل'}</span>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                            {(user?.user_metadata?.name?.[0] || 'U').toUpperCase()}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-10">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Link href="/dashboard/seeker" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors">
                        <div>
                            <p className="text-slate-400 font-bold text-sm mb-1">الوظائف المتقدم عليها</p>
                            <p className="text-3xl font-black text-slate-800">{stats.totalApplied}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6" />
                        </div>
                    </Link>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 font-bold text-sm mb-1">متوسط نسبة التطابق</p>
                            <p className={`text-3xl font-black ${stats.avgScore >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>{stats.avgScore}%</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                            <Star className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 font-bold text-sm mb-1">دعوات المقابلة</p>
                            <p className="text-3xl font-black text-slate-800">{stats.interviewing}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                وظائف مقترحة لك (AI)
                            </h2>

                            {hasCV ? (
                                <div className="space-y-4">
                                    {recommendedJobs.length > 0 ? recommendedJobs.map(job => (
                                        <div key={job.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                                                        <Link href={`/jobs/${job.seo_url}`}>{job.title}</Link>
                                                    </h3>
                                                    <p className="text-slate-500 text-sm mb-4">{job.city} • <span className="text-xs bg-slate-100 px-2 py-1 rounded-md">مهارات متطابقة: {job.intersectionCount}</span></p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {job.skills_required?.slice(0, 4).map((skill: string, idx: number) => (
                                                            <span key={idx} className={`text-xs px-2 py-1 rounded-md font-bold ${userSkills.some(us => us.toLowerCase() === skill.toLowerCase())
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-gray-100 text-gray-500'
                                                                }`}>
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="w-14 h-14 rounded-full border-4 border-slate-100 flex items-center justify-center font-black text-sm text-slate-700 mb-2">
                                                        {job.matchPercent}%
                                                    </div>
                                                    <Link href={`/jobs/${job.seo_url}`} className="text-xs font-bold text-blue-600 hover:underline">عرض التفاصيل</Link>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 bg-white rounded-3xl border border-gray-100">
                                            <p className="text-slate-500 mb-4">لا توجد وظائف تطابق مهاراتك حالياً.</p>
                                            <p className="text-sm text-slate-400">حاول إضافة المزيد من المهارات لسيرتك الذاتية.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-bold mb-2">قم بتحميل سيرتك الذاتية</h3>
                                        <p className="text-blue-200 mb-6 max-w-md">للحصول على ترشيحات وظائف دقيقة تعتمد على ذكاء اصطناعي يحلل مهاراتك وخبراتك.</p>
                                        <Link href="/dashboard/cv" className="bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-block">
                                            بناء السيرة الذاتية الآن
                                        </Link>
                                    </div>
                                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                                </div>
                            )}
                        </div>

                        {/* Recent Applications */}
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-6">آخر التقديمات</h2>
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                {applications.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {applications.map((app) => (
                                            <div key={app.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-xl group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        {app.jobs?.title?.[0]}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition-colors">{app.jobs?.title}</h3>
                                                        <p className="text-slate-400 text-sm">{app.jobs?.city} • {new Date(app.applied_at).toLocaleDateString('ar-EG')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {getStatusBadge(app.status)}
                                                    {app.match_score > 0 && (
                                                        <span className={`text-xs font-bold ${app.match_score >= 80 ? 'text-green-600' :
                                                            app.match_score >= 50 ? 'text-yellow-600' : 'text-slate-400'
                                                            }`}>
                                                            نسبة التطابق: {app.match_score}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Briefcase className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لم تقدم على أي وظيفة بعد</h3>
                                        <p className="text-slate-500 mb-6">ابدأ البحث عن وظيفتك المستقبلية الآن</p>
                                        <Link href="/jobs" className="text-blue-600 font-bold hover:underline">
                                            تصفح الوظائف
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">أكمل ملفك الشخصي</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-500">اكتمال الملف</span>
                                        <span className="text-blue-600">40%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full w-[40%]"></div>
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>إنشاء الحساب</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-slate-600">
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                                        <span>رفع السيرة الذاتية</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-slate-600">
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                                        <span>إضافة المهارات</span>
                                    </li>
                                </ul>
                                <Link href="/dashboard/cv" className="block w-full py-2 bg-slate-50 text-slate-600 font-bold text-center rounded-xl hover:bg-slate-100 transition-colors text-sm">
                                    إكمال الملف
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
