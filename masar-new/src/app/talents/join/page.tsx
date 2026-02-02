'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Adjusted import to use existing client
import { joinTalent } from '@/lib/talentActions'; // Server Action
import { ShieldCheck, Upload, FileText, Loader2 } from 'lucide-react';

export default function JoinPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams.get('id');

    const [isLoading, setIsLoading] = useState(false);
    const [existingCv, setExistingCv] = useState(''); // لعرض رسالة إذا كان هناك ملف سابق

    // حالة البيانات للنصوص فقط (للعرض والتعديل)
    const [formData, setFormData] = useState({
        fullName: '',
        jobTitle: '',
        location: '',
        nationality: '',
        bio: '',
        email: '',
        phone: '',
        skills: ''
    });

    // 1. جلب البيانات عند التعديل (Pre-fill)
    useEffect(() => {
        if (editId) {
            const fetchTalentData = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', editId)
                    .single();

                if (data && !error) {
                    setFormData({
                        fullName: data.full_name || '',
                        jobTitle: data.job_title || '',
                        location: data.location || '',
                        nationality: data.nationality || '',
                        bio: data.bio || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || ''
                    });
                    if (data.cv_url) setExistingCv(data.cv_url); // حفظ رابط الـ CV القديم
                }
            };
            fetchTalentData();
        }
    }, [editId]);

    // 2. دالة الحفظ الذكية (تتعامل مع الملفات تلقائياً)
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault(); // منع إعادة تحميل الصفحة
        setIsLoading(true);

        // ننشئ "حاوية شحن" جديدة (FormData) تحتوي على كل المدخلات بما فيها الملفات
        const formPayload = new FormData(event.currentTarget);

        // نضيف المهارات كـ JSON إذا لزم الأمر، أو نترك السيرفر يعالجها
        // (الكود الحالي في talentActions يعالج النصوص، لذا لا مشكلة)

        try {
            const result = await joinTalent(formPayload); // إرسال الشحنة للسيرفر

            if (result?.success) {
                alert('تم حفظ البيانات بنجاح! 🚀');
                router.push('/talents'); // العودة للقائمة
                router.refresh(); // تحديث البيانات
            } else {
                alert('حدث خطأ: ' + (result?.error || 'غير معروف'));
            }
        } catch (e) {
            console.error(e);
            alert('حدث خطأ في الاتصال');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <div className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-sm p-8 md:p-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-4">
                        {editId ? 'تحديث ملفك المهني' : 'أنشئ ملفك المهني'}
                    </h1>
                    <p className="text-gray-500">انضم لنخبة الكفاءات وابدأ رحلة نجاحك معنا</p>
                </div>

                {/* النموذج يبدأ هنا - لاحظ استخدام onSubmit */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* رفع الصورة (اختياري) */}
                    <div className="flex justify-center mb-8">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center group-hover:border-[#0084db] transition-all overflow-hidden">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#0084db]" />
                                {/* لاحظ الاسم avatar يطابق ما ينتظره السيرفر */}
                                <input type="file" name="avatar" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                            <p className="text-xs text-center mt-3 text-gray-400">رفع صورة</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-2">الاسم الكامل</label>
                            <input
                                name="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none"
                                placeholder="مثال: محمد أحمد"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-2">المسمى الوظيفي</label>
                            <input
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none"
                                placeholder="مثال: مصمم جرافيك"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-2">الموقع الجغرافي</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none"
                                placeholder="مثال: الرياض"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-2">الجنسية</label>
                            <input
                                name="nationality"
                                value={formData.nationality}
                                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none"
                                placeholder="مثال: سعودي"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">نبذة شخصية</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none"
                            placeholder="تحدث عن خبراتك..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-2">البريد الإلكتروني</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                readOnly={!!editId} // للقراءة فقط عند التعديل
                                className={`w-full px-4 py-3 rounded-xl border border-gray-200 outline-none ${editId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-[#0084db]'}`}
                                placeholder="example@mail.com"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-2">رقم الجوال</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none"
                                placeholder="0500000000"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">المهارات (افصل بينها بفاصلة)</label>
                        <input
                            name="skills"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none"
                            placeholder="تصميم، برمجة، إدارة..."
                        />
                    </div>

                    {/* --- قسم رفع السيرة الذاتية (المهم جداً) --- */}
                    <div className="border-t border-dashed pt-6 mt-6">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                            <FileText className="w-5 h-5 text-[#0084db]" />
                            السيرة الذاتية (PDF)
                        </label>

                        <div className="relative">
                            <input
                                type="file"
                                name="cv"  // هذا الاسم يجب أن يطابق formData.get('cv') في السيرفر
                                accept=".pdf"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                            />
                        </div>

                        {existingCv && (
                            <div className="mt-2 text-sm text-green-600 font-bold flex items-center gap-1 bg-green-50 p-2 rounded-lg inline-block">
                                <ShieldCheck className="w-4 h-4" />
                                يوجد سيرة ذاتية محفوظة حالياً (ارفع ملفاً جديداً لاستبدالها)
                            </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">يقبل ملفات PDF فقط بحجم أقصى 5 ميجابايت</p>
                    </div>
                    {/* ------------------------------------------- */}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#0084db] text-white font-black py-4 rounded-xl hover:bg-[#006bb3] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            editId ? 'حفظ التعديلات' : 'انضمام الآن'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}