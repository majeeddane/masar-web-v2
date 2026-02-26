'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Plus, Search, Building2 } from 'lucide-react';

const CATEGORIES = [
    { name: 'سياحة ومطاعم', emoji: '🍽️' }, { name: 'مهندس', emoji: '👷‍♂️' },
    { name: 'مبيعات وتسويق', emoji: '📈' }, { name: 'حرفيين', emoji: '🔨' },
    { name: 'مقاولات', emoji: '🏗️' }, { name: 'طب وتمريض', emoji: '🩺' },
    { name: 'عمال دليفري', emoji: '🛵' }, { name: 'حراسة وأمن', emoji: '👮‍♂️' },
    { name: 'تزين وتجميل', emoji: '💇‍♀️' }, { name: 'تعليم وتدريس', emoji: '🎓' },
    { name: 'كمبيوتر وشبكات', emoji: '💻' }, { name: 'شراكة', emoji: '🤝' },
    { name: 'موارد بشرية', emoji: '📋' }, { name: 'حدائق ومناظر طبيعية', emoji: '🌳' },
    { name: 'سكرتارية', emoji: '📠' }, { name: 'لياقة بدنية', emoji: '💪' },
    { name: 'فنون جميلة', emoji: '🎨' }, { name: 'سياحة وسفر', emoji: '✈️' },
    { name: 'حضانة أطفال', emoji: '🧸' }, { name: 'أزياء', emoji: '👗' },
    { name: 'سائق', emoji: '🚗' }, { name: 'حسابات', emoji: '🔢' },
    { name: 'عمال', emoji: '🏗️' }, { name: 'إدارة', emoji: '💼' },
    { name: 'تقني', emoji: '🔧' }, { name: 'خدمة الزبائن', emoji: '🎧' },
    { name: 'موظفين', emoji: '👔' }, { name: 'مدخل بيانات', emoji: '⌨️' },
    { name: 'تصميم', emoji: '🖌️' }, { name: 'عمال تنظيف', emoji: '🧹' },
    { name: 'خياطين', emoji: '🧵' }, { name: 'عمالة منزلية', emoji: '🏠' },
    { name: 'تقنيين تكييف وتبريد', emoji: '❄️' }, { name: 'برمجة', emoji: '👨‍💻' },
    { name: 'محاماة وقانون', emoji: '⚖️' }, { name: 'مونتاج وإخراج', emoji: '🎬' },
    { name: 'تصميم مواقع', emoji: '🌐' }, { name: 'علاقات عامة', emoji: '📣' },
    { name: 'مترجمين', emoji: '🗣️' }, { name: 'محررين', emoji: '✍️' },
];

export default function JobsCategoriesPage() {
    const [mounted, setMounted] = useState(false);
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [searchTerm, setSearchTerm] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        setMounted(true);
        const fetchCounts = async () => {
            const { data } = await supabase.from('jobs').select('category, title');
            if (data) {
                const newCounts: { [key: string]: number } = {};

                CATEGORIES.forEach(cat => {
                    // ✅ توحيد منطق العد مع منطق العرض (البحث الجزئي)
                    const count = data.filter(job =>
                        (job.category && job.category.includes(cat.name)) ||
                        (job.title && job.title.includes(cat.name))
                    ).length;
                    newCounts[cat.name] = count;
                });
                setCounts(newCounts);
            }
        };
        fetchCounts();
    }, [supabase]);

    const filteredCategories = CATEGORIES.filter(cat => cat.name.includes(searchTerm));

    if (!mounted) return <div className="min-h-screen bg-slate-50" />;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20" dir="rtl">
            <div className="relative bg-[#022c22] text-white pt-24 pb-32 overflow-hidden rounded-b-[4rem] border-b-8 border-emerald-500">
                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-black mb-6">فرصك الوظيفية <span className="text-emerald-400">تبدأ هنا</span></h1>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto bg-white/5 p-2 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <input
                            type="text" placeholder="ابحث عن تخصص..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-4 px-6 rounded-2xl bg-white text-slate-800 focus:outline-none font-bold shadow-inner"
                        />
                        <Link href="/jobs/new" className="w-full sm:w-auto py-4 px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black shadow-lg transition-all">
                            + أضف وظيفة
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredCategories.map((cat) => {
                        const count = counts[cat.name] || 0;
                        return (
                            <Link
                                key={cat.name}
                                href={`/jobs/${encodeURIComponent(cat.name)}`}
                                className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl mb-4 group-hover:bg-emerald-50 transition-colors">
                                    {cat.emoji}
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">{cat.name}</h3>
                                <div className="mt-3 w-full">
                                    {count > 0 ? (
                                        <span className="inline-block w-full py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold animate-in zoom-in">
                                            {count} وظيفة شاغرة
                                        </span>
                                    ) : (
                                        <span className="inline-block w-full py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold">لا توجد شواغر</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}