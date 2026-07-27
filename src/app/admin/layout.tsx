
import { checkAdminSession } from './actions';
import Link from 'next/link';
import { LayoutDashboard, Users, Briefcase, FileText } from 'lucide-react';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check session on server
    const isAuthenticated = await checkAdminSession();

    // If not authenticated, render children (Login Page/Form) without layout wrapper
    if (!isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-l border-gray-100 hidden md:flex flex-col fixed inset-y-0 right-0 z-50">
                {/* Logo Area */}
                <div className="h-20 flex items-center px-8 border-b border-gray-100">
                    <Link href="/admin" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white shadow-md group-hover:bg-blue-800 transition-colors">
                            <Briefcase className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <span className="text-2xl font-black text-blue-950 tracking-tighter">مسار <span className="text-blue-600 text-sm">Admin</span></span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-bold transition-all"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        لوحة التحكم
                    </Link>
                    <Link
                        href="/admin/applications"
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-bold transition-all"
                    >
                        <FileText className="w-5 h-5" />
                        المتقدمين
                    </Link>
                    <Link
                        href="/admin/talents"
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-bold transition-all"
                    >
                        <Users className="w-5 h-5" />
                        الكفاءات
                    </Link>
                </nav>

                {/* Footer Info */}
                <div className="p-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 font-medium">لوحة المشرف - مسار 2026</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:mr-64 min-h-screen transition-all duration-300">
                {/* Mobile Header (Simplified) */}
                <header className="md:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-40">
                    <Link href="/admin" className="font-black text-xl text-blue-950">مسار Admin</Link>
                </header>

                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
