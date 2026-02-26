import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Briefcase, User, LayoutDashboard, MessageCircle, FileText } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-l border-gray-200 hidden md:flex flex-col fixed inset-y-0 right-0 z-40 pt-20">
                <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
                    <div className="text-xs font-bold text-gray-400 px-4 mb-2">القائمة الرئيسية</div>
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-[#115d9a] rounded-xl font-bold transition-all hover:bg-blue-100">
                        <LayoutDashboard className="w-5 h-5" /> لوحة التحكم
                    </Link>
                    <Link href="/my-jobs" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#115d9a] rounded-xl font-medium transition-all">
                        <FileText className="w-5 h-5" /> وظائفي
                    </Link>
                    <Link href="/messages" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#115d9a] rounded-xl font-medium transition-all">
                        <MessageCircle className="w-5 h-5" /> الرسائل
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#115d9a] rounded-xl font-medium transition-all">
                        <User className="w-5 h-5" /> الملف الشخصي
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 px-2 py-2 mb-3">
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[#115d9a] font-bold overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                user.email?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{profile?.full_name || 'مستخدم مسار'}</p>
                            <p className="text-xs text-gray-500 truncate font-mono">{user.email}</p>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 md:mr-64 min-h-screen pt-20 pb-10">
                <div className="px-4 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}