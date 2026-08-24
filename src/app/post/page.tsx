import Link from 'next/link';
import { Briefcase, User, ArrowRight, Sparkles, FileText } from 'lucide-react';

export default function PostSelectionPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900 pt-8 pb-16" dir="rtl">
            <div className="max-w-4xl w-full">

                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 px-4 py-1.5 rounded-full text-[#115d9a] text-xs font-bold mb-3">
                        <Sparkles className="w-4 h-4 text-blue-600" /> منصة مسار للتوظيف
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-3">ماذا تريد أن تنشر اليوم؟</h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">اختر نوع الإعلان للبدء فوراً وبشكل مجاني وسريع ⚡</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Option 1: Post a Job */}
                    <Link href="/post/job" className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-400 transition-all text-center flex flex-col justify-between">
                        <div>
                            <div className="w-24 h-24 bg-blue-50 text-[#115d9a] rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                <Briefcase className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">أعلن عن وظيفة شاغرة</h2>
                            <p className="text-slate-500 mb-6 font-medium">أبحث عن موظفين وكفاءات متميزة لشركتي أو مشروعي</p>
                        </div>

                        <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center mx-auto group-hover:bg-[#115d9a] group-hover:border-[#115d9a] group-hover:text-white transition-colors mt-auto">
                            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                        </div>
                    </Link>

                    {/* Option 2: Post a Talent/CV Ad */}
                    <Link href="/talents/post" className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-purple-400 transition-all text-center flex flex-col justify-between">
                        <div className="absolute top-4 left-4 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">مطلوب للشركات 🔥</div>
                        <div>
                            <div className="w-24 h-24 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                <User className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">أنشر إعلاني وسيرتي الذاتية</h2>
                            <p className="text-slate-500 mb-6 font-medium">أبحث عن فرصة عمل وأريد عرض مهاراتي وخبراتي</p>
                        </div>

                        <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center mx-auto group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:text-white transition-colors mt-auto">
                            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                        </div>
                    </Link>
                </div>

                <div className="text-center mt-12 flex items-center justify-center gap-6">
                    <Link href="/dashboard/cv" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#115d9a] transition-colors">
                        <FileText className="w-4 h-4" /> بناء السيرة الذاتية بالذكاء الاصطناعي
                    </Link>
                    <span className="text-slate-300">•</span>
                    <Link href="/" className="text-slate-400 hover:text-slate-600 font-bold text-sm">
                        العودة للرئيسية
                    </Link>
                </div>

            </div>
        </div>
    );
}

