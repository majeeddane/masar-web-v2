import { createClient } from '@/lib/supabaseServer'
import { Briefcase } from 'lucide-react'
import MyJobsTable from './my-jobs-table'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch user's jobs
    // Note: Assuming 'author_id' exists in the 'news' table as per requirements.
    // If jobs are scraped they might not have author_id, so we filter by what we have.
    const { data: jobs, error } = await supabase
        .from('news')
        .select('*')
        .eq('author_id', user!.id)
        .order('published', { ascending: false })

    if (error) {
        console.error('Error fetching jobs:', error)
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">وظائفي المعلنة</h1>
                    <p className="text-gray-500">
                        قم بإدارة الوظائف التي قمت بنشرها ومتابعة حالتها
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

            {/* Stats Cards (Optional but good for Dashboard) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="text-gray-500 font-medium mb-1">إجمالي الوظائف</div>
                        <div className="text-3xl font-black text-blue-900">{jobs?.length || 0}</div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Briefcase className="w-6 h-6" />
                    </div>
                </div>
                {/* We can add more stats here later */}
            </div>

            {/* Jobs Table */}
            <MyJobsTable jobs={jobs || []} />
        </div>
    )
}