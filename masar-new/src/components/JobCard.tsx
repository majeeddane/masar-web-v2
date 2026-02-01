
import Link from 'next/link';
import { MapPin, Clock, Building2, Briefcase, Star } from 'lucide-react';

interface Job {
    id: string;
    title: string;
    seo_url?: string;
    city: string;
    category?: string;
    created_at: string;
    job_type?: string;
    experience_level?: string;
    salary?: string;
}

export default function JobCard({ job }: { job: Job }) {
    const isNew = (new Date().getTime() - new Date(job.created_at).getTime()) < (3 * 24 * 60 * 60 * 1000); // 3 days

    return (
        <Link href={`/jobs/${job.seo_url || job.id}`} className="block group relative bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {isNew && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full shadow-sm animate-pulse">
                    جديد
                </span>
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Briefcase className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">{job.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" strokeWidth={1.5} /> مؤسسة توظيف</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {job.job_type && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-100">
                        {job.job_type}
                    </span>
                )}
                {job.experience_level && (
                    <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-md border border-purple-100">
                        {job.experience_level}
                    </span>
                )}
                <span className="bg-slate-50 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-100">
                    {job.category || 'عام'}
                </span>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-gray-50">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" strokeWidth={1.5} /> {job.city || 'غير محدد'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" strokeWidth={1.5} /> {new Date(job.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
                <span className="text-blue-600 font-bold group-hover:underline">تفاصيل أكثر</span>
            </div>
        </Link>
    );
}
