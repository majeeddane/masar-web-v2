'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Newspaper, ArrowLeft, Calendar, User, Search, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function BlogPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            let query = supabase
                .from('posts')
                .select('*, author:author_id(full_name, avatar_url)')
                .order('published_at', { ascending: false });

            if (selectedCategory !== 'All') {
                query = query.eq('category', selectedCategory);
            }

            const { data, error } = await query;
            if (data) setPosts(data);
            setLoading(false);
        };

        fetchPosts();
    }, [selectedCategory]);

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categories = ['All', 'General', 'Career Tips', 'Market News', 'Success Stories'];

    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-[#115d9a] text-white py-16 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">مركز المعرفة</h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-medium">
                        أحدث المقالات، النصائح المهنية، وأخبار سوق العمل السعودي
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? 'bg-[#115d9a] text-white shadow-md transform scale-105'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {cat === 'All' ? 'الكل' :
                                    cat === 'General' ? 'عام' :
                                        cat === 'Career Tips' ? 'نصائح مهنية' :
                                            cat === 'Market News' ? 'أخبار السوق' : 'قصص نجاح'}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن مقال..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 rounded-xl border-gray-200 focus:border-[#115d9a] focus:ring-[#115d9a] transition-shadow shadow-sm"
                        />
                    </div>
                </div>

                {/* Posts Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 text-[#115d9a] animate-spin" />
                    </div>
                ) : filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map(post => (
                            <Link href={`/news/${post.id}`} key={post.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                                <div className="h-56 bg-gray-200 relative overflow-hidden">
                                    {post.cover_image ? (
                                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <Newspaper className="h-12 w-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-[#115d9a] shadow-sm">
                                        {post.category}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.published_at).toLocaleDateString('ar-SA')}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author?.full_name || 'مسار'}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-[#115d9a] transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center text-[#115d9a] font-bold text-sm group-hover:gap-2 transition-all">
                                        اقرأ المزيد <ArrowLeft className="h-4 w-4 mr-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">لا توجد مقالات مضافة بعد</h3>
                        <p className="text-gray-500 mt-2">ترقبوا نشر مقالات جديدة قريباً!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
