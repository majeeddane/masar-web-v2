import Link from 'next/link';
import { ArrowLeft, User, Briefcase, ChevronDown } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo (Right side in RTL) */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:bg-blue-800 transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-blue-950 tracking-tight">مسار</span>
          </Link>

          {/* Login Button (Left side in RTL) */}
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-900 rounded-full hover:bg-blue-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <User className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white min-h-screen pt-20">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-[100px]" />

        <div className="container mx-auto px-6 py-20 text-center relative z-10 flex flex-col items-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800/50 border border-blue-700/50 backdrop-blur-md mb-8 text-blue-200 text-sm font-medium animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            منصتك الأولى للتطوير المهني
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight max-w-5xl mx-auto drop-shadow-xl text-balance">
            اكتشف <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">مسارك المهني</span> الصحيح
          </h1>

          <p className="text-lg md:text-2xl text-blue-100/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            نساعدك في بناء سيرة ذاتية احترافية واستكشاف الفرص الوظيفية التي تناسب طموحاتك ومهاراتك الحقيقية.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(45,212,191,0.5)] hover:shadow-[0_0_60px_-15px_rgba(45,212,191,0.6)] hover:scale-105 flex items-center justify-center gap-2 group"
            >
              <span>ابدأ الآن</span>
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md rounded-full font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
              <span>تعرف علينا</span>
              <ChevronDown className="w-5 h-5 opacity-60" />
            </button>
          </div>

          {/* Stats or Social Proof (Optional but adds 'Premium' feel) */}
          <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-center opacity-80">
            <div>
              <div className="text-3xl font-bold text-white mb-1">+٥٠٠٠</div>
              <div className="text-sm text-blue-200">وظيفة متاحة</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">+٢٠٠</div>
              <div className="text-sm text-blue-200">شريك توظيف</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">٩٨٪</div>
              <div className="text-sm text-blue-200">نسبة الرضا</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">٢٤/٧</div>
              <div className="text-sm text-blue-200">دعم مستمر</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
