'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, Clock, ArrowRight, Share2, Briefcase } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ArticlePage() {
    const params = useParams();
    const id = params.id as string;

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [post, setPost] = useState<any>(null);
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch Post
            const { data: postData } = await supabase
                .from('posts')
                .select('*, author:author_id(full_name, avatar_url)')
                .eq('id', id)
                .single();

            setPost(postData);

            // 2. Fetch Recent Jobs for Sidebar
            const { data: jobsData } = await supabase
                .from('jobs')
                .select('id, title, company, location, salary_min, salary_max')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(4);

            setRecentJobs(jobsData || []);
            setLoading(false);
        };

        if (id) fetchData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#115d9a]"></div>
            </div>
        </div>
    );

    if (!post) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex flex-col h-[80vh] items-center justify-center text-center px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">المقال غير موجود</h1>
                <Link href="/news" className="text-[#115d9a] hover:underline">العودة للأخبار</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-[#115d9a]">الرئيسية</Link>
                    <span>/</span>
                    <Link href="/news" className="hover:text-[#115d9a]">مركز المعرفة</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{post.title}</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Article Content */}
                    <div className="lg:col-span-8">
                        <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            {post.cover_image && (
                                <div className="h-[300px] md:h-[450px] w-full bg-gray-100">
                                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="p-6 md:p-10">
                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                                    <span className="bg-blue-50 text-[#115d9a] px-3 py-1 rounded-lg font-bold">
                                        {post.category}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(post.published_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        {post.author?.full_name || 'فريق مسار'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        5 دقائق قراءة
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 leading-snug">
                                    {post.title}
                                </h1>

                                <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-loose">
                                    {/* Simple whitespace rendering. Ideally use a markdown parser. */}
                                    {post.content.split('\n').map((paragraph: string, idx: number) => (
                                        <p key={idx} className="mb-4">{paragraph}</p>
                                    ))}
                                </div>

                                {/* Share */}
                                <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                                    <h4 className="font-bold text-gray-900">شارك المقال:</h4>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-[#115d9a] transition-colors"><Share2 className="h-5 w-5" /></button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Author/Promo */}
                        <div className="bg-[#115d9a] rounded-3xl p-8 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <h3 className="text-xl font-bold mb-3 relative z-10">هل تبحث عن وظيفة؟</h3>
                            <p className="text-blue-100 mb-6 relative z-10">اكتشف آلاف الفرص الوظيفية في كبرى الشركات السعودية.</p>
                            <Link href="/jobs" className="inline-block bg-white text-[#115d9a] px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg relative z-10">
                                تصفح الوظائف
                            </Link>
                        </div>

                        {/* Latest Jobs Widget */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-[#115d9a]" />
                                وظائف حديثة
                            </h3>
                            <div className="space-y-4">
                                {recentJobs.length > 0 ? (
                                    recentJobs.map(job => (
                                        <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                                            <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#115d9a] font-bold text-lg shrink-0 group-hover:bg-[#115d9a] group-hover:text-white transition-colors">
                                                    {job.company?.[0] || 'م'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#115d9a] transition-colors line-clamp-1">{job.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{job.company} • {job.location}</p>
                                                    <div className="mt-2 text-xs font-medium text-green-600">
                                                        {job.salary_min ? `${job.salary_min} - ${job.salary_max} ر.س` : 'راتب تنافسي'}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">لا توجد وظائف حالياً.</p>
                                )}
                            </div>
                            <Link href="/jobs" className="block mt-6 text-center text-sm font-bold text-[#115d9a] hover:underline">
                                عرض كل الوظائف
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
