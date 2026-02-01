import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default async function TalentsPage() {
    // 1. استدعاء المحرك الذي أنشأته في server.ts
    const supabase = await createClient();

    // 2. جلب البيانات من جدول profiles
    const { data: talents, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="p-20 text-center font-bold">عذراً، حدث خطأ في الاتصال بقاعدة البيانات.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6" dir="rtl">
            <div className="container mx-auto">
                <h1 className="text-4xl font-black text-center mb-16 font-[Cairo]">استكشاف الكفاءات</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {talents?.map((talent: any) => (
                        <div key={talent.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 text-center hover:shadow-xl transition-all">
                            <img
                                src={talent.avatar_url || "/default-avatar.png"}
                                className="w-24 h-24 rounded-full mx-auto object-cover mb-4 border-4 border-gray-50"
                            />
                            <h3 className="text-xl font-bold text-gray-900">{talent.full_name}</h3>
                            <p className="text-[#0084db] font-bold text-sm mb-4">{talent.job_title}</p>

                            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold mb-6">
                                <MapPin className="w-4 h-4" />
                                {talent.location}
                            </div>

                            <Link
                                href={`/talents/${talent.id}`}
                                className="block w-full bg-[#0084db] text-white py-4 rounded-2xl font-black hover:bg-blue-600 transition-colors"
                            >
                                الملف الشخصي
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}