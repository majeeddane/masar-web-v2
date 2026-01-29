'use client';

import { Search, MapPin } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [city, setCity] = useState(searchParams.get('city') || '');
    const [jobType, setJobType] = useState(searchParams.get('type') || '');
    const [experience, setExperience] = useState(searchParams.get('level') || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (city && city !== 'all') params.set('city', city);
        if (jobType) params.set('type', jobType);
        if (experience) params.set('level', experience);

        router.push(`/jobs?${params.toString()}`);
    };

    return (
        <div className="relative -mt-24 z-20 container mx-auto px-6 mb-12">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 max-w-6xl mx-auto">
                <form onSubmit={handleSearch} className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="المسمى الوظيفي..."
                                className="w-full h-14 pl-4 pr-12 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800 placeholder-slate-400/80"
                            />
                        </div>
                        <div className="flex-1 md:max-w-[200px] relative group">
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full h-14 pl-4 pr-12 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                            >
                                <option value="">كل المدن</option>
                                <option value="Riyadh">الرياض</option>
                                <option value="Jeddah">جدة</option>
                                <option value="Dammam">الدمام</option>
                                <option value="Khobar">الخبر</option>
                                <option value="Mecca">مكة المكرمة</option>
                            </select>
                        </div>
                        <button type="submit" className="h-14 md:w-32 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all">
                            بحث
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <select
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                            className="bg-white border border-gray-200 text-sm font-bold text-slate-600 rounded-lg px-4 py-2 hover:border-blue-400 focus:outline-none cursor-pointer"
                        >
                            <option value="">كل أنواع الوظائف</option>
                            <option value="Full-time">دوام كامل</option>
                            <option value="Part-time">دوام جزئي</option>
                            <option value="Contract">عقد</option>
                            <option value="Freelance">عمل حر</option>
                        </select>

                        <select
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="bg-white border border-gray-200 text-sm font-bold text-slate-600 rounded-lg px-4 py-2 hover:border-blue-400 focus:outline-none cursor-pointer"
                        >
                            <option value="">كل المستويات</option>
                            <option value="Entry">مبتدئ (Entry)</option>
                            <option value="Mid">متوسط (Mid)</option>
                            <option value="Senior">خبير (Senior)</option>
                            <option value="Executive">قيادي (Executive)</option>
                        </select>
                    </div>
                </form>
            </div>
        </div>
    );
}
