import Link from 'next/link';
import {
  Briefcase, Users, Building2, MapPin,
  ArrowRight, Star, FileCheck, Zap,
  Code, PenTool, BarChart3, Stethoscope, HardHat,
  MessageCircle, FileText
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-right" dir="rtl">

      {/* 1. Hero Section (First Impression) */}
      <div className="relative bg-white overflow-hidden">
        {/* Subtle Navy Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-teal-50/30 opacity-70"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10 flex flex-col items-center text-center">
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
              <span>أنا صاحب عمل (وظّف الآن)</span>
            </Link>

            {/* Seeker CTA */}
            <Link
              href="/jobs"
              className="group flex-1 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-100 hover:border-[#115d9a] text-lg font-bold py-4 px-8 rounded-3xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Briefcase className="h-6 w-6 text-teal-600" />
              <span>أنا أبحث عن عمل</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Trust & Stats Bar */}
      <div className="bg-[#115d9a] text-white py-12 relative z-20 shadow-lg -mt-10 mx-4 md:mx-auto max-w-6xl rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-blue-400/30">

          <div className="flex flex-col items-center justify-center gap-2 group">
            <Briefcase className="h-8 w-8 text-blue-200 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-4xl font-black font-numeric">+250</h3>
            <p className="text-blue-100 font-medium">فرصة وظيفية نشطة</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 group">
            <Users className="h-8 w-8 text-teal-300 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-4xl font-black font-numeric">+1,200</h3>
            <p className="text-blue-100 font-medium">كفاءة مهنية مسجلة</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 group">
            <MapPin className="h-8 w-8 text-purple-300 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-4xl font-black font-numeric">18</h3>
            <p className="text-blue-100 font-medium">مدينة سعودية مغطاة</p>
          </div>

        </div>
      </div>

      {/* 3. Why Masar? (Value Props) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">لماذا تختار مسار؟</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            صممنا المنصة لتختصر عليك الوقت والجهد، بأدوات ذكية تخدم هدفك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-gray-50 hover:bg-white rounded-[2rem] p-10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group">
            <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/5 mb-8 group-hover:bg-blue-50 transition-colors">
              <MapPin className="h-10 w-10 text-[#115d9a]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">توظيف محلي دقيق</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              استهدف المدن التي تحتاجها بدقة. سواء كنت في الرياض، جدة، أو الدمام، نصلك بالكفاءات والفرص الأقرب إليك.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-50 hover:bg-white rounded-[2rem] p-10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group">
            <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/5 mb-8 group-hover:bg-teal-50 transition-colors">
              <MessageCircle className="h-10 w-10 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">تواصل مباشر</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              نظام دردشة فورية متكامل ونظام تقديم رسمي يضمن لك متابعة حالة طلبك أولاً بأول دون وسطاء.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-50 hover:bg-white rounded-[2rem] p-10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group">
            <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/5 mb-8 group-hover:bg-purple-50 transition-colors">
              <FileText className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">سيرة رقمية احترافية</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              ملف شخصي احترافي يغنيك عن الـ PDF التقليدي. اعرض مهاراتك، خبراتك، ونبذة عنك برابط واحد قابل للمشاركة.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Category Quick-Access */}
      <div className="bg-[#f8fafc] py-24">
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

          <div className="text-center mt-12">
            <Link href="/jobs" className="text-[#115d9a] font-bold hover:underline inline-flex items-center gap-2 text-lg">
              تصفح جميع التخصصات والوظائف <ArrowRight className="h-5 w-5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">جاهز لبدء قصتك؟</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-[#115d9a] hover:bg-[#0e4d82] text-white text-xl font-bold py-5 px-12 rounded-full shadow-xl shadow-blue-900/20 transition-all hover:scale-105"
            >
              سجّل الآن مجاناً
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}