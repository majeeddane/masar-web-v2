'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
    Briefcase, MapPin, DollarSign, Clock, Search,
    Plus, Building2, Link as LinkIcon, ArrowRight, Loader2, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CategoryBar from '@/components/CategoryBar';
import { SAUDI_CITIES } from '@/lib/constants';

export default function JobsPage() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('الكل');
    const [selectedCity, setSelectedCity] = useState('الكل'); // Added City State

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select(`
                    *,
                    profiles:user_id (
                        full_name,
                        avatar_url,
                        job_title
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'منذ لحظات';
        if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
        if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
        return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    };

    // Filter jobs based on search AND category AND city
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = (
            job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesCategory = selectedCategory === 'الكل' || job.category === selectedCategory;
        const matchesCity = selectedCity === 'الكل' || job.location === selectedCity || job.city === selectedCity;

        return matchesSearch && matchesCategory && matchesCity;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">

            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="h-7 w-7 text-[#115d9a]" />
                                وظائف مسار
                            </h1>
                            <p className="text-gray-500 mt-1 mr-9">اكتشف أحدث الفرص الوظيفية أو انشر وظيفتك</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/jobs/new" className="bg-[#115d9a] hover:bg-[#0e4d82] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm focus:ring-4 focus:ring-blue-500/20">
                                <Plus className="h-5 w-5" />
                                <span>نشر وظيفة</span>
                            </Link>
                        </div>
                    </div>

                    {/* Search & Filter Row */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* Search Input */}
                        <div className="relative flex-grow group">
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#115d9a] transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="ابحث عن مسمى وظيفي أو شركة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pr-12 pl-6 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-[#115d9a] outline-none transition-all text-gray-900"
                            />
                        </div>

                        {/* City Filter */}
                        <div className="relative w-full md:w-64 group">
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-10">
                                <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-[#115d9a] transition-colors" />
                            </div>
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full h-14 pr-12 pl-10 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-[#115d9a] outline-none transition-all text-gray-900 appearance-none font-bold cursor-pointer"
                            >
                                {SAUDI_CITIES.map((city) => (
                                    <option key={city} value={city}>{city === 'الكل' ? 'جميع المدن' : city}</option>
                                ))}
                            </select>
                            {/* Custom Arrow */}
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Categories Bar */}
                    <div className="pb-2">
                        <CategoryBar
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    </div>

                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {loading ? (
                    /* Loading Skeleton */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
                                <div className="flex gap-4 mb-4">
                                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredJobs.length > 0 ? (
                    /* Job List */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <Link
                                href={`/jobs/${job.id}`}
                                key={job.id}
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#115d9a]/20 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-1.5 h-full bg-[#115d9a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                {/* Category Badge */}
                                {job.category && (
                                    <span className="absolute top-4 left-4 bg-gray-50 text-gray-500 text-[10px] px-2.5 py-1 rounded-full border border-gray-200 font-medium">
                                        {job.category}
                                    </span>
                                )}

                                <div className="flex items-start gap-4 mb-4 pt-1">
                                    {/* Company Avatar */}
                                    <div className="h-14 w-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                        {job.profiles?.avatar_url ? (
                                            <img src={job.profiles.avatar_url} alt={job.profiles.full_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Building2 className="h-7 w-7 text-gray-400" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#115d9a] transition-colors truncate">
                                            {job.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 truncate mt-0.5">
                                            {job.profiles?.full_name || 'شركة غير معروفة'}
                                        </p>
                                    </div>
                                </div>

                                {/* Job Type Badge */}
                                <div className="mb-4">
                                    {job.job_type && (
                                        <span className={`
                                            text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg border
                                            ${job.job_type === 'Full-time' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                job.job_type === 'Part-time' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                    job.job_type === 'Remote' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        'bg-gray-50 text-gray-700 border-gray-100'}
                                        `}>
                                            {job.job_type === 'Full-time' ? 'دوام كامل' :
                                                job.job_type === 'Part-time' ? 'دوام جزئي' :
                                                    job.job_type === 'Remote' ? 'عن بعد' :
                                                        job.job_type === 'Freelance' ? 'عمل حر' : job.job_type}
                                        </span>
                                    )}
                                </div>

                                {/* Job Details */}
                                <div className="space-y-2.5 mb-5 opacity-80">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span className="truncate">{job.location || 'غير محدد'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                        <span className="truncate">{job.salary_range || 'الراتب غير محدد'}</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs text-gray-400 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{formatTimeAgo(job.created_at)}</span>
                                    </div>
                                    <span className="flex items-center gap-1 text-[#115d9a] group-hover:translate-x-[-4px] transition-transform">
                                        عرض التفاصيل <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Empty State - Improved */
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                        <div className="bg-blue-50 p-6 rounded-3xl mb-6 shadow-sm">
                            <Briefcase className="h-16 w-16 text-[#115d9a] opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">لا توجد نتائج مطابقة</h2>
                        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                            {selectedCategory !== 'الكل' || selectedCity !== 'الكل'
                                ? `لم نجد أي وظائف تطابق الفلاتر المختارة حالياً.`
                                : 'جرب البحث بكلمات مختلفة أو عد لاحقاً لمشاهدة فرص جديدة.'
                            }
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/jobs/new"
                                className="bg-[#115d9a] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#0e4d82] transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                            >
                                <Plus className="h-5 w-5" />
                                نشر وظيفة جديدة
                            </Link>

                            {(selectedCategory !== 'الكل' || selectedCity !== 'الكل') && (
                                <button
                                    onClick={() => { setSelectedCategory('الكل'); setSelectedCity('الكل'); setSearchQuery(''); }}
                                    className="px-8 py-3.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    إعادة تعيين الفلاتر
                                </button>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}