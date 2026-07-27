'use client';

import { FileText, Plus, Briefcase, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function MyJobsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">وظائفي المنشورة</h1>
                        <p className="text-slate-500 font-medium">إدارة ومتابعة الوظائف التي قمت بنشرها.</p>
                    </div>
                    <Link href="/jobs/new" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-emerald-500 transition-all">
                        <Plus className="w-5 h-5" /> نشر وظيفة جديدة
                    </Link>
                </div>

                {/* حالة عدم وجود وظائف (يمكنك استبدالها بجلب البيانات لاحقاً) */}
                <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">لا توجد وظائف بعد</h2>
                    <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm font-bold">لم تقم بنشر أي وظيفة شاغرة حتى الآن. ابدأ الآن واستقطب الكفاءات.</p>
                    <Link href="/jobs/new" className="text-emerald-600 font-black hover:underline">
                        اضغط هنا لنشر أول وظيفة لك
                    </Link>
                </div>
            </div>
        </div>
    );
}