
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import JobsList from '@/components/JobsList';
import { getJobs } from '@/lib/jobs';

export const metadata = {
    title: 'البحث عن وظائف | مسار',
    description: 'تصفح أحدث الوظائف الشاغرة في السعودية',
};

// Next.js 15: searchParams is a Promise
export default async function JobsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
    const city = typeof resolvedSearchParams.city === 'string' ? resolvedSearchParams.city : '';
    const type = typeof resolvedSearchParams.type === 'string' ? resolvedSearchParams.type : '';
    const level = typeof resolvedSearchParams.level === 'string' ? resolvedSearchParams.level : '';

    const jobs = await getJobs({ q, city, type, level });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
            <Navbar />

            <div className="h-32 bg-gray-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900" />
                <h1 className="relative z-10 text-3xl font-bold text-white">نتائج البحث</h1>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    {(q || city) && (
                        <div className="mb-8 flex items-center gap-2 text-slate-500">
                            <span>نتائج البحث عن:</span>
                            {q && <span className="font-bold text-blue-700">"{q}"</span>}
                            {city && <span className="font-bold text-blue-700">في {city}</span>}
                        </div>
                    )}

                    <JobsList initialJobs={jobs} filters={{ q, city, type, level }} />
                </div>
            </div>
        </div>
    );
}
