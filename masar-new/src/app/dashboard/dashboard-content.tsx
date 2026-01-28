'use client';

import { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Archive, RefreshCw, Loader2, Palette, Building2, MapPin, ExternalLink, Calendar, PenTool, Home } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Client-side Supabase

// Helper to get formatted date
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Helper to choose icon based on content
const getJobIcon = (title: string, category: string) => {
    const t = title.toLowerCase();
    const c = category?.toLowerCase() || '';

    if (c.includes('design') || t.includes('designer') || t.includes('مصمم') || t.includes('jraphic')) {
        return <Palette className="w-6 h-6 text-purple-600" />;
    }
    if (c.includes('real estate') || t.includes('estate') || t.includes('عقار') || t.includes('property')) {
        return <Building2 className="w-6 h-6 text-blue-600" />;
    }
    if (t.includes('architect') || t.includes('معماري')) {
        return <PenTool className="w-6 h-6 text-orange-600" />;
    }
    return <Briefcase className="w-6 h-6 text-gray-600" />;
};

export default function DashboardContent({ initialUser }: { initialUser: any }) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, archived: 0 });

    // Fetch Jobs Function
    const fetchJobs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setJobs(data);
                // Calculate Stats
                setStats({
                    total: data.length,
                    active: data.filter((j: any) => j.status === 'active').length,
                    archived: data.filter((j: any) => j.status === 'archived').length
                });
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Fetch
    useEffect(() => {
        fetchJobs();
    }, []);

    // Handle Refresh Button Click
    const handleRefreshData = async () => {
        setRefreshing(true);
        try {
            // Call the Scraper API
            const res = await fetch('/api/scrape', { method: 'POST' });
            const result = await res.json();

            if (result.success) {
                // If successful, re-fetch the data from Supabase to update the table
                await fetchJobs();
            } else {
                alert('فشل تحديث البيانات: ' + (result.message || 'خطأ غير معروف'));
            }
        } catch (error) {
            console.error('Refresh failed:', error);
            alert('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">لوحة التحكم</h1>
                    <p className="text-gray-500 font-medium">
                        أهلاً بك، <span className="text-blue-600 font-bold">{initialUser.user_metadata?.full_name || 'مدير النظام'}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Refresh Button */}
                    <button
                        onClick={handleRefreshData}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-5 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>{refreshing ? 'جاري جلب الوظائف...' : 'تحديث البيانات'}</span>
                    </button>

                    {/* Add Job Button */}
                    <a
                        href="/post/job"
                        className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                    >
                        <Briefcase className="w-5 h-5" />
                        أضف وظيفة
                    </a>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {/* Total Jobs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md group">
                    <div>
                        <div className="text-gray-500 font-bold mb-1 text-sm">إجمالي الوظائف</div>
                        {loading ? (
                            <div className="h-9 w-16 bg-gray-100 rounded animate-pulse"></div>
                        ) : (
                            <div className="text-4xl font-black text-blue-900 group-hover:scale-105 transition-transform">{stats.total}</div>
                        )}
                    </div>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Briefcase className="w-7 h-7" />
                    </div>
                </div>

                {/* Active Jobs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md group">
                    <div>
                        <div className="text-gray-500 font-bold mb-1 text-sm">وظائف نشطة</div>
                        {loading ? (
                            <div className="h-9 w-16 bg-gray-100 rounded animate-pulse"></div>
                        ) : (
                            <div className="text-4xl font-black text-green-600 group-hover:scale-105 transition-transform">{stats.active}</div>
                        )}
                    </div>
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <CheckCircle className="w-7 h-7" />
                    </div>
                </div>

                {/* Archived Jobs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md group">
                    <div>
                        <div className="text-gray-500 font-bold mb-1 text-sm">وظائف مؤرشفة</div>
                        {loading ? (
                            <div className="h-9 w-16 bg-gray-100 rounded animate-pulse"></div>
                        ) : (
                            <div className="text-4xl font-black text-orange-600 group-hover:scale-105 transition-transform">{stats.archived}</div>
                        )}
                    </div>
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <Archive className="w-7 h-7" />
                    </div>
                </div>
            </div>

            {/* Jobs Grid Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                        أحدث الوظائف المتاحة
                    </h2>
                    {jobs.length > 0 && <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{jobs.length} وظيفة</span>}
                </div>

                {loading ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">جاري تحميل الوظائف...</p>
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                                {/* Header: Icon & Date */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
                                        {getJobIcon(job.title, job.category || '')}
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(job.created_at)}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="mb-4 flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 leading-snug line-clamp-2" title={job.title}>
                                        {job.title}
                                    </h3>
                                    <p className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-1">
                                        {job.company_name || 'شركة غير محددة'}
                                    </p>

                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                        <MapPin className="w-4 h-4" />
                                        <span className="line-clamp-1">{job.location || 'السعودية'}</span>
                                    </div>
                                </div>

                                {/* Footer & Action */}
                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <a
                                        href={job.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-blue-50 text-blue-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white py-2.5 rounded-xl font-bold transition-all"
                                    >
                                        <span>عرض التفاصيل</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                        <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
                            <Briefcase className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد وظائف حالياً</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">لم نعثر على أي وظائف في قاعدة البيانات. انقر فوق زر التحديث لجلب أحدث الوظائف من المصادر الخارجية.</p>
                        <button
                            onClick={handleRefreshData}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
                        >
                            <RefreshCw className="w-5 h-5" />
                            تحديث البيانات الآن
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
