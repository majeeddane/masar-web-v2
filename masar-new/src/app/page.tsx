
import Link from 'next/link';
import { Briefcase, User, MapPin, LayoutDashboard, Clock } from 'lucide-react';
import SearchForm from '@/components/SearchForm';
import { getJobs } from '@/lib/jobs';
import JobCard from '@/components/JobCard';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  // Fetch active jobs (Cached)
  const jobs = await getJobs({ limit: 10 });
  const jobCount = 100 + jobs.length;
  const recentJobs = jobs || [];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900" dir="rtl">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <header className="relative pt-32 pb-40 lg:min-h-[600px] flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop"
            alt="Office Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-blue-950/80 to-transparent mix-blend-multiply" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center md:text-right">
          <div className="max-w-3xl mr-auto md:mr-0">
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-md">
              <span className="block mb-2">وظّف أفضل الخبرات</span>
              <span className="text-blue-400">من أي مكان</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-2xl mb-10 leading-relaxed font-medium md:max-w-2xl opacity-90">
              آلاف الوظائف الشاغرة بانتظارك من كبرى الشركات في المملكة.
            </p>

            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-2xl transition-all"
              >
                <Briefcase className="w-6 h-6" />
                <span>ابحث عن وظيفة</span>
              </Link>
              <Link
                href="/dashboard/employer"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 text-lg font-bold px-8 py-4 rounded-xl shadow-xl transition-all"
              >
                <User className="w-6 h-6" />
                <span>صاحب عمل؟</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar (Floating) */}
      <SearchForm />

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex justify-center gap-12 text-center text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-700">+{jobCount}</span>
              <span>وظيفة شاغرة</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-700">+500</span>
              <span>شركة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs Feed */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">أحدث الوظائف</h2>
              <p className="text-slate-500">تصفح أحدث الفرص الوظيفية المضافة اليوم</p>
            </div>
            <Link href="/jobs" className="text-blue-600 font-bold hover:underline">عرض الكل ←</Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {recentJobs.length > 0 ? recentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            )) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400">لا توجد وظائف حالياً</h3>
                <p className="text-gray-400">تأكد من تشغيل السكرابر أو إضافة وظائف يدوياً</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
        <div className="container mx-auto px-6 text-center">
          <p>© 2026 مسار. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

    </div>
  );
}
