'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { MapPin, Search, Building2, ChevronLeft } from 'lucide-react';

const SAUDI_CITIES_WITH_ICONS = [
    { name: 'الرياض', emoji: '🏙️', region: 'المنطقة الوسطى' },
    { name: 'جدة', emoji: '🌊', region: 'المنطقة الغربية' },
    { name: 'مكة المكرمة', emoji: '🕋', region: 'المنطقة الغربية' },
    { name: 'المدينة المنورة', emoji: '🕌', region: 'المنطقة الغربية' },
    { name: 'الدمام', emoji: '🛢️', region: 'المنطقة الشرقية' },
    { name: 'الخبر', emoji: '🏗️', region: 'المنطقة الشرقية' },
    { name: 'الظهران', emoji: '⚙️', region: 'المنطقة الشرقية' },
    { name: 'الأحساء', emoji: '🌴', region: 'المنطقة الشرقية' },
    { name: 'الجبيل', emoji: '🏭', region: 'المنطقة الشرقية' },
    { name: 'الطائف', emoji: '🌹', region: 'المنطقة الغربية' },
    { name: 'بريدة', emoji: '🌾', region: 'منطقة القصيم' },
    { name: 'تبوك', emoji: '🏔️', region: 'منطقة تبوك' },
    { name: 'أبها', emoji: '⛰️', region: 'منطقة عسير' },
    { name: 'خميس مشيط', emoji: '🌿', region: 'منطقة عسير' },
    { name: 'جازان', emoji: '🎣', region: 'منطقة جازان' },
    { name: 'نجران', emoji: '🏜️', region: 'منطقة نجران' },
    { name: 'حائل', emoji: '🌬️', region: 'منطقة حائل' },
    { name: 'الخرج', emoji: '🌻', region: 'المنطقة الوسطى' },
    { name: 'ينبع', emoji: '⚗️', region: 'المنطقة الغربية' },
    { name: 'العمل عن بعد', emoji: '💻', region: 'عن بعد' },
];

export default function JobsCitiesPage() {
    const [mounted, setMounted] = useState(false);
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [search, setSearch] = useState('');
    const supabase = getSupabaseBrowserClient();

    useEffect(() => {
        setMounted(true);
        const fetchCounts = async () => {
            const { data } = await supabase.from('jobs').select('city').eq('is_active', true);
            if (data) {
                const c: { [key: string]: number } = {};
                data.forEach(j => {
                    const city = (j.city || '').trim();
                    SAUDI_CITIES_WITH_ICONS.forEach(sc => {
                        if (city.includes(sc.name) || sc.name.includes(city)) {
                            c[sc.name] = (c[sc.name] || 0) + 1;
                        }
                    });
                });
                setCounts(c);
            }
        };
        fetchCounts();
    }, [supabase]);

    const filtered = SAUDI_CITIES_WITH_ICONS.filter(c =>
        !search || c.name.includes(search) || c.region.includes(search)
    );

    // Group by region
    const grouped = filtered.reduce<{ [r: string]: typeof SAUDI_CITIES_WITH_ICONS }>((acc, city) => {
        const r = city.region;
        if (!acc[r]) acc[r] = [];
        acc[r].push(city);
        return acc;
    }, {});

    if (!mounted) return <div className="min-h-screen bg-slate-50" />;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20" dir="rtl">
            {/* Hero Header */}
            <div className="relative bg-gradient-to-br from-[#022c22] via-[#04452e] to-[#022c22] text-white pt-12 pb-36 overflow-hidden rounded-b-[4rem] border-b-8 border-emerald-500">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
                />
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-4 py-2 rounded-full text-emerald-300 text-sm font-bold mb-6">
                        <MapPin className="w-4 h-4" />
                        <span>تصفح الوظائف حسب المدينة</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
                        وظائف في <span className="text-emerald-400">جميع مدن</span><br />المملكة
                    </h1>
                    <p className="text-emerald-200 text-lg mb-10 max-w-xl mx-auto">
                        اختر مدينتك وابدأ رحلتك الوظيفية مباشرةً
                    </p>
                    <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm p-2 rounded-3xl border border-white/20 flex items-center gap-3">
                        <Search className="w-5 h-5 text-white/60 mr-2 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="ابحث عن مدينة أو منطقة..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 bg-transparent text-white placeholder-white/50 font-bold focus:outline-none py-3"
                        />
                    </div>
                </div>
            </div>

            {/* Cities Grid by Region */}
            <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20 space-y-10">
                {Object.entries(grouped).map(([region, cities]) => (
                    <div key={region}>
                        {/* Region Header */}
                        <div className="flex items-center gap-3 mb-5 px-1">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="bg-white border border-slate-200 text-slate-600 font-black text-sm px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                {region}
                            </span>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {cities.map(city => {
                                const count = counts[city.name] || 0;
                                return (
                                    <Link
                                        key={city.name}
                                        href={`/jobs/city/${encodeURIComponent(city.name)}`}
                                        className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-emerald-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-100/0 group-hover:from-emerald-50/50 group-hover:to-emerald-100/30 transition-all duration-300" />
                                        <div className="relative z-10">
                                            <span className="text-4xl mb-3 block">{city.emoji}</span>
                                            <h3 className="font-black text-slate-800 text-base group-hover:text-emerald-700 transition-colors mb-2">
                                                {city.name}
                                            </h3>
                                            {count > 0 ? (
                                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">
                                                    <Building2 className="w-3 h-3" />
                                                    {count} وظيفة
                                                </span>
                                            ) : (
                                                <span className="inline-block bg-slate-100 text-slate-400 text-xs font-bold px-3 py-1 rounded-full">
                                                    قريباً
                                                </span>
                                            )}
                                        </div>
                                        <ChevronLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200 group-hover:text-emerald-400 transition-colors" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom CTA */}
            <div className="max-w-3xl mx-auto px-4 mt-16 text-center">
                <div className="bg-gradient-to-br from-[#022c22] to-[#04452e] rounded-3xl p-10 text-white">
                    <h2 className="text-2xl font-black mb-3">لديك وظيفة شاغرة؟</h2>
                    <p className="text-emerald-200 mb-6">أضف وظيفتك مجاناً وابدأ في تلقي طلبات المتقدمين</p>
                    <Link
                        href="/post/job"
                        className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl hover:shadow-emerald-500/30"
                    >
                        + أضف وظيفة شاغرة
                    </Link>
                </div>
            </div>
        </div>
    );
}
