import Link from 'next/link';
import {
  Briefcase, Users, Building2, MapPin,
  ArrowRight, Star, ArrowLeft,
  Code, PenTool, BarChart3, Stethoscope, HardHat,
  MessageCircle, FileText, Newspaper, TrendingUp
} from 'lucide-react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function LandingPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 1. Fetch Stats
  const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const { count: companiesCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer');
  const { count: seekersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'job_seeker');

  // 2. Fetch Latest Jobs (Limit 4)
  const { data: latestJobs } = await supabase
    .from('jobs')
    .select('*, profiles(full_name, avatar_url)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(4);

  // 3. Fetch Latest Posts (Limit 3)
  const { data: latestPosts } = await supabase
    .from('posts')
    .select('id, title, excerpt, published_at, cover_image, category')
    .order('published_at', { ascending: false })
    .limit(3);

  return (
    <div className="min-h-screen bg-white font-sans text-right" dir="rtl">

      {/* 1. Hero Section (First Impression) */}
      <div className="relative bg-white overflow-hidden pb-12 lg:pb-0">
        {/* Subtle Navy Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-teal-50/30 opacity-70"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10 flex flex-col items-center text-center">
          <div className="bg-blue-50 text-[#115d9a] px-4 py-1.5 rounded-full text-sm font-bold mb-8 border border-blue-100 inline-flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm">
            <Star className="h-4 w-4 fill-[#115d9a] text-[#115d9a]" />
            منصة التوظيف الأذكى في المملكة
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            مسار: المنصة الأولى <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#115d9a] to-teal-500">
              لربط الكفاءات السعودية بأصحاب العمل
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 max-w-4xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            سوق وظائف ذكي، بسيط، ومباشر.
            <br className="hidden md:block" />
            سواء كنت شركة تبحث عن مبدعين أو باحثاً عن فرصة تليق بمهاراتك.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            {/* Employer CTA */}
            <Link
              href="/talents"
              className="group flex-1 bg-[#115d9a] hover:bg-[#0e4d82] text-white text-lg font-bold py-4 px-8 rounded-3xl transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Users className="h-6 w-6" />
              <span>بحث عن مرشحين</span>
            </Link>

            {/* Seeker CTA */}
            <Link
              href="/jobs"
              className="group flex-1 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-100 hover:border-[#115d9a] text-lg font-bold py-4 px-8 rounded-3xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Briefcase className="h-6 w-6 text-teal-600" />
              <span>تصفح الوظائف</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Trust & Stats Bar - DYNAMIC */}
      <div className="bg-[#115d9a] text-white py-12 relative z-20 shadow-lg -mt-4 mx-4 md:mx-auto max-w-6xl rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-blue-400/30">

          <div className="flex flex-col items-center justify-center gap-2 group">
            <Briefcase className="h-8 w-8 text-blue-200 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-4xl font-black font-numeric">+{jobsCount || 150}</h3>
            <p className="text-blue-100 font-medium">فرصة وظيفية متاحة</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 group">
            <Users className="h-8 w-8 text-teal-300 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-4xl font-black font-numeric">+{seekersCount || 500}</h3>
            <p className="text-blue-100 font-medium">كفاءة مهنية مسجلة</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 group">
            <Building2 className="h-8 w-8 text-purple-300 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-4xl font-black font-numeric">+{companiesCount || 50}</h3>
            <p className="text-blue-100 font-medium">شركة توظف عبر مسار</p>
          </div>

        </div>
      </div>

      {/* 3. Latest Jobs - DYNAMIC */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">أحدث الفرص الوظيفية</h2>
            <p className="text-gray-500">اكتشف الوظائف التي تم إضافتها مؤخراً</p>
          </div>
          <Link href="/jobs" className="hidden md:flex items-center gap-2 text-[#115d9a] font-bold hover:gap-3 transition-all">
            عرض كل الوظائف <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestJobs && latestJobs.length > 0 ? (
            latestJobs.map((job) => (
              <Link href={`/jobs/${job.id}`} key={job.id} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 block">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-[#115d9a] font-bold text-lg group-hover:bg-[#115d9a] group-hover:text-white transition-colors">
                    {job.company?.[0] || 'م'}
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
                    {new Date(job.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#115d9a] transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-1">{job.company} • {job.city}</p>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">{job.work_type}</span>
                  <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-lg font-medium">{job.salary_min ? `${job.salary_min} ر.س` : 'راتب تنافسي'}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد وظائف معلنة حالياً - كن أول من يعلن!</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-[#115d9a] font-bold">
            تصفح المزيد <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 4. Category Quick-Access (Static is fine for now) */}
      <div className="bg-[#f8fafc] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">تصفح حسب التخصص</h2>
            <p className="text-gray-500">أكثر المجالات طلباً في سوق العمل السعودي</p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { name: 'البرمجة والتطوير', icon: Code, color: 'text-blue-600' },
              { name: 'الهندسة', icon: HardHat, color: 'text-orange-600' },
              { name: 'التسويق والمبيعات', icon: BarChart3, color: 'text-green-600' },
              { name: 'التصميم والإبداع', icon: PenTool, color: 'text-purple-600' },
              { name: 'الطب والصحة', icon: Stethoscope, color: 'text-red-600' },
              { name: 'الإدارة والأعمال', icon: Briefcase, color: 'text-gray-600' },
            ].map((cat, idx) => (
              <Link
                href={`/jobs?category=${cat.name}`}
                key={idx}
                className="bg-white border border-gray-200 hover:border-[#115d9a] px-8 py-4 rounded-full font-bold flex items-center gap-3 transition-all hover:shadow-lg hover:-translate-y-1 group"
              >
                <cat.icon className={`h-5 w-5 ${cat.color} group-hover:scale-110 transition-transform`} />
                <span className="text-gray-700 group-hover:text-[#115d9a] transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Latest Insights (Blog) - DYNAMIC */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">مركز المعرفة</h2>
            <p className="text-gray-500">نصائح مهنية وأخبار تهم مسارك الوظيفي</p>
          </div>
          <Link href="/news" className="hidden md:flex items-center gap-2 text-[#115d9a] font-bold hover:gap-3 transition-all">
            المزيد من المقالات <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestPosts && latestPosts.length > 0 ? (
            latestPosts.map((post) => (
              <Link href={`/news/${post.id}`} key={post.id} className="group cursor-pointer">
                <div className="h-48 rounded-2xl bg-gray-100 overflow-hidden mb-4 relative">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <Newspaper className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm shadow-sm px-3 py-1 rounded-lg text-xs font-bold text-[#115d9a]">
                    {post.category || 'عام'}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span>{new Date(post.published_at).toLocaleDateString('ar-SA')}</span>
                  <span>•</span>
                  <span>5 دقائق قراءة</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#115d9a] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="text-gray-400">لا توجد مقالات منشورة بعد.</p>
            </div>
          )}
        </div>
      </div>

      {/* 6. Final CTA */}
      <div className="bg-[#115d9a] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">ابدأ مسارك المهني اليوم <br /> مع أفضل الشركات السعودية</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-[#115d9a] text-xl font-bold py-5 px-12 rounded-full shadow-2xl hover:bg-gray-50 transition-all hover:scale-105 hover:shadow-white/20"
            >
              سجّل الآن مجاناً
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}