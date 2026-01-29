
'use client';

import { useState } from 'react';
import JobCard from './JobCard';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';

interface Job {
    id: string;
    title: string;
    description?: string;
    city: string;
    created_at: string;
    category?: string;
    seo_url?: string;
    salary?: string;
    job_type?: string;
    experience_level?: string;
}

interface JobsListProps {
    initialJobs: Job[];
    filters: {
        q?: string;
        city?: string;
        type?: string;
        level?: string;
    };
}

export default function JobsList({ initialJobs, filters }: JobsListProps) {
    const [jobs, setJobs] = useState<Job[]>(initialJobs);
    const [page, setPage] = useState(2);
    const [hasMore, setHasMore] = useState(initialJobs.length >= 10);
    const [loading, setLoading] = useState(false);

    const loadMore = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        if (filters.city) params.set('city', filters.city);
        if (filters.type) params.set('type', filters.type);
        if (filters.level) params.set('level', filters.level);
        params.set('page', page.toString());
        params.set('limit', '10');

        try {
            const res = await fetch(`/api/jobs?${params.toString()}`);
            const data = await res.json();

            if (data.jobs.length > 0) {
                setJobs(prev => [...prev, ...data.jobs]);
                setPage(prev => prev + 1);
                if (data.jobs.length < 10) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Failed to load more jobs');
        } finally {
            setLoading(false);
        }
    };

    if (jobs.length === 0) {
        return (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400">لا توجد نتائج مطابقة</h3>
                <p className="text-gray-400">جرب كلمات مفتاحية مختلفة</p>
                <Link href="/" className="mt-4 inline-block text-blue-600 font-bold hover:underline">العودة للرئيسية</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>

            {hasMore ? (
                <div className="text-center pt-8">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="bg-white hover:bg-slate-50 text-slate-600 border border-gray-200 font-bold px-8 py-3 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'جاري التحميل...' : 'عرض المزيد من الوظائف'}
                    </button>
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                    لا توجد وظائف أخرى حالياً
                </div>
            )}
        </div>
    );
}
