'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
    LayoutDashboard, Briefcase, Plus, MessageSquare,
    User, ArrowRight, Settings, Loader2, FileText,
    ChevronLeft, UserPlus, Eye, EyeOff, Edit3, Users, Check, X, Clock, Send
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ activeJobs: 0 });
    const [recentJobs, setRecentJobs] = useState<any[]>([]);

    // Applications Lists
    const [receivedApplications, setReceivedApplications] = useState<any[]>([]);
    const [sentApplications, setSentApplications] = useState<any[]>([]);

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 1. Get Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profileData);

            // 2. Get Jobs posted by user
            const { data: jobs } = await supabase
                .from('jobs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (jobs) {
                setStats({ activeJobs: jobs.length });
                setRecentJobs(jobs.slice(0, 3));
            }

            // 3. GET RECEIVED APPLICATIONS (For Employer)
            const { data: rxApps } = await supabase
                .from('applications')
                .select(`
                    *,
                    seeker:seeker_id (id, full_name, avatar_url, job_title),
                    job:job_id (id, title)
                `)
                .eq('employer_id', user.id)
                .order('created_at', { ascending: false });

            setReceivedApplications(rxApps || []);

            // 4. GET SENT APPLICATIONS (For Seeker)
            const { data: txApps } = await supabase
                .from('applications')
                .select(`
                    *,
                    job:job_id (id, title),
                    employer:employer_id (full_name, avatar_url)
                `)
                .eq('seeker_id', user.id)
                .order('created_at', { ascending: false });

            setSentApplications(txApps || []);

        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkStatus = async () => {
        if (!profile) return;
        setIsUpdatingStatus(true);
        const newStatus = !profile.is_looking_for_work;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_looking_for_work: newStatus })
                .eq('id', profile.id);

            if (error) throw error;
            setProfile({ ...profile, is_looking_for_work: newStatus });
        } catch (error) {
            alert('حدث خطأ أثناء تحديث الحالة');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const updateApplicationStatus = async (appId: string, newStatus: 'accepted' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', appId);

            if (error) throw error;

            setReceivedApplications(apps => apps.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('حدث خطأ أثناء تحديث الحالة');
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            month: 'short', day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#115d9a] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Welcome Banner */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#115d9a]"></div>
                    <div className="flex items-center gap-4 z-10">
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-blue-50 border-2 border-blue-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-8 w-8 text-[#115d9a]" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                                أهلاً بك، {profile?.full_name?.split(' ')[0] || 'يا صديقي'} 👋
                            </h1>
                            <p className="text-gray-500 mt-1">هذا هو موجز نشاطك اليوم في مسار.</p>
                        </div>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <Link href="/jobs/new" className="group bg-[#115d9a] p-1 rounded-3xl transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-900/20">
                        <div className="bg-[#115d9a] border-2 border-white/10 rounded-[1.4rem] p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-4 rounded-2xl"><Plus className="h-7 w-7" /></div>
                                <div>
                                    <h3 className="text-xl font-bold">إعلان عن وظيفة شاغرة</h3>
                                    <p className="text-blue-100/70 text-sm">ابحث عن الموظف المثالي لفريقك</p>
                                </div>
                            </div>
                            <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all -rotate-45" />
                        </div>
                    </Link>

                    <Link href="/talents/post" className="group bg-teal-600 p-1 rounded-3xl transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-teal-900/20">
                        <div className="bg-teal-600 border-2 border-white/10 rounded-[1.4rem] p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-4 rounded-2xl"><UserPlus className="h-7 w-7" /></div>
                                <div>
                                    <h3 className="text-xl font-bold">أبحث عن عمل</h3>
                                    <p className="text-teal-100/70 text-sm">انشر مهاراتك وسوّق لنفسك</p>
                                </div>
                            </div>
                            <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all -rotate-45" />
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Column 1: Seeker - Personal Ad & Sent Applications */}
                    <div className="lg:col-span-1 space-y-8">

                        {/* Seeker Ad Status */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-fit">
                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-teal-600" />
                                إعلاني الشخصي
                            </h3>

                            {profile?.job_title ? (
                                <div className="space-y-6">
                                    <div className={`p-4 rounded-2xl border transition-colors ${profile.is_looking_for_work ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${profile.is_looking_for_work ? 'bg-teal-500 text-white' : 'bg-gray-400 text-white'}`}>
                                                {profile.is_looking_for_work ? 'ظاهر للشركات' : 'مخفي حالياً'}
                                            </span>
                                            <button
                                                onClick={toggleWorkStatus}
                                                disabled={isUpdatingStatus}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {profile.is_looking_for_work ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-gray-900 line-clamp-1">{profile.job_title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{profile.category} • {profile.city}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Link href="/talents/post" className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-black transition-colors">
                                            <Edit3 className="h-4 w-4" /> تعديل البيانات
                                        </Link>
                                        <Link href={`/profile/${profile.id}`} className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                                            عرض ملفي
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-400 text-sm mb-4">لم تنشر ملفك كباحث عن عمل بعد.</p>
                                    <Link href="/talents/post" className="text-teal-600 font-bold text-sm hover:underline">ابدأ الآن واظهر للشركات</Link>
                                </div>
                            )}
                        </div>

                        {/* NEW: My Sent Applications */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <Send className="h-5 w-5 text-teal-600" />
                                    طلبات التقديم الخاصة بي
                                </h3>
                            </div>

                            {sentApplications.length > 0 ? (
                                <div className="space-y-4">
                                    {sentApplications.map((app) => (
                                        <div key={app.id} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-teal-100 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                                                    {app.job?.title || 'عنوان الوظيفة محذوف'}
                                                </h4>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {app.status === 'accepted' ? 'مقبول' :
                                                        app.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                <Building2Icon className="h-3 w-3" />
                                                <span className="truncate">{app.employer?.full_name || 'اسم الشركة'}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-2">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTimeAgo(app.created_at)}
                                                </span>
                                                <Link href={`/jobs/${app.job_id}`} className="text-teal-600 hover:underline font-bold">
                                                    عرض الوظيفة
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm">لم تقدم على أي وظيفة بعد.</p>
                                    <Link href="/jobs" className="text-teal-600 font-bold text-xs hover:underline mt-2 block">
                                        تصفح الوظائف المتاحة
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Column 2: Employer - Received Applications & Posted Jobs */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Received Applications */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-[#115d9a]" />
                                    طلبات التوظيف المستلمة ({receivedApplications.length})
                                </h3>
                            </div>

                            {receivedApplications.length > 0 ? (
                                <div className="space-y-4">
                                    {receivedApplications.map((app) => (
                                        <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                                                    {app.seeker?.avatar_url ? (
                                                        <img src={app.seeker.avatar_url} alt="Seeker" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-sm">{app.seeker?.full_name}</h4>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                                app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {app.status === 'accepted' ? 'مقبول' :
                                                                app.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        متقدم لوظيفة: <span className="text-[#115d9a] font-medium">{app.job?.title}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end md:self-auto">
                                                <Link
                                                    href={`/profile/${app.seeker?.id}`}
                                                    className="text-xs text-gray-500 hover:text-[#115d9a] underline px-2"
                                                >
                                                    عرض الملف
                                                </Link>

                                                {app.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateApplicationStatus(app.id, 'accepted')}
                                                            className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                            title="قبول"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                            title="رفض"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm">لا توجد طلبات توظيف جديدة حتى الآن.</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Posted Jobs */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-[#115d9a]" />
                                    وظائف قمت بنشرها
                                </h3>
                                <Link href="/my-jobs" className="text-sm text-[#115d9a] font-bold hover:underline flex items-center gap-1">
                                    إدارة الكل <ChevronLeft className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {recentJobs.length > 0 ? (
                                    recentJobs.map(job => (
                                        <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                                                    <Briefcase className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{job.title}</h4>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{job.city} • {job.category}</p>
                                                </div>
                                            </div>
                                            <Link href={`/jobs/${job.id}`} className="text-gray-300 hover:text-[#115d9a] p-1">
                                                <ArrowRight className="h-5 w-5 rotate-180" />
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <FileText className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                                        <p className="text-gray-400 text-sm italic">لا يوجد وظائف منشورة حالياً.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Icon for Company
function Building2Icon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4" />
            <path d="M10 10h4" />
            <path d="M10 14h4" />
            <path d="M10 18h4" />
        </svg>
    );
}