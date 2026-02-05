import { createClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import { MapPin, Building2, Banknote, Calendar, Briefcase } from 'lucide-react';
import JobActions from '@/components/JobActions';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function JobDetailsPage(props: PageProps) {
    const params = await props.params;
    const { id } = params;
    const supabase = await createClient();

    // 1. Fetch Job Data
    const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !job) {
        notFound();
    }

    // 2. Fetch Current User
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl" dir="rtl">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-right">

                {/* Header */}
                <div className="flex flex-col md:flex-row-reverse justify-between items-start gap-6 mb-8 border-b border-gray-100 pb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">{job.title}</h1>
                        <div className="flex items-center gap-2 text-gray-500 font-medium justify-end">
                            <span className="bg-blue-50 text-[#0084db] px-3 py-1 rounded-lg text-sm font-bold">
                                {job.type || job.job_type || 'Full Time'}
                            </span>
                            <span>•</span>
                            <Building2 className="w-4 h-4" /> {job.company_name}
                            <span>•</span>
                            <MapPin className="w-4 h-4" /> {job.location || job.city}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-2 rounded-xl text-gray-500 text-sm font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.created_at).toLocaleDateString('en-GB')}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {job.salary_range && (
                        <div className="bg-green-50 p-4 rounded-2xl flex items-center gap-3 justify-end text-green-700 font-bold border border-green-100">
                            {job.salary_range} <Banknote className="w-5 h-5" />
                        </div>
                    )}
                    <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3 justify-end text-gray-600 font-bold border border-gray-100">
                        {job.experience_level || 'Not Specified'} <Briefcase className="w-5 h-5" />
                    </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-end gap-2">
                        تفاصيل الوظيفة <div className="w-2 h-8 bg-[#0084db] rounded-full"></div>
                    </h2>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                        {job.description}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <JobActions
                        jobId={job.id}
                        ownerId={job.user_id}
                        phone={job.phone}
                        email={job.email}
                        currentUser={user}
                    />
                </div>

            </div>
        </div>
    );
}
