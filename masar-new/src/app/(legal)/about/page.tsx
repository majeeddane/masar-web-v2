import { Building2, Globe2, Heart, ShieldCheck, Users } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900" dir="rtl">

            {/* Header Section */}
            <section className="bg-blue-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">عن مسار</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        نحن نعيد تعريف طريقة التوظيف في الشرق الأوسط. منصة ذكية تربط الموهبة بالفرصة.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-blue-950 mb-6">مهمتنا</h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                في مسار، نؤمن بأن كل شخص يستحق وظيفة تناسب شغفه ومهاراته. مهمتنا هي إزالة الحواجز التقليدية في عملية التوظيف باستخدام الذكاء الاصطناعي والتقنيات الحديثة.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><ShieldCheck className="w-6 h-6" /></div>
                                    <span className="font-bold text-slate-700">موثوقية وأمان عالي</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-teal-50 p-3 rounded-lg text-teal-600"><Users className="w-6 h-6" /></div>
                                    <span className="font-bold text-slate-700">مجتمع مهني متكامل</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-50 p-3 rounded-lg text-purple-600"><Globe2 className="w-6 h-6" /></div>
                                    <span className="font-bold text-slate-700">تغطية شاملة للمملكة وخارجها</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-100 rounded-3xl h-[400px] w-full flex items-center justify-center text-slate-300">
                            <Building2 className="w-32 h-32" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 bg-white rounded-2xl shadow-sm">
                        <div className="text-4xl font-bold text-blue-600 mb-2">+50K</div>
                        <div className="text-slate-500 font-medium">باحث عن عمل</div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl shadow-sm">
                        <div className="text-4xl font-bold text-teal-600 mb-2">+1200</div>
                        <div className="text-slate-500 font-medium">شركة مسجلة</div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl shadow-sm">
                        <div className="text-4xl font-bold text-purple-600 mb-2">+500</div>
                        <div className="text-slate-500 font-medium">وظيفة يومياً</div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 text-center">
                <h2 className="text-3xl font-bold text-blue-950 mb-6">انضم إلى عائلة مسار</h2>
                <p className="text-slate-600 mb-8 max-w-xl mx-auto">سواء كنت تبحث عن وظيفة أحلامك أو تبحث عن المواهب، نحن هنا لخدمتك.</p>
                <button className="bg-blue-900 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-800 transition-colors">
                    ابدأ الآن مجاناً
                </button>
            </section>

        </div>
    );
}
