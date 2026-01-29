'use client';

import { Search, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchForm() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [city, setCity] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (city && city !== 'all') params.set('city', city);

        router.push(`/jobs?${params.toString()}`);
    };

    return (
        <div className="relative -mt-20 z-20 container mx-auto px-6">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="المسمى الوظيفي..."
                            className="w-full h-14 pl-4 pr-12 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-black"
                        />
                    </div>
                    <div className="flex-1 md:max-w-xs relative group">
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full h-14 pl-4 pr-12 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium appearance-none cursor-pointer text-black"
                        >
                            <option value="">كل المدن</option>
                            <option value="Riyadh">الرياض</option>
                            <option value="Jeddah">جدة</option>
                            <option value="Dammam">الدمام</option>
                            <option value="Khobar">الخبر</option>
                            <option value="Mecca">مكة المكرمة</option>
                            <option value="Medina">المدينة المنورة</option>
                        </select>
                    </div>
                    <button type="submit" className="h-14 md:w-48 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all">
                        بحث
                    </button>
                </form>
            </div>
        </div>
    );
}
