import Link from 'next/link';
import { Briefcase, User, ArrowRight } from 'lucide-react';

export default function PostSelectionPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900" dir="rtl">
            <div className="max-w-4xl w-full">

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-blue-950 mb-4">ماذا تريد أن تنشر اليوم؟</h1>
                    <p className="text-xl text-slate-500">اختر نوع الإعلان للبدء. النشر مجاني وفوري ⚡</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Option 1: Post a Job */}
                    <Link href="/post/job" className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-300 transition-all text-center">
                        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Briefcase className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">أعلن عن وظيفة</h2>
                        <p className="text-slate-500 mb-8">أبحث عن موظفين لشركتي</p>

                        <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center mx-auto group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-colors">
                            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                        </div>
                    </Link>

                    {/* Option 2: Post a CV */}
                    <Link href="/dashboard/cv" className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-teal-300 transition-all text-center">
                        <div className="absolute top-4 left-4 bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full animate-bounce">مطلوب جداً 🔥</div>
                        <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <User className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">أنشر سيرتي الذاتية</h2>
                        <p className="text-slate-500 mb-8">أبحث عن فرصة عمل</p>

                        <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center mx-auto group-hover:bg-teal-600 group-hover:border-teal-600 group-hover:text-white transition-colors">
                            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                        </div>
                    </Link>
                </div>

                <div className="text-center mt-12">
                    <Link href="/" className="text-slate-400 hover:text-slate-600 font-bold text-sm">العودة للرئيسية</Link>
                </div>

            </div>
        </div>
    );
}
