
import { checkAdminSession, getApplications } from '../actions';
import { redirect } from 'next/navigation';
import ApplicationsTable from './ApplicationsTable';

export default async function ApplicationsPage() {
    // 1. Auth Check
    const isAuthenticated = await checkAdminSession();
    if (!isAuthenticated) {
        redirect('/admin'); // Redirect to login
    }

    // 2. Fetch Data
    const result = await getApplications();
    // result is { success: boolean, data: any } or just data?
    // In actions.ts I returned: return { success: true, data };

    // Let's verify actions.ts return type 
    // actions.ts: return { success: true, data };

    const applications = result.success ? result.data : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">إدارة المتقدمين</h1>
                    <p className="text-gray-500 mt-1">عرض وإدارة طلبات التوظيف المستلمة</p>
                </div>
            </div>

            <ApplicationsTable initialApplications={applications || []} />
        </div>
    );
}
