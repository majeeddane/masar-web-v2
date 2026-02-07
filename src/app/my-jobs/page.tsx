'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
    Briefcase, MapPin, DollarSign, Clock,
    Trash2, Plus, Loader2, AlertCircle, ArrowRight, Pencil
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyJobsPage() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Redirect if not logged in
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

    const handleDelete = async (jobId: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent linking if the delete button is inside a Link
        e.stopPropagation();

        if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الوظيفة؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return;
        }

        setDeletingId(jobId);
        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', jobId);

            if (error) throw error;

            // Remove from UI
            setJobs(jobs.filter(job => job.id !== jobId));
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('حدث خطأ أثناء حذف الوظيفة');
        } finally {
            setDeletingId(null);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">

            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="h-7 w-7 text-[#115d9a]" />
                                وظائفي
                            </h1>
                            <p className="text-gray-500 mt-1 mr-9">إدارة الوظائف التي قمت بنشرها</p>
                        </div>

                        <Link href="/jobs/new" className="hidden sm:flex bg-[#115d9a] hover:bg-[#0e4d82] text-white px-5 py-2.5 rounded-xl font-medium items-center gap-2 transition-colors shadow-sm">
                            <Plus className="h-5 w-5" />
                            <span>نشر وظيفة جديدة</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {loading ? (
                    /* Loading Skeleton */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse h-40"></div>
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    /* Job List */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between"
                            >
                                <div className="absolute top-0 right-0 w-1 h-full bg-[#115d9a] opacity-50"></div>

                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                                                {job.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>تم النشر في {formatTimeAgo(job.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Status Badge (Optional) */}
                                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-lg font-medium">
                                            نشط
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span className="truncate">{job.location || 'غير محدد'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                            <span className="truncate">{job.salary_range || 'الراتب غير محدد'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                    <Link
                                        href={`/jobs/${job.id}`}
                                        className="text-[#115d9a] font-medium text-sm flex items-center gap-1 hover:underline"
                                    >
                                        عرض التفاصيل <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                                    </Link>

                                    {/* Action Buttons: Edit and Delete */}
                                    <div className="flex items-center gap-2">
                                        {/* Edit Button */}
                                        <Link
                                            href={`/jobs/edit/${job.id}`}
                                            className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            <span>تعديل</span>
                                        </Link>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDelete(job.id, e)}
                                            disabled={deletingId === job.id}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                                        >
                                            {deletingId === job.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                            <span>حذف</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 border-dashed">
                        <div className="bg-blue-50 p-6 rounded-full mb-6">
                            <Briefcase className="h-10 w-10 text-[#115d9a]" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">لم تقم بنشر أي وظائف بعد</h2>
                        <p className="text-gray-500 max-w-md mb-8">
                            ابدأ بنشر وظيفتك الأولى واجذب أفضل الكفاءات لفريقك.
                        </p>
                        <Link
                            href="/jobs/new"
                            className="bg-[#115d9a] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0e4d82] transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            نشر وظيفة جديدة
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}
