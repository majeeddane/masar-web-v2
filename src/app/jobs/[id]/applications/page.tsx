import { createClient } from '@/lib/supabaseServer';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Calendar, FileText, ChevronRight, Mail, Phone } from 'lucide-react';

export default async function JobApplicationsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient();

    // 1. التحقق من المستخدم (صاحب العمل)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 2. التحقق من ملكية الوظيفة (أمان)
    // هل هذه الوظيفة تابعة للمستخدم الحالي؟
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('title, user_id')
        .eq('id', params.id)
        .single();

    if (jobError || !job) return notFound();
    if (job.user_id !== user.id) {
        return (
            <div className="min-h-screen flex items-center justify-center font-bold text-red-500">
                غير مصرح لك برؤية طلبات هذه الوظيفة 🔒
            </div>
        );
    }

    // 3. جلب الطلبات + بيانات المتقدمين (Profiles)
    // نستخدم الـ Join لجلب بيانات البروفايل من جدول profiles عبر applicant_id
    const { data: applications } = await supabase
        .from('applications')
        .select('*, profiles!applicant_id(*)') // profiles هو الجدول المرتبط
        .eq('job_id', params.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <div className="container mx-auto max-w-4xl">

                {/* هيدر الصفحة */}
                <div className="mb-8">
                    <Link href="/jobs/dashboard" className="text-gray-500 hover:text-[#0084db] font-bold text-sm inline-flex items-center gap-1 mb-4">
                        <ChevronRight className="w-4 h-4" /> العودة للوحة التحكم
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900">
                        المتقدمين لوظيفة: <span className="text-[#0084db]">{job.title}</span>
                    </h1>
                </div>

                {/* قائمة المتقدمين */}
                <div className="space-y-4">
                    {applications && applications.length > 0 ? (
                        applications.map((app: any) => {
                            const profile = app.profiles; // بيانات المتقدم
                            return (
                                <div key={app.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center gap-6">

                                    {/* معلومات المتقدم */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="relative">
                                            <img
                                                src={profile?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                                                alt={profile?.full_name}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">{profile?.full_name || 'مستخدم غير معروف'}</h3>
                                            <p className="text-gray-500 text-sm font-bold mb-1">{profile?.job_title}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(app.created_at).toLocaleDateString('ar-SA')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* الإجراءات */}
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <Link
                                            href={`/talents/${profile?.id}`} // رابط البروفايل الذي بنيناه سابقاً
                                            target="_blank"
                                            className="flex-1 md:flex-initial bg-[#0084db] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#006bb3] transition-colors shadow-lg shadow-blue-50 flex items-center justify-center gap-2"
                                        >
                                            <User className="w-4 h-4" /> عرض الملف الشخصي
                                        </Link>

                                        {profile?.cv_url && (
                                            <a
                                                href={profile.cv_url}
                                                target="_blank"
                                                className="flex-1 md:flex-initial bg-blue-50 text-[#0084db] px-4 py-3 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <FileText className="w-4 h-4" /> CV
                                            </a>
                                        )}
                                    </div>

                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                            <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500 font-bold">لم يتقدم أحد لهذه الوظيفة حتى الآن</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
