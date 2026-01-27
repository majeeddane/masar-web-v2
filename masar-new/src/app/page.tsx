import Link from 'next/link';
import { Briefcase, Search, MapPin, LogIn, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900" dir="rtl">

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white border-b border-gray-100 shadow-sm transition-all h-20 flex items-center">
        <div className="container mx-auto px-6 flex items-center justify-between">

          {/* Logo & Navigation */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:bg-blue-800 transition-colors">
                <Briefcase className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-3xl font-black text-blue-900 tracking-tight">مسار</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8 font-bold text-gray-600">
              <Link href="/" className="text-blue-700">الرئيسية</Link>
              <Link href="/jobs" className="hover:text-blue-700 transition-colors">تصفح الوظائف</Link>
              <Link href="/companies" className="hover:text-blue-700 transition-colors">دليل الشركات</Link>
              <Link href="/blog" className="hover:text-blue-700 transition-colors">المقالات</Link>
            </div>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                لوحة التحكم
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-2 text-gray-600 font-bold hover:text-blue-700 px-4 py-2"
                >
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                >
                  حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-48 lg:min-h-[600px] flex items-center bg-blue-900 border-b-8 border-blue-500 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop"
            alt="Office Background"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-blue-900/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center md:text-right">
          <div className="max-w-3xl mr-auto md:mr-0">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-sm">
              وظّف أفضل الخبرات <br />
              <span className="text-blue-300">من أي مكان</span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 mb-10 leading-relaxed font-medium max-w-2xl opacity-90">
              أعلن عن وظائفك الشاغرة ووظف أفضل الكفاءات والمهارات التي تحتاجها للعمل في شركتك مجاناً دون التقيد بمنطقة جغرافية محددة.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/post/job"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1"
              >
                <Briefcase className="w-5 h-5" />
                أضف وظيفة مجاناً
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Search Bar */}
      <div className="relative -mt-24 z-20 container mx-auto px-6 mb-20">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
          <form className="flex flex-col md:flex-row items-center gap-4">

            {/* Input: Job Title */}
            <div className="w-full relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="المسمى الوظيفي..."
                className="w-full h-14 pr-12 pl-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 hover:bg-white hover:border-gray-200 rounded-xl outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Select: City */}
            <div className="w-full md:w-1/3 relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <MapPin className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <select className="w-full h-14 pr-12 pl-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 hover:bg-white hover:border-gray-200 rounded-xl outline-none transition-all font-medium text-gray-900 cursor-pointer appearance-none">
                <option value="">كل المدن</option>
                <option value="riyadh">الرياض</option>
                <option value="jeddah">جدة</option>
                <option value="dammam">الدمام</option>
              </select>
            </div>

            {/* Submit Button */}
            <button className="w-full md:w-auto px-10 h-14 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
              بحث
            </button>
          </form>
        </div>
      </div>

      {/* Footer Spacer */}
      <div className="h-20"></div>

    </div>
  );
}
