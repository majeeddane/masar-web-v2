import TalentsSearch from '@/components/TalentsSearch';
import { createClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

// إجبار الصفحة على تحديث البيانات باستمرار لضمان ظهور المسجلين الجدد
export const revalidate = 0;

export default async function TalentsPage({
    searchParams,
}: {
    searchParams: { q?: string; city?: string };
}) {
    // 1. استدعاء المحرك الموثوق للاتصال بـ Supabase
    const supabase = await createClient();

    const { q: qParam, city: cityParam } = await searchParams;
    const q = typeof qParam === 'string' ? qParam : '';
    const city = typeof cityParam === 'string' ? cityParam : '';

    // 2. بناء الاستعلام مع الفلترة
    let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (q) {
        query = query.or(`full_name.ilike.%${q}%,job_title.ilike.%${q}%`);
    }

    if (city) {
        query = query.ilike('location', `%${city}%`);
    }

    const { data: talents, error } = await query;

    // 3. عرض الخطأ الحقيقي إذا وجد (مهم جداً للتشخيص الآن)
    if (error) {
        return (
            <div className="p-20 text-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl inline-block shadow-sm">
                    <p className="font-black text-xl mb-2">عذراً، واجهنا تحدياً تقنياً</p>
                    <code className="text-sm font-mono opacity-80 bg-white/50 px-2 py-1 rounded">
                        تفاصيل الخطأ: {error.message}
                    </code>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6" dir="rtl">
            <div className="container mx-auto">
                <h1 className="text-4xl font-black text-center mb-8 font-[Cairo] text-gray-900">
                    استكشاف الكفاءات
                </h1>

                <TalentsSearch />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {talents && talents.length > 0 ? (
                        talents.map((talent: any) => (
                            <div key={talent.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 text-center hover:shadow-xl transition-all group">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <img
                                        src={talent.avatar_url || "/default-avatar.png"}
                                        alt={talent.full_name}
                                        className="w-full h-full rounded-full mx-auto object-cover border-4 border-gray-50 shadow-sm"
                                    />
                                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 mb-1">{talent.full_name}</h3>
                                <p className="text-[#0084db] font-bold text-sm mb-4">{talent.job_title}</p>

                                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold mb-8">
                                    <MapPin className="w-4 h-4" />
                                    {talent.location}
                                </div>

                                <Link
                                    href={`/talents/${talent.id}`}
                                    className="block w-full bg-[#0084db] text-white py-4 rounded-2xl font-black hover:bg-blue-600 transition-colors shadow-lg shadow-blue-100"
                                >
                                    الملف الشخصي
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
                            <p className="text-gray-500 font-bold">لا توجد كفاءات مسجلة حالياً.. كن أول المنضمين!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}