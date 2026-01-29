import Link from 'next/link';
import { Briefcase, MapPin, Clock, Search as SearchIcon } from 'lucide-react';
import { createClient } from '@/lib/supabaseServer';
import SearchForm from '@/components/SearchForm';

export const metadata = {
    title: 'البحث عن وظائف | مسار',
    description: 'تصفح أحدث الوظائف الشاغرة في السعودية',
};

// Next.js 15/16: Page props are async promises in some contexts, but simple server components receive searchParams directly as props in standard usage.
// Note: In Next.js 15+, searchParams is a Promise. We should await it.
export default async function JobsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
    const city = typeof resolvedSearchParams.city === 'string' ? resolvedSearchParams.city : '';

    const supabase = await createClient();

    let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (q) {
        // Ideally use full text search, but ilike is okay for small scale
        // Or we use the job_hash or title for simple matching
        query = query.ilike('title', `%${q}%`);
    }

    if (city) {
        query = query.ilike('city', `%${city}%`);
    }

    const { data: jobs, error } = await query;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
            {/* Navbar Reuse (You might want to extract Navbar component) */}
            <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all h-20 flex items-center">
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:bg-blue-800 transition-colors">
                                <Briefcase className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <span className="text-3xl font-black text-blue-950 tracking-tighter">مسار</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Header Spacer */}
            <div className="h-32 bg-gray-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900" />
                <h1 className="relative z-10 text-3xl font-bold text-white">نتائج البحث</h1>
            </div>

            {/* Reuse Search Form component but styled differently? Or just use same logic? */}
            {/* For now let's just show results */}

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Search Params Display */}
                    {(q || city) && (
                        <div className="mb-8 flex items-center gap-2 text-slate-500">
                            <span>نتائج البحث عن:</span>
                            {q && <span className="font-bold text-blue-700">"{q}"</span>}
                            {city && <span className="font-bold text-blue-700">في {city}</span>}
                        </div>
                    )}

                    <div className="space-y-4">
                        {jobs && jobs.length > 0 ? jobs.map((job) => (
                            <Link href={`/jobs/${job.seo_url || job.id}`} key={job.id} className="block group bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-2">{job.title}</h3>
                                        <div className="flex gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.city || 'غير محدد'}</span>
                                            {job.category && <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs">{job.category}</span>}
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(job.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    <span className="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-bold text-sm">تقديم</span>
                                </div>
                            </Link>
                        )) : (
                            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">لا توجد نتائج مطابقة</h3>
                                <p className="text-gray-400">جرب كلمات مفتاحية مختلفة</p>
                                <Link href="/" className="mt-4 inline-block text-blue-600 font-bold hover:underline">العودة للرئيسية</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
