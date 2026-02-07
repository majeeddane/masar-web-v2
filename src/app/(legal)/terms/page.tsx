export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12" dir="rtl">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-blue-950 mb-8 border-b border-slate-100 pb-4">الشروط والأحكام</h1>
                    <div className="space-y-6 text-slate-700">
                        <p>مرحباً بك في مسار. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بشروط الاستخدام التالية:</p>

                        <h3 className="text-lg font-bold text-blue-900">1. استخدام الموقع</h3>
                        <p>يجب استخدام الموقع لأغراض قانونية فقط. يُحظر نشر أي محتوى مسيء أو مضلل أو ينتهك حقوق الآخرين.</p>

                        <h3 className="text-lg font-bold text-blue-900">2. حقوق الملكية الفكرية</h3>
                        <p>جميع المحتويات الموجودة على الموقع هي ملك لـ "مسار" أو الجهات المرخصة لها، وهي محمية بموجب قوانين حقوق النشر.</p>

                        <h3 className="text-lg font-bold text-blue-900">3. إخلاء المسؤولية</h3>
                        <p>نحن نسعى لضمان دقة المعلومات، ولكننا لا نقدم أي ضمانات صريحة أو ضمنية بشأن صحة أو اكتمال المحتوى.</p>

                        <h3 className="text-lg font-bold text-blue-900">4. التعديلات</h3>
                        <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرارك في استخدام الموقع يعني قبولك للتعديلات.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
