import Link from 'next/link';
import { ArrowRight, Calendar, User, Share2 } from 'lucide-react';

export default function BlogPost({ params }: { params: { slug: string } }) {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 py-20" dir="rtl">
            <article className="container mx-auto px-6 max-w-4xl">

                <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-bold text-sm">
                    <ArrowRight className="w-4 h-4" />
                    العودة للمدونة
                </Link>

                <header className="mb-12">
                    <div className="flex items-center gap-4 text-sm text-blue-600 font-bold mb-6">
                        <span className="bg-blue-50 px-4 py-1.5 rounded-full">نصائح مهنية</span>
                        <span className="text-slate-400">•</span>
                        <span>5 دقائق للقراءة</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-blue-950 mb-6 leading-tight">
                        كيف تكتب سيرة ذاتية احترافية في 2026؟
                    </h1>

                    <div className="flex items-center justify-between border-y border-slate-100 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                            <div>
                                <div className="font-bold text-slate-900">فريق مسار</div>
                                <div className="text-xs text-slate-500">26 يناير 2026</div>
                            </div>
                        </div>
                        <button className="p-3 rounded-full hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="prose prose-lg prose-blue max-w-none text-slate-700 leading-looose">
                    <p className="lead text-xl text-slate-900 font-medium mb-8">
                        في ظل المنافسة الشديدة في سوق العمل، لم تعد السيرة الذاتية التقليدية كافية. أنت بحاجة إلى وثيقة تسويقية تبيع مهاراتك.
                    </p>

                    <h3>1. البساطة هي المفتاح</h3>
                    <p>
                        تجنب التصاميم المعقدة والألوان الصارخة. استخدم خطوطاً واضحة مثل Cairo أو Roboto.
                    </p>

                    <h3>2. ركز على الإنجازات لا المهام</h3>
                    <p>
                        بدلاً من كتابة "كنت مسؤولاً عن المبيعات"، اكتب "حققت زيادة في المبيعات بنسبة 20%". الأرقام تتحدث بصوت أعلى.
                    </p>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 my-8">
                        <h4 className="font-bold text-blue-900 mb-2">💡 نصيحة ذهبية</h4>
                        <p className="text-blue-800 text-sm m-0">
                            استخدم نظام ATS-Friendly keywords الموجودة في الوصف الوظيفي لضمان مرور سيرتك عبر أنظمة الفرز الآلي.
                        </p>
                    </div>

                    <h3>3. التخصيص لكل وظيفة</h3>
                    <p>
                        لا ترسل نفس السيرة الذاتية لكل شركة. قم بتعديل الملخص والمهارات لتناسب الوظيفة المتقدم لها.
                    </p>
                </div>

            </article>
        </div>
    );
}
