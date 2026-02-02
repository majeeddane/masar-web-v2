
import { checkAdminSession } from '../actions';
import { redirect } from 'next/navigation';
import TalentsTable from './TalentsTable';
import { createClient } from '@/utils/supabase/server';

export default async function AdminTalentsPage() {
    // 1. Auth Check
    const isAuthenticated = await checkAdminSession();
    if (!isAuthenticated) {
        redirect('/admin');
    }

    // 2. Fetch Data
    const supabase = await createClient();
    const { data: talents, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching talents:', error);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">إدارة الكفاءات</h1>
                    <p className="text-gray-500 mt-1">عرض وإدارة ملفات الموهوبين المسجلين</p>
                </div>
            </div>

            <TalentsTable initialTalents={talents || []} />
        </div>
    );
}
