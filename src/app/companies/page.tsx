'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import {
    Building2, MapPin, Briefcase, Star,
    ArrowLeft, Search, ShieldCheck, Globe, Loader2
} from 'lucide-react';

export default function FeaturedCompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchCompanies = async () => {
            // جلب الشركات التي لديها ملفات شخصية كاملة (أو بناءً على تصنيف محدد)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .not('full_name', 'is', null)
                .order('created_at', { ascending: false })
                .limit(12);

            if (!error) setCompanies(data || []);
            setLoading(false);
        };
        fetchCompanies();
    }, [supabase]);

    const filteredCompanies = companies.filter(c =>
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        /* ✅ إضافة pt-28 لضمان عدم تغطية الهيدر للنص */
        <div className="min-h-screen bg-[#f8fafb] font-sans pt-28 pb-20" dir="rtl">

            {/* Hero Section - تصميم ملكي داكن */}
            <div className="max-w-7xl mx-auto px-4 mb-16">
                <div className="relative bg-[#01261d] rounded-[3rem] p-12 md:p-20 overflow-hidden shadow-2xl">
                    {/* تأثيرات جمالية خلفية */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-10"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400 rounded-full blur-[100px] opacity-10"></div>

                    <div className="relative z-10 text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 text-sm font-bold mb-6">
                            <Star className="w-4 h-4 fill-emerald-400" /> شركاء النجاح المميزون
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                            أبرز الشركات <span className="text-emerald-400">الموظفة</span>
                        </h1>
                        <p className="text-emerald-100/70 text-lg font-light mb-10 leading-relaxed">
                            تصفح نخبة الشركات التي تبحث عن مواهب مثلك، واكتشف فرصك التالية في بيئات عمل احترافية.
                        </p>

                        {/* شريط البحث المدمج */}
                        <div className="relative max-w-xl mx-auto group">
                            <input
                                type="text"
                                placeholder="ابحث عن شركة محددة..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-5 px-8 pr-14 rounded-2xl bg-white/95 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/40 font-bold shadow-2xl transition-all"
                            />
                            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-600 w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Companies Grid */}
            <div className="max-w-7xl mx-auto px-4">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>
                ) : filteredCompanies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCompanies.map((company) => (
                            <Link
                                key={company.id}
                                href={`/profile/${company.id}`}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-500 relative overflow-hidden"
                            >
                                {/* شارة التحقق */}
                                <div className="absolute top-6 left-6">
                                    <ShieldCheck className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                                </div>

                                <div className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden mb-6 group-hover:scale-110 transition-transform duration-500 p-2">
                                        {company.avatar_url ? (
                                            <img src={company.avatar_url} alt={company.full_name} className="w-full h-full object-contain" />
                                        ) : (
                                            <Building2 className="w-full h-full p-4 text-slate-300" />
                                        )}
                                    </div>

                                    <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                                        {company.full_name}
                                    </h3>

                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                                            <MapPin className="w-3 h-3" /> {company.city || 'السعودية'}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                            <Briefcase className="w-3 h-3" /> شركة موظفة
                                        </span>
                                    </div>

                                    <div className="w-full grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                                        <div className="text-center border-l border-slate-50">
                                            <span className="block text-lg font-black text-slate-800">12</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">وظيفة نشطة</span>
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-lg font-black text-slate-800">4.8</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">التقييم</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center gap-2 text-emerald-600 font-black text-sm group-hover:gap-4 transition-all">
                                        عرض الملف التعريفي <ArrowLeft className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-slate-100">
                        <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800">لا توجد شركات مطابقة لبحثك</h2>
                        <button onClick={() => setSearchTerm('')} className="mt-4 text-emerald-600 font-bold">عرض جميع الشركات</button>
                    </div>
                )}
            </div>
        </div>
    );
}