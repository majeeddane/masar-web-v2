import Link from 'next/link';
import { Briefcase, User, Sparkles, FileText, BarChart3, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden" dir="rtl">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:bg-blue-800 transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-blue-950 tracking-tight">مسار</span>
          </Link>

          {/* Desktop Nav Links (Optional, added for completeness) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-blue-900 transition-colors">المميزات</Link>
            <Link href="#how-it-works" className="hover:text-blue-900 transition-colors">كيف يعمل</Link>
            <Link href="#pricing" className="hover:text-blue-900 transition-colors">الباقات</Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-blue-900 border border-blue-200 rounded-full hover:bg-blue-50 transition-all"
            >
              <User className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-900 rounded-full hover:bg-blue-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <span>ابدأ الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-slate-50">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-40"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>مدعوم بالذكاء الاصطناعي</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-blue-950 mb-6 leading-tight max-w-5xl mx-auto drop-shadow-sm text-balance">
            مسارك المهني، <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">بدعم الذكاء الاصطناعي</span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            ابنِ سيرتك الذاتية باحترافية، اعثر على وظائف تناسب مهاراتك الحقيقية، وانطلق نحو مستقبل مهني أفضل.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-100">
            <Link
              href="/dashboard/cv"
              className="w-full sm:w-auto px-8 py-4 bg-blue-900 text-white rounded-xl font-bold text-lg hover:bg-blue-800 shadow-lg hover:shadow-blue-900/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              <span>أنشئ سيرتك الذاتية</span>
            </Link>

            <Link
              href="/dashboard/jobs"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-900 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <Briefcase className="w-5 h-5" />
              <span>تصفح الوظائف</span>
            </Link>
          </div>

          {/* Dashboard Preview Image (Placeholder) */}
          <div className="mt-16 mx-auto max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-2 md:p-4 animate-fade-in-up delay-200 opacity-90 hidden md:block hover:opacity-100 transition-opacity">
            <div className="aspect-[16/9] bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 bg-[url('https://placehold.co/1200x675/f1f5f9/1e293b?text=Masar+Dashboard+Preview')] bg-cover bg-center">
              {/* This div is a placeholder for a real screenshot later */}
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-4">كل ما تحتاجه لنجاحك المهني</h2>
            <p className="text-slate-500 text-lg">أدوات متكاملة مصممة خصيصاً لتسريع نموك الوظيفي في سوق العمل السعودي.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-3">باني السيرة الذاتية</h3>
              <p className="text-slate-600 leading-relaxed">
                أنشئ سيرة ذاتية احترافية في دقائق باستخدام قوالب مصممة خصيصاً لتجتاز أنظمة الفرز الآلي (ATS).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-teal-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-3">مطابقة ذكية للوظائف</h3>
              <p className="text-slate-600 leading-relaxed">
                خوارزميات ذكية تربطك بالفرص الوظيفية التي تناسب مهاراتك وخبراتك بدقة عالية، وتوفر وقتك في البحث.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-purple-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-3">تحليلات المسار المهني</h3>
              <p className="text-slate-600 leading-relaxed">
                تتبع تقدمك، واعرف من شاهد ملفك، واحصل على رؤى قيمة لتحسين فرص قبولك في الوظائف.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trusted By (Optional addition for credibility) */}
      <section className="py-12 border-t border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-400 font-bold text-sm mb-8 tracking-wider uppercase">يثق بنا أكثر من 200 شركة رائدة</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Dummy Logos placeholders using text for now or simple SVGs if we had them */}
            <div className="text-2xl font-black text-slate-800">STC</div>
            <div className="text-2xl font-black text-slate-800">ARAMCO</div>
            <div className="text-2xl font-black text-slate-800">SABIC</div>
            <div className="text-2xl font-black text-slate-800">ELM</div>
            <div className="text-2xl font-black text-slate-800">NOON</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-blue-950">مسار</span>
            </div>

            <div className="flex items-center gap-6 text-slate-500 text-sm font-medium">
              <Link href="#" className="hover:text-blue-600 transition-colors">عن مسار</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">الوظائف</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">المدونة</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">سياسة الخصوصية</Link>
            </div>

            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} مسار. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
