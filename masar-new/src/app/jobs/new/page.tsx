'use client';

import { useState } from 'react';
import { createJob } from '@/lib/jobActions';
import { Briefcase, MapPin, DollarSign, Building2, Loader2, FileText } from 'lucide-react';

export default function NewJobPage() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const res = await createJob(formData);
        if (res?.error) {
            alert(res.error);
            setIsLoading(false);
        }
        // في حالة النجاح، سيقوم السيرفر بعمل Redirect تلقائياً
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">نشر وظيفة جديدة 💼</h1>
                    <p className="text-gray-500">ابحث عن أفضل الكفاءات لفريق عملك</p>
                </div>

                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12">
                    <form action={handleSubmit} className="space-y-8">

                        {/* عنوان الوظيفة والشركة */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-[#0084db]" /> مسمى الوظيفة
                                </label>
                                <input name="title" required placeholder="مثال: مصمم واجهات UX/UI" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-[#0084db]" /> اسم الشركة
                                </label>
                                <input name="company" required placeholder="اسم شركتك" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all" />
                            </div>
                        </div>

                        {/* الموقع والنوع */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#0084db]" /> موقع العمل
                                </label>
                                <select name="location" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all bg-white">
                                    <option value="الرياض">الرياض</option>
                                    <option value="جدة">جدة</option>
                                    <option value="الدمام">الدمام</option>
                                    <option value="عن بعد">عن بعد (Remotely)</option>
                                    <option value="موقع آخر">موقع آخر</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#0084db]" /> نوع الوظيفة
                                </label>
                                <select name="type" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all bg-white">
                                    <option value="دوام كامل">دوام كامل (Full-time)</option>
                                    <option value="دوام جزئي">دوام جزئي (Part-time)</option>
                                    <option value="عقد مشروع">عقد مشروع (Contract)</option>
                                    <option value="تدريب">تدريب (Internship)</option>
                                </select>
                            </div>
                        </div>

                        {/* الراتب (اختياري) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-[#0084db]" /> الراتب المتوقع (اختياري)
                            </label>
                            <input name="salary" placeholder="مثال: 5000 - 8000 ريال" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all" />
                        </div>

                        {/* الوصف */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">تفاصيل الوظيفة والمتطلبات</label>
                            <textarea name="description" required rows={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all resize-none" placeholder="اكتب وصفاً جذاباً للمهام المطلوبة والمهارات المتوقعة..." />
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-[#0084db] text-white font-black py-4 rounded-xl hover:bg-[#006bb3] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري النشر...</> : 'نشر الوظيفة الآن 🚀'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
