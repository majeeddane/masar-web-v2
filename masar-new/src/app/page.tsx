import Link from 'next/link';
import { Briefcase, User, Search, MapPin, Menu, X, CheckCircle, Building2, Globe, LogIn, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabaseServer';

export default async function LandingPage() {
  // BYPASS: No auth check needed, we just show dashboard links

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900" dir="rtl">

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all h-20 flex items-center">
        <div className="container mx-auto px-6 flex items-center justify-between">

          {/* Logo & Main Links */}
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:bg-blue-800 transition-colors">
                <Briefcase className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-3xl font-black text-blue-950 tracking-tighter">مسار</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8 text-[15px] font-bold text-gray-600">
              <Link href="/" className="text-blue-700">الرئيسية</Link>
              <Link href="/dashboard" className="hover:text-blue-700 transition-colors">الوظائف</Link>
              <Link href="/companies" className="hover:text-blue-700 transition-colors">الدليل</Link>
              <Link href="/blog" className="hover:text-blue-700 transition-colors">المقالات</Link>
            </div>
          </div>

          {/* Auth Actions - BYPASS MODE */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              لوحة التحكم (مباشر)
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-40 lg:min-h-[700px] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop"
            alt="Office Background"
            className="w-full h-full object-cover opacity-40 md:opacity-100"
          />
          {/* Dark Blue Overlay */}
          <div className="absolute inset-0 bg-blue-950/85 md:bg-blue-900/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center md:text-right">
          <div className="max-w-3xl mr-auto md:mr-0">
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-md">
              <span className="block mb-2">وظّف أفضل الخبرات</span>
              <span className="text-blue-400">من أي مكان</span>
            </h1>

            <p className="text-blue-100 text-lg md:text-2xl mb-10 leading-relaxed font-medium md:max-w-2xl opacity-90">
              أعلن عن وظائفك الشاغرة ووظف أفضل الكفاءات والمهارات التي تحتاجها للعمل في شركتك مجاناً دون التقيد بمنطقة جغرافية محددة.
            </p>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold px-10 py-5 rounded-xl shadow-2xl hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1"
            >
              <Briefcase className="w-6 h-6" />
              <span>أضف وظيفة مجاناً</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Advanced Search Bar (Floating) */}
      <div className="relative -mt-20 z-20 container mx-auto px-6">
        <div className="bg-slate-900 p-4 md:p-6 rounded-2xl shadow-2xl border-t-4 border-blue-500 max-w-5xl mx-auto">
          <form className="flex flex-col md:flex-row gap-4">

            {/* Input 1: Job Title */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="المسمى الوظيفي، المهارات..."
                className="w-full h-14 pl-4 pr-12 rounded-xl border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-900 outline-none transition-all font-medium"
              />
            </div>

            {/* Input 2: City/Country */}
            <div className="flex-1 md:max-w-xs relative group">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <select className="w-full h-14 pl-4 pr-12 rounded-xl border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-900 outline-none transition-all font-medium appearance-none cursor-pointer">
                <option value="">اختار المدينة...</option>
                <option value="all">كل المدن</option>
                <option value="riyadh">الرياض</option>
                <option value="jeddah">جدة</option>
                <option value="dammam">الدمام</option>
              </select>
            </div>

            {/* Submit Button */}
            <Link href="/dashboard" className="h-14 md:w-48 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center">
              بحث
            </Link>

          </form>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x-0 md:divide-x md:divide-x-reverse divide-gray-100">
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-black text-blue-900 mb-2">+10,000</div>
              <p className="text-gray-500 font-bold">وظيفة متاحة</p>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-black text-blue-900 mb-2">+5,000</div>
              <p className="text-gray-500 font-bold">شركة مسجلة</p>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-black text-blue-900 mb-2">+150k</div>
              <p className="text-gray-500 font-bold">سيرة ذاتية</p>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-black text-blue-900 mb-2">24h</div>
              <p className="text-gray-500 font-bold">تحديث مستمر</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Spacer (for further sections) */}
      <div className="h-24 bg-gray-50"></div>

    </div>
  );
}
