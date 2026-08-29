'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, MapPin, Clock, Loader2, Search, Building2, ChevronLeft, Plus, Briefcase, DollarSign, Phone, Mail, ExternalLink } from 'lucide-react';

const CATEGORY_EMOJI: { [key: string]: string } = {
    'برمجة': '👨‍💻', 'تصميم مواقع': '🌐', 'كمبيوتر وشبكات': '💻', 'تصميم': '🖌️',
    'مبيعات وتسويق': '📈', 'إدارة': '💼', 'حسابات': '🔢', 'خدمة الزبائن': '🎧',
    'موارد بشرية': '📋', 'علاقات عامة': '📣', 'مدخل بيانات': '⌨️', 'سكرتارية': '📠',
    'مترجمين': '🗣️', 'محررين': '✍️', 'مهندس': '👷', 'تقني': '🔧',
    'تعليم وتدريس': '🎓', 'طب وتمريض': '🩺', 'محاماة وقانون': '⚖️',
    'سياحة وفنادق': '🏨', 'سياحة ومطاعم': '🍽️', 'سائق': '🚗',
    'حراسة وأمن': '👮', 'عمال دليفري': '🛵', 'فنون جميلة': '🎨',
    'أزياء': '👗', 'لياقة بدنية': '💪', 'موظفين': '👔', 'تقنيين تكييف وتبريد': '❄️',
    'مونتاج وإخراج': '🎬',
};

export default function JobsCityFeedPage() {
    const params = useParams();
    const router = useRouter();
    const cityName = decodeURIComponent(params.city as string);

    const [mounted, setMounted] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState<string[]>([]);

    const supabase = getSupabaseBrowserClient();

    useEffect(() => {
        setMounted(true);
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });

                if (data) {
                    // Filter by city - match city name inside the city field
                    const matched = data.filter(j => {
                        const jCity = (j.city || '').trim();
                        const jLoc = (j.location || '').trim();
                        return jCity.includes(cityName) || jLoc.includes(cityName) ||
                            cityName.includes(jCity);
                    });
                    setJobs(matched);

                    // Extract unique categories
                    const cats = [...new Set(matched.map(j => j.category).filter(Boolean))];
                    setCategories(cats);
                }
            } finally {
                setLoading(false);
            }
        };
        if (cityName) fetchJobs();
    }, [cityName, supabase]);

    const filtered = jobs.filter(j => {
        const matchSearch = !search.trim() ||
            (j.title && j.title.toLowerCase().includes(search.toLowerCase())) ||
            (j.company_name && j.company_name.toLowerCase().includes(search.toLowerCase()));
        const matchCat = !selectedCategory || j.category === selectedCategory;
        return matchSearch && matchCat;
    });

    if (!mounted) return <div className="min-h-screen bg-slate-50" />;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#022c22] via-[#04452e] to-[#022c22] text-white pt-10 pb-36 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #059669 0%, transparent 40%)' }}
                />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 flex-shrink-0"
                            >
                                <ArrowRight className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold mb-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>وظائف في {cityName}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                    فرص العمل في <span className="text-emerald-400">{cityName}</span>
                                </h1>
                                <p className="text-emerald-300 text-sm font-bold mt-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    {filtered.length} فرصة متاحة الآن
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/post/job"
                            className="bg-emerald-500 hover:bg-emerald-400 text-white py-4 px-8 rounded-2xl font-black shadow-xl transition-all flex items-center gap-3 active:scale-95 border border-emerald-400/20 self-start md:self-auto"
                        >
                            <Plus className="w-5 h-5" />
                            <span>أضف وظيفة</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Search + Category Filter */}
            <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
                <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl mb-8 border border-slate-100 flex flex-col md:flex-row gap-3">
                    <div className="flex-1 flex items-center bg-slate-50 rounded-2xl px-5 border-2 border-transparent focus-within:border-emerald-200">
                        <Search className="w-5 h-5 text-slate-400 ml-3" />
                        <input
                            type="text"
                            placeholder={`ابحث في وظائف ${cityName}...`}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            suppressHydrationWarning
                            className="w-full py-4 bg-transparent outline-none text-slate-700 font-bold"
                        />
                    </div>
                    {categories.length > 0 && (
                        <div className="md:w-1/3 flex items-center bg-slate-50 rounded-2xl px-5 border-2 border-transparent focus-within:border-emerald-200">
                            <Briefcase className="w-5 h-5 text-emerald-500 ml-3" />
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="w-full py-4 bg-transparent outline-none text-slate-700 font-black appearance-none cursor-pointer"
                            >
                                <option value="">جميع التخصصات</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-slate-400 font-bold">جاري تحميل وظائف {cityName}...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(job => (
                            <Link
                                key={job.id}
                                href={`/jobs/view/${job.id}`}
                                className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all duration-400 flex flex-col"
                            >
                                {/* Company & Date */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
                                        {CATEGORY_EMOJI[job.category] || '💼'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-sm font-black text-slate-900 truncate">
                                            {job.company_name || 'جهة توظيف'}
                                        </span>
                                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {new Date(job.created_at).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>
                                    {job.category && (
                                        <span className="text-xs font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl flex-shrink-0">
                                            {job.category}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-black text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                                    {job.title}
                                </h3>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.city && (
                                        <span className="flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg">
                                            <MapPin className="w-3 h-3" /> {job.city}
                                        </span>
                                    )}
                                    {(job.job_type || job.type) && (
                                        <span className="flex items-center gap-1 text-xs font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg">
                                            <Briefcase className="w-3 h-3" /> {job.job_type || job.type}
                                        </span>
                                    )}
                                    {job.salary_range && (
                                        <span className="flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                                            <DollarSign className="w-3 h-3" /> {job.salary_range}
                                        </span>
                                    )}
                                </div>

                                {/* Contact Row */}
                                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {(job.phone || job.phone_number) && (
                                            <span className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                                                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                                {job.phone || job.phone_number}
                                            </span>
                                        )}
                                        {(job.email || job.contact_email) && !job.phone && !job.phone_number && (
                                            <span className="flex items-center gap-1 text-xs text-slate-500 font-bold truncate max-w-[150px]">
                                                <Mail className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                                <span className="truncate">{job.email || job.contact_email}</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs">
                                        <span>تفاصيل</span>
                                        <ChevronLeft className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPin className="w-10 h-10 text-emerald-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">لا توجد وظائف في {cityName} حالياً</h3>
                        <p className="text-slate-400 font-bold mb-6">سيتم إضافة وظائف جديدة قريباً لهذه المدينة</p>
                        <Link href="/jobs/cities" className="bg-emerald-500 hover:bg-emerald-400 text-white font-black px-6 py-3 rounded-2xl transition-all">
                            استعرض مدن أخرى
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
