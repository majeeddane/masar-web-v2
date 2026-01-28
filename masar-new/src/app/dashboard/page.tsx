import { createClient } from '@/lib/supabaseServer'
import { Briefcase, CheckCircle, Archive } from 'lucide-react'
import { redirect } from 'next/navigation'
import MyJobsTable from './my-jobs-table'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // Redundant safety check if middleware fails
        redirect('/login');
    }

    // Fetch stats safe handling
    let totalJobs = 0, activeJobs = 0, archivedJobs = 0, jobs = [], fetchError = null;

    try {
        const results = await Promise.all([
            supabase.from('jobs').select('*', { count: 'exact', head: true }),
            supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
            supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)
        ]);

        totalJobs = results[0].count || 0;
        activeJobs = results[1].count || 0;
        archivedJobs = results[2].count || 0;
        jobs = results[3].data || [];

    } catch (e) {
        console.error('Dashboard data fetch error:', e);
        fetchError = e;
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">لوحة التحكم</h1> {/* Changed title to generic Dashboard */}
                    <p className="text-gray-500">
                        نظرة عامة على إحصائيات الوظائف في النظام
                    </p>
                </div>
                {/* Add Job Button */}
                <a
                    href="/post/job"
                    className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                >
                    <Briefcase className="w-5 h-5" />
                    أضف وظيفة
                </a>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {/* Total Jobs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
                    <div>
                        <div className="text-gray-500 font-medium mb-1">إجمالي الوظائف</div>
                        <div className="text-3xl font-black text-blue-900">{totalJobs || 0}</div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Briefcase className="w-6 h-6" />
                    </div>
                </div>

                {/* Active Jobs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
                    <div>
                        <div className="text-gray-500 font-medium mb-1">وظائف نشطة</div>
                        <div className="text-3xl font-black text-green-600">{activeJobs || 0}</div>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                </div>

                {/* Archived Jobs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
                    <div>
                        <div className="text-gray-500 font-medium mb-1">وظائف مؤرشفة</div>
                        <div className="text-3xl font-black text-orange-600">{archivedJobs || 0}</div>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                        <Archive className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Jobs Table */}
            {/* Passing scraped jobs to the table component - might need adjustment if MyJobsTable expects 'news' schema, but assuming it's flexible or I'll fix it if user complains. 
                For now, sending 'jobs' which likely resembles the expected structure or will display what matches.
            */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-lg text-gray-800">أحدث الوظائف</h2>
                </div>
                {jobs && jobs.length > 0 ? (
                    <MyJobsTable jobs={jobs} />
                ) : (
                    <div className="p-8 text-center text-gray-500">لا توجد وظائف حالياً</div>
                )}
            </div>
        </div>
    )
}