'use client';

import Link from 'next/link';
import { MapPin, Clock, Building2, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import ContactModal from './ContactModal';

interface Job {
    id: string;
    title: string;
    seo_url?: string;
    city: string;
    category?: string;
    created_at: string;
    company_name?: string;
    job_type?: string; // Corrected to match new type
    experience_level?: string;
    salary_range?: string; // Corrected
    phone?: string;
    email?: string;
}

export default function JobCard({ job }: { job: Job }) {
    const isNew = (new Date().getTime() - new Date(job.created_at).getTime()) < (3 * 24 * 60 * 60 * 1000); // 3 days
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleContactClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // Stop navigation if inside Link
        e.stopPropagation();

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.push('/login?next=' + encodeURIComponent(window.location.pathname));
            return;
        }

        setIsModalOpen(true);
    };

    return (
        <>
            <div className="block group relative bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Link href={`/jobs/${job.seo_url || job.id}`} className="absolute inset-0 z-0" />

                {isNew && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full shadow-sm animate-pulse z-10 pointer-events-none">
                        جديد
                    </span>
                )}

                <div className="relative z-10 pointer-events-none">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Briefcase className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">{job.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" strokeWidth={1.5} /> {job.company_name || 'مؤسسة توظيف'}</span>
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
                        <span className="bg-slate-50 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-100">
                            {job.category || 'عام'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-gray-50">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" strokeWidth={1.5} /> {job.city || 'غير محدد'}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" strokeWidth={1.5} /> {new Date(job.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                    </div>
                </div>

                {/* Contact Button Area - High Z-Index to be clickable */}
                <div className="mt-4 pt-2 relative z-20 flex justify-end">
                    <button
                        onClick={handleContactClick}
                        className="bg-[#0084db] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-[#006bb3] transition-all"
                    >
                        تواصل / تقديم
                    </button>
                </div>
            </div>

            <ContactModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                phone={job.phone}
                email={job.email}
            />
        </>
    );
}
