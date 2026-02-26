'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowRight, MapPin, Clock, Loader2, Search, Building2, ChevronLeft, Plus
} from 'lucide-react';
import { SAUDI_CITIES } from '@/lib/constants';

export default function JobCategoryFeed() {
    const params = useParams();
    const router = useRouter();
    const categoryName = decodeURIComponent(params.category as string);

    const [mounted, setMounted] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        setMounted(true);

        const fetchJobs = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('jobs')
                .select(`*, profiles:user_id (full_name, avatar_url, city)`)
                .or(`category.ilike.%${categoryName}%,title.ilike.%${categoryName}%`)
                .order('created_at', { ascending: false });

            if (!error) {
                setJobs(data || []);
            }
            setLoading(false);
        };

        if (categoryName) fetchJobs();
    }, [categoryName, supabase]);

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title?.toLowerCase().includes(search.toLowerCase());
        const matchesCity = selectedCity === '' || job.city === selectedCity || job.location === selectedCity;
        return matchesSearch && matchesCity;
    });

    if (!mounted) return <div className="min-h-screen bg-gray-50" />;

    return (
        // ✅ إضافة pt-28 لمنع التداخل مع Navbar العلوي
        <div className="min-h-screen bg-gray-50 font-sans pb-12 pt-28" dir="rtl">

            {/* Header القسم - زيادة الـ py-16 ليعطي مساحة كافية للنصوص */}
            <div className="bg-[#1e293b] text-white py-16 relative overflow-hidden shadow-lg border-b-4 border-emerald-500 rounded-[2.5rem] mx-4">
                <div className="absolute inset-0 bg-gradient-to-r from-[#115d9a] to-[#01261d] opacity-95"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-right">
                            <button
                                onClick={() => router.back()}
                                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10"
                            >
                                <ArrowRight className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">وظائف {categoryName}</h1>
                                <p className="text-emerald-300 text-sm font-bold mt-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                    {filteredJobs.length} فرصة متاحة حالياً
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/jobs/new"
                            className="bg-emerald-500 hover:bg-emerald-400 text-white py-4 px-10 rounded-[1.5rem] font-black shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 border border-emerald-400/20"
                        >
                            <Plus className="w-6 h-6" />
                            <span>أضف وظيفة شاغرة</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 -mt-10 relative z-20">

                {/* شريط البحث والفلترة */}
                <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl mb-10 max-w-5xl mx-auto border border-slate-100 flex flex-col md:flex-row gap-3">
                    <div className="flex-1 flex items-center bg-slate-50 rounded-2xl px-5 border-2 border-transparent focus-within:border-emerald-200 transition-all">
                        <Search className="w-5 h-5 text-slate-400 ml-3" />
                        <input
                            type="text"
                            placeholder={`ابحث في نتائج ${categoryName}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            suppressHydrationWarning
                            className="w-full py-4 bg-transparent outline-none text-slate-700 font-bold"
                        />
                    </div>
                    <div className="md:w-1/3 flex items-center bg-slate-50 rounded-2xl px-5 border-2 border-transparent focus-within:border-emerald-200 transition-all relative">
                        <MapPin className="w-5 h-5 text-emerald-500 ml-3" />
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full py-4 bg-transparent outline-none text-slate-700 font-black appearance-none cursor-pointer"
                        >
                            <option value="">جميع المدن</option>
                            {SAUDI_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                </div>

                {/* عرض النتائج */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-slate-400 font-bold">جاري تحميل الوظائف...</p>
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredJobs.map((job) => (
                            <Link
                                key={job.id}
                                href={`/jobs/view/${job.id}`}
                                className="group bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 flex flex-col h-full animate-in fade-in zoom-in-95"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                                        {job.profiles?.avatar_url ? <img src={job.profiles.avatar_url} className="w-full h-full object-cover" alt="" /> : <Building2 className="w-7 h-7 text-slate-300" />}
                                    </div>
                                    <div>
                                        <span className="block text-sm font-black text-slate-900 truncate">{job.profiles?.full_name}</span>
                                        <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-0.5"><Clock className="w-3.5 h-3.5" /> {new Date(job.created_at).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-4 line-clamp-2 leading-snug">{job.title}</h3>
                                <div className="pt-5 border-t border-slate-50 flex items-center justify-between mt-auto">
                                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-black"><MapPin className="w-3.5 h-3.5" /> {job.city || job.location}</span>
                                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[3rem] shadow-xl border border-slate-100 max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Search className="w-10 h-10 text-slate-200" /></div>
                        <h3 className="text-2xl font-black text-slate-900">لا توجد نتائج</h3>
                        <p className="text-slate-400 mt-2 font-bold px-10">لم نعثر على وظائف حالياً في هذا القسم.</p>
                    </div>
                )}
            </div>
        </div>
    );
}