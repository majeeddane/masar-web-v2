
import Link from 'next/link';
import { Briefcase, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import SearchForm from '@/components/SearchForm';
import { getJobs } from '@/lib/jobs';
import JobCard from '@/components/JobCard';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    type?: string;
    level?: string;
    date?: string;
    page?: string;
  }>;
}

export default async function LandingPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const limit = 12; // Load 12 jobs per page
  const offset = (page - 1) * limit;

  // Fetch active jobs (Server Side)
  const jobs = await getJobs({
    q: searchParams.q,
    city: searchParams.city,
    type: searchParams.type,
    level: searchParams.level,
    date: searchParams.date,
    limit: limit,
    offset: offset
  });

  const hasNextPage = jobs.length === limit;

  // Helper to build pagination links
  const getPageLink = (newPage: number) => {
    const params = new URLSearchParams(searchParams as any);
    params.set('page', newPage.toString());
    return `/?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900" dir="rtl">

      {/* Hero Section */}
      <header className="relative pt-32 pb-48 lg:min-h-[500px] flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000&auto=format&fit=crop"
            alt="Office Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-950/90 to-gray-50" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl text-white mb-6 leading-tight tracking-tight drop-shadow-2xl font-bold">
            اعثر على وظيفتك القادمة في <span className="text-blue-500">مسار</span>
          </h1>
          <p className="text-blue-100/90 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            منصة التوظيف الأحدث في المملكة. نربط أفضل الكفاءات بأرقى الشركات.
          </p>
        </div>
      </header>

      {/* Search Bar (Floating) */}
      <div className="container mx-auto px-4 relative z-20 -mt-24">
        {/* Use basePath='/' so searching stays on the home page */}
        <SearchForm basePath="/" />
      </div>

      {/* Jobs Feed */}
      <section className="py-12 bg-gray-50 min-h-[500px]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                {searchParams.q ? `نتائج البحث عن "${searchParams.q}"` :
                  searchParams.date === 'today' ? 'وظائف اليوم' : 'أحدث الوظائف'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                عرض {jobs.length} وظيفة في هذه الصفحة
              </p>
            </div>
            {!searchParams.q && !searchParams.date && (
              <Link href="/jobs" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
                تصفح كل الوظائف ←
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.length > 0 ? jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            )) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">عذراً، لا توجد وظائف تطابق بحثك حالياً</h3>
                <p className="text-gray-500 max-w-md mx-auto">حاول استخدام كلمات مفتاحية مختلفة أو إزالة بعض الفلاتر لرؤية المزيد من النتائج.</p>
                <Link href="/" className="mt-6 inline-flex items-center text-blue-600 font-bold bg-blue-50 px-6 py-3 rounded-xl hover:bg-blue-100 transition-colors">
                  عرض جميع الوظائف
                </Link>
              </div>
            )}
          </div>

          {/* Pagination */}
          {(page > 1 || hasNextPage) && (
            <div className="flex justify-center items-center gap-4 mt-12">
              {page > 1 && (
                <Link
                  href={getPageLink(page - 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                  السابق
                </Link>
              )}

              <span className="text-gray-400 font-bold px-4">الصفحة {page}</span>

              {hasNextPage && (
                <Link
                  href={getPageLink(page + 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  التالي
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              )}
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tighter">مسار</h3>
          <p className="text-gray-500 text-sm">© 2026 جميع الحقوق محفوظة.</p>
        </div>
      </footer>

    </div>
  );
}
