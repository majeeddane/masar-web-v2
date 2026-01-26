import { Shield, Lock, FileText } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12" dir="rtl">
            <div className="container mx-auto px-6 max-w-4xl">

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-blue-950 mb-4">سياسة الخصوصية</h1>
                        <p className="text-slate-500">آخر تحديث: 26 يناير 2026</p>
                    </div>

                    <div className="space-y-8 text-slate-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                1. مقدمة
                            </h2>
                            <p>
                                نحن في "مسار" نولي اهتماماً كبيراً لخصوصيتك. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لمنصتنا.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                2. المعلومات التي نجمعها
                            </h2>
                            <ul className="list-disc list-inside space-y-2 mr-4">
                                <li>المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف، والسيرة الذاتية.</li>
                                <li>بيانات الاستخدام: كيفية تفاعلك مع الموقع، الصفحات التي تزورها، ونوع الجهاز.</li>
                                <li>الكوكيز (Cookies): نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتخصيص المحتوى.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-blue-900 mb-4">3. كيف نستخدم معلوماتك</h2>
                            <p>
                                نستخدم المعلومات لتقديم خدماتنا، تحسين المنصة، التواصل معك بشأن الفرص الوظيفية، ولأغراض التحليل والأمان. نحن لا نبيع بياناتك لأطراف ثالثة.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-blue-900 mb-4">4. أمن المعلومات</h2>
                            <p>
                                نحن نطبق إجراءات أمان صارمة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح. ومع ذلك، لا يوجد نظام آمن بنسبة 100% عبر الإنترنت.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-blue-900 mb-4">5. إعلانات Google AdSense</h2>
                            <p>
                                قد نستخدم شركات إعلان خارجية (مثل Google) لخدمة الإعلانات. قد تستخدم هذه الشركات معلومات حول زياراتك لهذا الموقع ومواقع الويب الأخرى لتقديم إعلانات حول السلع والخدمات التي تهمك.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-blue-900 mb-4">6. اتصل بنا</h2>
                            <p>
                                إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: support@masar-web.com
                            </p>
                        </section>
                    </div>
                </div>

            </div>
        </div>
    );
}
