'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import {
    Briefcase, MapPin, DollarSign, Clock,
    Trash2, Plus, Loader2, ArrowRight, Pencil, Building2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyJobsDashboardPage() {
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchMyJobs = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error('Error fetching my jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const handleDelete = async (jobId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الوظيفة؟')) {
            return;
        }

        setDeletingId(jobId);
        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', jobId);

            if (error) throw error;
            setJobs(jobs.filter(job => job.id !== jobId));
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('حدث خطأ أثناء حذف الوظيفة');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 font-sans" dir="rtl">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">وظائفي المنشورة</h1>
                        <p className="text-slate-500 font-medium mt-1">إدارة ومتابعة الوظائف التي قمت بنشرها على مسار.</p>
                    </div>
                    <Link href="/post/job" className="bg-[#115d9a] hover:bg-[#0e4d82] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
                        <Plus className="w-5 h-5" /> نشر وظيفة جديدة
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-44"></div>
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-black text-lg text-slate-900 line-clamp-1">
                                            {job.title}
                                        </h3>
                                        <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">
                                            نشط
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            <span>{job.company || job.company_name || 'جهة غير محددة'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span>{job.city || job.location || 'غير محدد'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>تم النشر: {new Date(job.created_at).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                    <Link
                                        href={`/jobs/view/${job.id}`}
                                        className="text-[#115d9a] font-bold text-sm flex items-center gap-1 hover:underline"
                                    >
                                        عرض الإعلان <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                    </Link>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/jobs/edit/${job.id}`}
                                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors text-sm font-bold flex items-center gap-1"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            <span>تعديل</span>
                                        </Link>
                                        <button
                                            onClick={(e) => handleDelete(job.id, e)}
                                            disabled={deletingId === job.id}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors flex items-center gap-1 text-sm font-bold"
                                        >
                                            {deletingId === job.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            <span>حذف</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 text-[#115d9a] rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">لم تقم بنشر أي وظائف بعد</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto text-base font-medium">ابدأ بنشر وظيفتك الأولى الآن لتصل إلى آلاف الكفاءات في السعودية.</p>
                        <Link href="/post/job" className="inline-flex items-center gap-2 bg-[#115d9a] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#0e4d82] transition-all">
                            <Plus className="w-5 h-5" /> نشر وظيفة جديدة
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}