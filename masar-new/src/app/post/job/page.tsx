'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PostJobPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 1500);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
                <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">تم النشر بنجاح!</h2>
                    <p className="text-slate-500 mb-8">إعلانك أصبح مباشراً الآن. سيقوم فريقنا بمراجعته قريباً لضمان الجودة.</p>
                    <Link href="/dashboard" className="block w-full py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors">
                        الذهاب للوحة التحكم
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans text-slate-900" dir="rtl">
            <div className="max-w-3xl mx-auto">

                <Link href="/post" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8">
                    <ArrowRight className="w-5 h-5" />
                    رجوع
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-blue-900 text-white p-8">
                        <h1 className="text-2xl font-bold mb-2">نشر وظيفة جديدة</h1>
                        <p className="text-blue-100">املأ البيانات أدناه وسيتم نشر الوظيفة فوراً.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label mb-2 block font-bold text-sm text-slate-700">المسمى الوظيفي</label>
                                <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: مسوق إلكتروني" />
                            </div>
                            <div>
                                <label className="label mb-2 block font-bold text-sm text-slate-700">اسم الشركة</label>
                                <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="اسم شركتك" />
                            </div>
                        </div>

                        <div>
                            <label className="label mb-2 block font-bold text-sm text-slate-700">تفاصيل الوظيفة</label>
                            <textarea required rows={6} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="اكتب وصفاً جذاباً للمهام والمتطلبات..." />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label mb-2 block font-bold text-sm text-slate-700">الراتب المتوقع</label>
                                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: 5000 ريال" />
                            </div>
                            <div>
                                <label className="label mb-2 block font-bold text-sm text-slate-700">المدينة</label>
                                <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="الرياض، جدة..." />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        جاري النشر...
                                    </>
                                ) : (
                                    'نشر الوظيفة الآن (مجاناً)'
                                )}
                            </button>
                            <p className="text-center text-xs text-slate-400 mt-4">بضغطك على زر النشر، أنت توافق على شروط الاستخدام.</p>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
