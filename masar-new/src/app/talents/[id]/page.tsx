import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { MapPin, Mail, Phone, ShieldCheck, Edit3 } from 'lucide-react';
import ContactSection from '@/components/ContactSection';
import Link from 'next/link';

export default async function TalentProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient();

    // 1. جلب بيانات المبدع الحقيقية بناءً على المعرف من الرابط
    const { data: talent, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();

    // 2. إذا لم نجد المبدع أو حدث خطأ، نظهر صفحة 404
    if (error || !talent) return notFound();

    return (
        <div className="min-h-screen bg-white py-12 px-6" dir="rtl">
            <div className="container mx-auto max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12 border-b pb-12">
                    <div className="relative">
                        <img
                            src={talent.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"}
                            className="w-48 h-48 rounded-full border-4 border-gray-50 object-cover shadow-lg"
                            alt={talent.full_name}
                        />
                        <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                    </div>

                    <div className="flex-1 text-center md:text-right">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-4xl font-black text-gray-900">{talent.full_name}</h1>
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> موثق الهوية
                            </span>
                        </div>
                        <p className="text-blue-600 font-bold text-xl mb-4">{talent.job_title}</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-500 font-bold text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gray-300" /> {talent.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-300 font-light">|</span> الجنسية: {talent.nationality || 'غير محدد'}
                            </div>
                        </div>

                        <ContactSection email={talent.email} phone={talent.phone} />
                    </div>
                </div>

                {/* Bio Section */}
                <div className="bg-gray-50 rounded-[40px] p-12 mb-8">
                    <h2 className="text-2xl font-black mb-6 text-gray-900">نبذة عني</h2>
                    <p className="text-gray-600 leading-relaxed text-lg italic">
                        "{talent.bio || 'لا توجد نبذة شخصية متاحة حالياً.'}"
                    </p>
                </div>

                {/* Skills Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm">
                        <h2 className="text-xl font-black mb-8 text-gray-900 text-center">المهارات والقدرات</h2>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {talent.skills?.map((skill: string, index: number) => (
                                <span key={index} className="bg-white border border-gray-200 px-5 py-2 rounded-xl text-sm font-bold text-gray-600 shadow-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* زر التعديل - يوجه المستخدم لصفحة الانضمام ليقوم بتحديث بياناته */}
                <div className="mt-12 pt-8 border-t border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 text-sm mb-4 font-bold">هل أنت صاحب هذا الملف؟</p>
                    <Link
                        href={`/talents/join?id=${talent.id}`}
                        className="inline-flex items-center gap-2 text-[#0084db] hover:underline font-black"
                    >
                        <Edit3 className="w-4 h-4" />
                        تعديل معلوماتي الشخصية
                    </Link>
                </div>
            </div>
        </div>
    );
}