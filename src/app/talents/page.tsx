'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Plus, Search, ArrowLeft } from 'lucide-react';

// قائمة الأقسام المطابقة للصورة تماماً مع إيموجي لكل قسم
const CATEGORIES = [
    { name: 'سياحة ومطاعم', emoji: '🍽️', id: 'tourism' },
    { name: 'مهندس', emoji: '👷‍♂️', id: 'engineering' },
    { name: 'مبيعات وتسويق', emoji: '📈', id: 'marketing' },
    { name: 'حرفيين', emoji: '🔨', id: 'craftsmen' },
    { name: 'مقاولات', emoji: '🏗️', id: 'contracting' },
    { name: 'طب وتمريض', emoji: '🩺', id: 'medical' },
    { name: 'عمال دليفري', emoji: '🛵', id: 'delivery' },
    { name: 'حراسة وأمن', emoji: '👮‍♂️', id: 'security' },
    { name: 'تزين وتجميل', emoji: '💇‍♀️', id: 'beauty' },
    { name: 'تعليم وتدريس', emoji: '🎓', id: 'education' },
    { name: 'كمبيوتر وشبكات', emoji: '💻', id: 'it' },
    { name: 'شراكة', emoji: '🤝', id: 'partnership' },
    { name: 'موارد بشرية', emoji: '📋', id: 'hr' },
    { name: 'حدائق ومناظر طبيعية', emoji: '🌳', id: 'landscaping' },
    { name: 'سكرتارية', emoji: '📠', id: 'secretary' },
    { name: 'لياقة بدنية', emoji: '💪', id: 'fitness' },
    { name: 'فنون جميلة', emoji: '🎨', id: 'arts' },
    { name: 'سياحة وسفر', emoji: '✈️', id: 'travel' },
    { name: 'حضانة أطفال', emoji: '🧸', id: 'babysitting' },
    { name: 'أزياء', emoji: '👗', id: 'fashion' },
    { name: 'سائق', emoji: '🚗', id: 'driver' },
    { name: 'حسابات', emoji: '🔢', id: 'accounting' },
    { name: 'عمال', emoji: '🏗️', id: 'labor' },
    { name: 'إدارة', emoji: '💼', id: 'management' },
    { name: 'تقني', emoji: '🔧', id: 'technician' },
    { name: 'خدمة الزبائن', emoji: '🎧', id: 'customer_service' },
    { name: 'موظفين', emoji: '👔', id: 'employees' },
    { name: 'مدخل بيانات', emoji: '⌨️', id: 'data_entry' },
    { name: 'تصميم', emoji: '🖌️', id: 'design' },
    { name: 'عمال تنظيف', emoji: '🧹', id: 'cleaning' },
    { name: 'خياطين', emoji: '🧵', id: 'tailors' },
    { name: 'عمالة منزلية', emoji: '🏠', id: 'domestic' },
    { name: 'تقنيين تكييف وتبريد', emoji: '❄️', id: 'ac' },
    { name: 'برمجة', emoji: '👨‍💻', id: 'programming' },
    { name: 'محاماة وقانون', emoji: '⚖️', id: 'law' },
    { name: 'مونتاج وإخراج', emoji: '🎬', id: 'media' },
    { name: 'تصميم مواقع', emoji: '🌐', id: 'web_design' },
    { name: 'علاقات عامة', emoji: '📣', id: 'pr' },
    { name: 'مترجمين', emoji: '🗣️', id: 'translation' },
    { name: 'محررين', emoji: '✍️', id: 'editing' },
];

export default function TalentsCategoriesPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCounts = async () => {
            const { data, error } = await supabase
                .from('talent_posts')
                .select('category');

            if (data) {
                const newCounts: { [key: string]: number } = {};
                data.forEach((post: any) => {
                    newCounts[post.category] = (newCounts[post.category] || 0) + 1;
                });
                setCounts(newCounts);
            }
            setLoading(false);
        };

        fetchCounts();
    }, [supabase]);

    const filteredCategories = CATEGORIES.filter(cat =>
        cat.name.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20" dir="rtl">

            {/* Hero Section */}
            <div className="relative bg-[#0f172a] text-white pt-20 pb-24 overflow-hidden rounded-b-[3rem] shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#115d9a] rounded-full blur-[100px] opacity-30"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-30"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                        دليل <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">الكفاءات</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-light">
                        المنصة الأحدث للربط بين أصحاب الأعمال والمحترفين. تصفح آلاف الملفات في تخصصك الدقيق.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="ابحث عن قسم (مثال: مهندس، سائق...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-4 px-6 pr-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xl transition-all"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                        <Link
                            href="/talents/post"
                            className="w-full sm:w-auto py-4 px-8 bg-[#115d9a] hover:bg-[#0e4d82] text-white rounded-2xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {/* ✅ هنا تم تغيير النص */}
                            <Plus className="w-5 h-5" /> أضف إعلان (أبحث عن عمل)
                        </Link>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredCategories.map((cat) => {
                        const count = counts[cat.name] || 0;
                        return (
                            <Link
                                key={cat.name}
                                href={`/talents/${encodeURIComponent(cat.name)}`}
                                className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="relative flex flex-col items-center text-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 group-hover:bg-white group-hover:shadow-md flex items-center justify-center text-3xl transition-all duration-300">
                                        {cat.emoji}
                                    </div>

                                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#115d9a] transition-colors">
                                        {cat.name}
                                    </h3>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {count} ملف متاح
                                        </span>
                                    </div>
                                </div>

                                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                                    <ArrowLeft className="w-4 h-4 text-[#115d9a]" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="text-center mt-12 text-gray-400 text-sm">
                تم تصميم الدليل ليغطي كافة احتياجات السوق السعودي 🇸🇦
            </div>
        </div>
    );
}