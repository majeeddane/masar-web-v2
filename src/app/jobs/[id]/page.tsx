'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
    MapPin, DollarSign, Clock, Building2,
    ArrowRight, Share2, Flag, Briefcase,
    User, Send, Loader2, AlertCircle, Link as LinkIcon, Phone, Mail, ExternalLink, MessageCircle, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Application State
    const [user, setUser] = useState<any>(null);
    const [hasApplied, setHasApplied] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchJobDetails();
            checkUserAndApplication();
        }
    }, [id]);

    const checkUserAndApplication = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
            // Check if already applied
            const { data } = await supabase
                .from('applications')
                .select('status')
                .eq('job_id', id)
                .eq('seeker_id', user.id)
                .single();

            if (data) {
                setHasApplied(true);
                setApplicationStatus(data.status);
            }
        }
    };

    const fetchJobDetails = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        full_name,
                        avatar_url,
                        job_title,
                        bio
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('الوظيفة غير موجودة');

            setJob(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'حدث خطأ أثناء تحميل تفاصيل الوظيفة');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!user) {
            router.push(`/login?redirect=/jobs/${id}`);
            return;
        }

        // Prevent applying to own job
        if (job.user_id === user.id) {
            alert('لا يمكنك التقديم على وظيفة قمت بنشرها!');
            return;
        }

        setIsApplying(true);
        try {
            const { error } = await supabase
                .from('applications')
                .insert({
                    job_id: id,
                    seeker_id: user.id,
                    employer_id: job.user_id,
                    status: 'pending'
                });

            if (error) throw error;

            setHasApplied(true);
            setApplicationStatus('pending');
            alert('تم إرسال طلبك بنجاح! 🎉');
        } catch (error: any) {
            console.error('Error applying:', error);
            alert('حدث خطأ أثناء التقديم. الرجاء المحاولة مرة أخرى.');
        } finally {
            setIsApplying(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("تم نسخ رابط الوظيفة");
    };

    const handleReport = () => {
        if (job) {
            window.location.href = `mailto:support@masar.com?subject=إبلاغ عن وظيفة: ${job.title}`;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#115d9a] animate-spin" />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">عذراً، حدث خطأ ما</h2>
                <p className="text-gray-600 mb-6">{error || 'لم نتمكن من العثور على الوظيفة المطلوبة'}</p>
                <Link href="/jobs" className="text-[#115d9a] hover:underline flex items-center gap-1">
                    <ArrowRight className="h-4 w-4" /> العودة للوظائف
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">

            {/* Navigation */}
            <div className="max-w-5xl mx-auto mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#115d9a] transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
                >
                    <ArrowRight className="h-5 w-5" />
                    <span>العودة للقائمة</span>
                </button>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content (2 cols) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Header Card */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-[#115d9a]"></div>

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Building2 className="h-4 w-4" />
                                        {job.profiles?.full_name}
                                    </span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {job.location}
                                    </span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {formatTimeAgo(job.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="bg-blue-50 text-[#115d9a] px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                {job.job_type === 'Full-time' ? 'دوام كامل' :
                                    job.job_type === 'Part-time' ? 'دوام جزئي' :
                                        job.job_type === 'Remote' ? 'عن بعد' :
                                            job.job_type === 'Freelance' ? 'عمل حر' : job.job_type}
                            </div>
                            {job.salary_range && (
                                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    {job.salary_range}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-4">تفاصيل الوظيفة</h2>
                        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                            {job.description}
                        </div>
                    </div>
                </div>

                {/* Sidebar (1 col) */}
                <div className="space-y-6">

                    {/* Apply Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-4">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">مهتم بهذه الوظيفة؟</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            {user?.id === job.user_id
                                ? "أنت صاحب هذه الوظيفة."
                                : hasApplied
                                    ? "لقد قمت بالتقديم على هذه الوظيفة بالفعل. حظاً موفقاً!"
                                    : job.application_link
                                        ? "يمكنك التقديم مباشرة عبر الموقع الخارجي للشركة."
                                        : "اضغط على الزر أدناه لتقديم طلبك مباشرة لصاحب العمل."}
                        </p>

                        {/* Apply Button Logic */}
                        {user?.id === job.user_id ? (
                            <div className="w-full bg-gray-100 text-gray-500 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold mb-4 cursor-not-allowed">
                                <User className="h-5 w-5" />
                                <span>هذه وظيفتك</span>
                            </div>
                        ) : hasApplied ? (
                            <div className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold mb-4 cursor-default border ${applicationStatus === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                                    applicationStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-blue-50 text-[#115d9a] border-blue-200'
                                }`}>
                                <CheckCircle2 className="h-5 w-5" />
                                <span>
                                    {applicationStatus === 'accepted' ? 'تم قبول طلبك! 🎉' :
                                        applicationStatus === 'rejected' ? 'نعتذر، لم يتم القبول' :
                                            'تم التقديم بنجاح'}
                                </span>
                            </div>
                        ) : job.application_link ? (
                            <a
                                href={job.application_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#115d9a] hover:bg-[#0e4d82] text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-900/10 transition-all mb-4"
                            >
                                <ExternalLink className="h-5 w-5" />
                                <span>التقديم عبر الموقع</span>
                            </a>
                        ) : (
                            <button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="w-full bg-[#115d9a] hover:bg-[#0e4d82] disabled:opacity-70 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-900/10 transition-all mb-4"
                            >
                                {isApplying ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5 -rotate-45" />
                                )}
                                <span>{isApplying ? 'جاري التقديم...' : 'قدّم على الوظيفة الآن'}</span>
                            </button>
                        )}

                        {/* Inquiry Button (Only show if not own job) */}
                        {user?.id !== job.user_id && (
                            <Link
                                href={`/messages?user_id=${job.profiles?.id}`}
                                className="w-full bg-white border border-[#115d9a] text-[#115d9a] py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all mb-4 hover:bg-blue-50"
                            >
                                <MessageCircle className="h-5 w-5" />
                                <span>استفسار عن الوظيفة</span>
                            </Link>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={handleShare}
                                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Share2 className="h-4 w-4" /> مشاركة
                            </button>
                            <button
                                onClick={handleReport}
                                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Flag className="h-4 w-4" /> إبلاغ
                            </button>
                        </div>
                    </div>

                    {/* Employer Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider text-gray-500">عن صاحب العمل</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                {job.profiles?.avatar_url ? (
                                    <img src={job.profiles.avatar_url} alt="Employer" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-8 h-8 m-auto mt-4 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-1">
                                    {job.profiles?.full_name}
                                </h4>
                                <p className="text-sm text-gray-500">{job.profiles?.job_title || 'صاحب عمل'}</p>
                            </div>
                        </div>

                        {job.profiles?.bio && (
                            <p className="text-sm text-gray-600 line-clamp-3 mb-4 bg-gray-50 p-3 rounded-lg">
                                {job.profiles.bio}
                            </p>
                        )}

                        <Link
                            href={`/profile/${job.profiles?.id}`}
                            className="text-[#115d9a] text-sm font-medium hover:underline flex items-center gap-1"
                        >
                            عرض الملف الشخصي <ArrowRight className="h-3 w-3 rotate-180" />
                        </Link>
                    </div>

                    {/* Contact Info (Only if exists) */}
                    {(job.contact_phone || job.contact_email) && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider text-gray-500">معلومات التواصل</h3>
                            <div className="space-y-3">
                                {job.contact_phone && (
                                    <a href={`tel:${job.contact_phone}`} className="flex items-center gap-3 text-gray-700 hover:text-[#115d9a] transition-colors p-2 hover:bg-gray-50 rounded-lg">
                                        <div className="bg-blue-50 p-2 rounded-full text-[#115d9a]">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium dir-ltr text-right">{job.contact_phone}</span>
                                    </a>
                                )}
                                {job.contact_email && (
                                    <a href={`mailto:${job.contact_email}`} className="flex items-center gap-3 text-gray-700 hover:text-[#115d9a] transition-colors p-2 hover:bg-gray-50 rounded-lg">
                                        <div className="bg-blue-50 p-2 rounded-full text-[#115d9a]">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium truncate">{job.contact_email}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}