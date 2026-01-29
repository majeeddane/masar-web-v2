import Link from 'next/link';
import { Briefcase, User, Search, MapPin, Menu, X, CheckCircle, Building2, Globe, LogIn, LayoutDashboard, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabaseServer';
import SearchForm from '@/components/SearchForm';

export default async function LandingPage() {
  const supabase = await createClient();

  // Fetch active jobs
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch stats (optional lightweight alternative for now, real count later)
  const { count: jobCount } = await supabase.from('jobs').select('id', { count: 'exact', head: true });

  const recentJobs = jobs || [];

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

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              لوحة التحكم
            </Link>
          </div>
        </div>
      </nav>

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
              <span className="text-2xl font-bold text-blue-700">+{jobCount || 100}</span>
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
              <Link href={`/jobs/${job.seo_url || job.id}`} key={job.id} className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-1">{job.title}</h3>
                    <div className="flex gap-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.city || 'غير محدد'}</span>
                      {job.category && <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs">{job.category}</span>}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">جديد</span>
                </div>
                <div className="mb-4 text-sm text-slate-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: job.description?.substring(0, 150) + '...' }}></div>
                <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-50">
                  <span className="text-slate-500">{job.salary || 'راتب تنافسي'}</span>
                  <span className="flex items-center gap-1 text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(job.created_at).toLocaleDateString('ar-EG')}</span>
                  </span>
                </div>
              </Link>
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
