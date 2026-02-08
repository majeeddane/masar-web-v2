import Link from 'next/link';
import { ShieldCheck, Rocket, Users, Target, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900" dir="rtl">

            {/* Hero Section */}
            <div className="bg-[#115d9a] text-white py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">عن مسار</h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-medium">
                        نبني جسوراً من الثقة بين الكفاءات الوطنية الطموحة وأصحاب العمل، لنساهم في تحقيق رؤية المملكة 2030.
                    </p>
                </div>
            </div>

            {/* Our Story */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#115d9a] font-bold text-sm">
                                <Target className="h-4 w-4" /> قصتنا
                            </div>
                            <h2 className="text-4xl font-black leading-tight">
                                رحلة بدأت من الحاجة إلى <span className="text-[#115d9a]">التميز</span>
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                تأسست منصة "مسار" لسد الفجوة في سوق التوظيف السعودي. لاحظنا أن أصحاب العمل يبحثون عن الجدية والالتزام، بينما يبحث الباحثون عن العمل عن فرص حقيقية وبيئة تقدر مهاراتهم.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                لذلك قمنا بابتكار نظام "التوثيق" المتقدم، وآليات الفلترة الذكية، لنضمن تجربة توظيف خالية من الضجيج، وسريعة النتائج. نحن لا نوفر مجرد وظائف، بل نبني مسارات مهنية.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-[#115d9a]/10 rounded-3xl -z-10 transform rotate-3"></div>
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Team working"
                                className="rounded-3xl shadow-2xl w-full object-cover h-[400px]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">قيمنا الراسخة</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            نؤمن بأن النجاح المستدام يبنى على أساس قوي من القيم والمبادئ.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "الثقة والتوثيق",
                                desc: "نلتزم بأعلى معايير المصداقية. نظام التوثيق لدينا يضمن أن الكفاءات حقيقية والفرص الوظيفية موثوقة."
                            },
                            {
                                icon: Rocket,
                                title: "السرعة والفعالية",
                                desc: "نقدر وقتك. صممنا منصتنا لتكون فائقة السرعة، من إنشاء السيرة الذاتية وحتى استلام عروض العمل."
                            },
                            {
                                icon: Users,
                                title: "المجتمع والنمو",
                                desc: "نحن أكثر من منصة توظيف. نحن مجتمع يدعم النمو المهني من خلال المقالات، النصائح، والتواصل المباشر."
                            }
                        ].map((value, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow text-center group">
                                <div className="w-16 h-16 bg-blue-50 text-[#115d9a] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <value.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {value.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-black mb-8">جاهز لبدء مسارك المهني؟</h2>
                    <Link href="/jobs" className="inline-flex items-center gap-2 bg-[#115d9a] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#0d4b7e] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        تصفح الوظائف الآن <ArrowLeft className="h-5 w-5" />
                    </Link>
                </div>
            </section>

        </div>
    );
}
