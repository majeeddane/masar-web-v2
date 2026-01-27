import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Briefcase, User, LogOut, LayoutDashboard } from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // 1. Auth Protection
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-l border-gray-100 hidden md:flex flex-col fixed inset-y-0 right-0 z-50">
                {/* Logo Area */}
                <div className="h-20 flex items-center px-8 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white shadow-md group-hover:bg-blue-800 transition-colors">
                            <Briefcase className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <span className="text-2xl font-black text-blue-950 tracking-tighter">مسار</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold transition-all"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        وظائفي المعلنة
                    </Link>
                    <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-all"
                    >
                        <User className="w-5 h-5" />
                        الملف الشخصي
                    </Link>
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {user.email?.split('@')[0]}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <form action="/auth/signout" method="post">
                        {/* Note: Assuming /auth/signout exists or will be handled. 
                            If not, we should probably add a client component for logout or a server action.
                            For now, using the standard form post behavior to a route. 
                            Wait, to be safe, let's make it a client component button or simple form.
                            Actually, standard Supabase auth usually needs client side signout or a route handler.
                            I'll check if /auth/signout route exists or just use a client helper?
                            My previous layout had `handleLogout` client side.
                            I should PROBABLY keep that pattern for reliability if I don't have the route.
                            BUT, this is a Server Component layout. 
                            I'll use a small Client Component for the Logout button to be safe.
                        */}
                        {/* Actually, let's keep it simple. If I use form action, I need a server action or route. 
                            I'll stick to a Client Component for the Sidebar or just the Logout button.
                            To minimize complexity, I'll inline a client component for the button? 
                            No, I'll just change the sidebar to be a server component that imports a client LogoutButton.
                            Or, I'll just make the logout button a form that posts to a Server Action I CREATE.
                            
                            Let's create a logout server action in actions.ts?
                            No, let's just use the previous layout's client-side logic for logout... 
                            Ah, I can't mix client logic in this Server Component Layout easily without extracting.
                            
                            Let's extract the Logout button to a separate client component `src/app/dashboard/logout-btn.tsx`.
                        */}
                    </form>
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:mr-64 min-h-screen">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-40">
                    <Link href="/" className="font-black text-xl text-blue-950">مسار</Link>
                </header>

                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

        </div>
    )
}

import LogoutButton from './logout-button'