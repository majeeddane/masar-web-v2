'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import {
    Briefcase, MapPin, DollarSign, Clock,
    Trash2, Plus, Loader2, ArrowRight, Eye, Pencil,
    Building2, User, Search, Layers, CheckCircle2,
    Phone, Mail, FileText, Sparkles, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface UnifiedAd {
    id: string;
    type: 'job' | 'talent';
    typeLabel: string;
    title: string;
    subtitle?: string;
    category?: string;
    city?: string;
    salary?: string | null;
    job_type?: string | null;
    phone?: string | null;
    email?: string | null;
    cv_url?: string | null;
    is_active: boolean;
    created_at: string;
    viewUrl: string;
    editUrl?: string | null;
}

export default function MyAdsDashboardPage() {
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    const [ads, setAds] = useState<UnifiedAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'job' | 'talent'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchMyAds = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login?next=/dashboard/my-jobs');
                return;
            }

            // 1. Fetch published Jobs created by this user
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('*')
                .or(`user_id.eq.${user.id},created_by.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (jobsError) console.error('Error fetching my jobs:', jobsError);

            // 2. Fetch published Talent / Job Seeker posts by this user
            const { data: talentsData, error: talentsError } = await supabase
                .from('talent_posts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (talentsError) console.error('Error fetching my talent posts:', talentsError);

            const unifiedList: UnifiedAd[] = [];

            // Map Jobs
            if (jobsData) {
                jobsData.forEach((job: any) => {
                    const salaryStr = job.salary_range || (job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max} ر.س` : (job.salary_min ? `من ${job.salary_min} ر.س` : null));
                    unifiedList.push({
                        id: job.id,
                        type: 'job',
                        typeLabel: 'وظيفة شاغرة',
                        title: job.title || 'وظيفة بدون عنوان',
                        subtitle: job.company || job.company_name || 'جهة غير محددة',
                        category: job.category || 'عام',
                        city: job.city || job.location || 'غير محدد',
                        salary: salaryStr,
                        job_type: job.job_type || job.type || 'دوام كامل',
                        phone: job.phone_number || job.contact_phone || null,
                        email: job.contact_email || null,
                        is_active: job.is_active !== false,
                        created_at: job.created_at,
                        viewUrl: `/jobs/view/${job.id}`,
                        editUrl: `/jobs/edit/${job.id}`
                    });
                });
            }

            // Map Talent / Job-Seeker Posts
            if (talentsData) {
                talentsData.forEach((post: any) => {
                    unifiedList.push({
                        id: post.id,
                        type: 'talent',
                        typeLabel: 'أبحث عن عمل',
                        title: post.post_title || post.title || 'طلب عمل / سيرة ذاتية',
                        subtitle: post.content ? (post.content.slice(0, 120) + (post.content.length > 120 ? '...' : '')) : 'ملف باحث عن عمل',
                        category: post.category || 'عام',
                        city: post.city || 'غير محدد',
                        salary: null,
                        job_type: null,
                        phone: post.phone_number || null,
                        email: post.contact_email || null,
                        cv_url: post.cv_url || null,
                        is_active: true,
                        created_at: post.created_at,
                        viewUrl: `/talents/view/${post.id}`,
                        editUrl: null
                    });
                });
            }

            // Sort all by created_at descending
            unifiedList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setAds(unifiedList);
        } catch (error) {
            console.error('Error fetching my ads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyAds();
    }, []);

    const handleDelete = async (ad: UnifiedAd, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const adTypeName = ad.type === 'job' ? 'هذه الوظيفة الشاغرة' : 'إعلان البحث عن عمل';
        if (!window.confirm(`هل أنت متأكد من رغبتك في حذف ${adTypeName}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            return;
        }

        setDeletingId(ad.id);
        try {
            const table = ad.type === 'job' ? 'jobs' : 'talent_posts';
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', ad.id);

            if (error) throw error;
            setAds(prev => prev.filter(item => item.id !== ad.id));
        } catch (error: any) {
            console.error('Error deleting ad:', error);
            alert(`حدث خطأ أثناء الحذف: ${error.message || 'يرجى المحاولة لاحقاً'}`);
        } finally {
            setDeletingId(null);
        }
    };

    // Filter by type and search term
    const filteredAds = ads.filter(ad => {
        const matchesType = filterType === 'all' || ad.type === filterType;
        const matchesSearch = !searchTerm.trim() ||
            ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ad.subtitle && ad.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (ad.category && ad.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (ad.city && ad.city.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesType && matchesSearch;
    });

    const jobCount = ads.filter(a => a.type === 'job').length;
    const talentCount = ads.filter(a => a.type === 'talent').length;

    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-16 px-4 font-sans text-slate-900" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-[#115d9a] px-3.5 py-1 rounded-full text-xs font-bold mb-3 border border-blue-100/60">
                            <Layers className="w-3.5 h-3.5" /> لوحة إدارة الإعلانات
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">إعلاناتي المنشورة</h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base">
                            إدارة ومتابعة جميع إعلاناتك على منصة مسار (الوظائف الشاغرة وطلبات البحث عن عمل).
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/post"
                            className="bg-[#115d9a] hover:bg-[#0e4d82] text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            <span>إضافة إعلان جديد</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Stats & Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* All Ads Tab Button */}
                    <button
                        onClick={() => setFilterType('all')}
                        className={`p-5 rounded-2xl border text-right transition-all flex items-center justify-between ${filterType === 'all' ? 'bg-[#115d9a] text-white border-[#115d9a] shadow-md shadow-blue-900/10' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
                    >
                        <div>
                            <p className={`text-xs font-bold mb-1 ${filterType === 'all' ? 'text-blue-100' : 'text-slate-400'}`}>جميع الإعلانات</p>
                            <p className="text-2xl font-black">{ads.length}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${filterType === 'all' ? 'bg-white/10 text-white' : 'bg-blue-50 text-[#115d9a]'}`}>
                            <Layers className="w-6 h-6" />
                        </div>
                    </button>

                    {/* Jobs Tab Button */}
                    <button
                        onClick={() => setFilterType('job')}
                        className={`p-5 rounded-2xl border text-right transition-all flex items-center justify-between ${filterType === 'job' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/10' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
                    >
                        <div>
                            <p className={`text-xs font-bold mb-1 ${filterType === 'job' ? 'text-emerald-100' : 'text-slate-400'}`}>وظائف شاغرة معلنة</p>
                            <p className="text-2xl font-black">{jobCount}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${filterType === 'job' ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                            <Briefcase className="w-6 h-6" />
                        </div>
                    </button>

                    {/* Talent Posts Tab Button */}
                    <button
                        onClick={() => setFilterType('talent')}
                        className={`p-5 rounded-2xl border text-right transition-all flex items-center justify-between ${filterType === 'talent' ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-900/10' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
                    >
                        <div>
                            <p className={`text-xs font-bold mb-1 ${filterType === 'talent' ? 'text-purple-100' : 'text-slate-400'}`}>طلبات أبحث عن عمل</p>
                            <p className="text-2xl font-black">{talentCount}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${filterType === 'talent' ? 'bg-white/10 text-white' : 'bg-purple-50 text-purple-600'}`}>
                            <User className="w-6 h-6" />
                        </div>
                    </button>
                </div>

                {/* 3. Search & Filter Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
                        <input
                            type="text"
                            placeholder="ابحث في إعلاناتك..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                        <span>عرض {filteredAds.length} من أصل {ads.length} إعلان</span>
                    </div>
                </div>

                {/* 4. Ads List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-56"></div>
                        ))}
                    </div>
                ) : filteredAds.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredAds.map((ad) => (
                            <div
                                key={ad.id}
                                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group hover:border-blue-300 relative overflow-hidden"
                            >
                                {/* Top Accent Stripe */}
                                <div className={`absolute top-0 left-0 right-0 h-1.5 ${ad.type === 'job' ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>

                                <div>
                                    {/* Badges Row */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-3 py-1 rounded-full font-black flex items-center gap-1.5 shadow-sm ${ad.type === 'job' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                                                {ad.type === 'job' ? <Briefcase className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                                {ad.typeLabel}
                                            </span>
                                            {ad.category && (
                                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                                                    {ad.category}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-50 text-green-700 border border-green-200">
                                            نشط
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-black text-xl text-slate-900 mb-2 group-hover:text-[#115d9a] transition-colors line-clamp-1">
                                        {ad.title}
                                    </h3>

                                    {/* Subtitle / Details */}
                                    <p className="text-slate-500 text-sm font-medium mb-4 line-clamp-2 leading-relaxed">
                                        {ad.subtitle}
                                    </p>

                                    {/* Meta tags */}
                                    <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-500 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        {ad.city && (
                                            <div className="flex items-center gap-1.5 truncate">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="truncate">{ad.city}</span>
                                            </div>
                                        )}
                                        {ad.salary && (
                                            <div className="flex items-center gap-1.5 truncate text-emerald-700">
                                                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{ad.salary}</span>
                                            </div>
                                        )}
                                        {ad.phone && (
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="truncate" dir="ltr">{ad.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 truncate text-slate-400">
                                            <Clock className="w-3.5 h-3.5 shrink-0" />
                                            <span>{new Date(ad.created_at).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Row */}
                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-auto">
                                    <Link
                                        href={ad.viewUrl}
                                        className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-[#115d9a] text-slate-700 hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>عرض الإعلان</span>
                                    </Link>

                                    {ad.editUrl && (
                                        <Link
                                            href={ad.editUrl}
                                            className="p-2.5 bg-blue-50 text-[#115d9a] hover:bg-blue-100 rounded-xl transition-colors"
                                            title="تعديل الإعلان"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                    )}

                                    <button
                                        onClick={(e) => handleDelete(ad, e)}
                                        disabled={deletingId === ad.id}
                                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                                        title="حذف الإعلان"
                                    >
                                        {deletingId === ad.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* 5. Empty State */
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed max-w-2xl mx-auto space-y-6 shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 text-[#115d9a] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                            <Layers className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">
                                {searchTerm ? 'لا توجد إعلانات مطابقة للبحث' : 'لم تقم بنشر أي إعلانات حتى الآن'}
                            </h3>
                            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                                {searchTerm
                                    ? 'جرب البحث بكلمات أخرى أو اختر تبويباً مختلفاً.'
                                    : 'انشر وظيفتك الشاغرة لجذب الكفاءات، أو اعرض سيرتك الذاتية ومهاراتك لتصل إلى أصحاب العمل.'}
                            </p>
                        </div>

                        {!searchTerm && (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                                <Link
                                    href="/post/job"
                                    className="w-full sm:w-auto py-3.5 px-6 bg-[#115d9a] hover:bg-[#0e4d82] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 transition-all"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    <span>نشر وظيفة شاغرة</span>
                                </Link>
                                <Link
                                    href="/talents/post"
                                    className="w-full sm:w-auto py-3.5 px-6 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-2xl font-bold border border-purple-200 flex items-center justify-center gap-2 transition-all"
                                >
                                    <User className="w-4 h-4" />
                                    <span>نشر طلب أبحث عن عمل</span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}