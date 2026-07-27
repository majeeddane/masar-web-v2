'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowRight, MapPin, Clock, Loader2, Search, Briefcase, ChevronLeft, Filter
} from 'lucide-react';
import { SAUDI_CITIES } from '@/lib/constants'; // تأكد أن ملف الثوابت موجود، أو سأضيف القائمة يدوياً بالأسفل للأمان

export default function CategoryFeedPage() {
    const params = useParams();
    const router = useRouter();
    const categoryName = decodeURIComponent(params.category as string);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 1️⃣ حالة البحث النصي
    const [search, setSearch] = useState('');
    // 2️⃣ حالة فلتر المدينة (الافتراضي فارغ = الكل)
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        const fetchCategoryPosts = async () => {
            const { data, error } = await supabase
                .from('talent_posts')
                .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            job_title
          )
        `)
                .eq('category', categoryName)
                .order('created_at', { ascending: false });

            if (error) console.error(error);
            setPosts(data || []);
            setLoading(false);
        };

        fetchCategoryPosts();
    }, [categoryName, supabase]);

    // 3️⃣ منطق الفلترة المزدوج (بحث + مدينة)
    const filteredPosts = posts.filter(post => {
        const matchesSearch =
            post.post_title?.toLowerCase().includes(search.toLowerCase()) ||
            post.content?.toLowerCase().includes(search.toLowerCase());

        const matchesCity = selectedCity === '' || post.city === selectedCity;

        return matchesSearch && matchesCity;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12" dir="rtl">

            {/* Header */}
            <div className="bg-[#1e293b] text-white py-12 relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-[#115d9a] to-purple-900 opacity-90"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black">قسم {categoryName}</h1>
                                <p className="text-blue-200 text-sm font-bold mt-1">{filteredPosts.length} إعلان مطابق</p>
                            </div>
                        </div>
                        <Link href="/talents/post" className="bg-white text-[#115d9a] py-3 px-6 rounded-xl font-black shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
                            + أضف إعلانك
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filter & Feed Area */}
            <div className="max-w-7xl mx-auto px-4 py-8 -mt-8 relative z-20">

                {/* 🔥 شريط البحث والفلترة الجديد 🔥 */}
                <div className="bg-white p-2 rounded-2xl shadow-lg mb-8 max-w-4xl mx-auto border border-gray-100 flex flex-col md:flex-row gap-2">

                    {/* حقل البحث */}
                    <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-3 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
                        <Search className="w-5 h-5 text-gray-400 ml-2" />
                        <input
                            type="text"
                            placeholder={`ابحث عن وظيفة في ${categoryName}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full py-3 bg-transparent outline-none text-gray-700 font-medium placeholder-gray-400"
                        />
                    </div>

                    {/* فاصل (يظهر فقط في الشاشات الكبيرة) */}
                    <div className="w-px bg-gray-200 my-2 hidden md:block"></div>

                    {/* قائمة المدن المنسدلة */}
                    <div className="md:w-1/3 flex items-center bg-gray-50 rounded-xl px-3 border border-transparent focus-within:border-purple-200 focus-within:bg-white transition-all relative">
                        <MapPin className="w-5 h-5 text-purple-500 ml-2" />
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full py-3 bg-transparent outline-none text-gray-700 font-bold appearance-none cursor-pointer"
                        >
                            <option value="">جميع المدن (الكل)</option>
                            {SAUDI_CITIES.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <div className="absolute left-4 pointer-events-none text-gray-400">
                            <Filter className="w-4 h-4" />
                        </div>
                    </div>

                </div>

                {/* النتائج */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#115d9a]" />
                    </div>
                ) : filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/talents/view/${post.id}`}
                                className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300"
                            >
                                {/* Header: User & Date */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 overflow-hidden">
                                            {post.profiles?.avatar_url ? (
                                                <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <Briefcase className="w-5 h-5 m-auto mt-2.5 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-sm font-bold text-gray-900 group-hover:text-[#115d9a] transition-colors">{post.profiles?.full_name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(post.created_at).toLocaleDateString('ar-SA')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-gray-800 mb-2 line-clamp-2 group-hover:text-[#115d9a] transition-colors">
                                        {post.post_title}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                                        {post.content}
                                    </p>
                                </div>

                                {/* Footer: Tags & Arrow */}
                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${selectedCity === post.city ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                            <MapPin className="w-3 h-3" /> {post.city}
                                        </span>
                                    </div>
                                    <span className="w-8 h-8 rounded-full bg-blue-50 text-[#115d9a] flex items-center justify-center group-hover:bg-[#115d9a] group-hover:text-white transition-all">
                                        <ChevronLeft className="w-4 h-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">لا توجد نتائج مطابقة</h3>
                        <p className="text-gray-500 mt-2 mb-6">
                            لم نعثر على إعلانات في {categoryName} {selectedCity ? `في مدينة ${selectedCity}` : ''}.
                        </p>
                        {selectedCity && (
                            <button onClick={() => setSelectedCity('')} className="text-[#115d9a] font-bold hover:underline">
                                مسح الفلتر وعرض الكل
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}