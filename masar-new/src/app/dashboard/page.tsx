import DashboardContent from './dashboard-content';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    // MAINTAIN GUEST LOGIC / BYPASS
    // In a real Server Component, we fetch the user here.
    // Since we are mocking/bypassing for the demo as per previous turns:

    const user = {
        id: 'admin_bypass',
        email: 'majeed.dane@gmail.com',
        user_metadata: {
            full_name: 'Majeed Dane (Admin)'
        }
    };

    return <DashboardContent initialUser={user} />;
}