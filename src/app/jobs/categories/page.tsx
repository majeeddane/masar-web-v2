import Link from 'next/link';
import { Code2, PenTool, Database, LineChart, Stethoscope, Landmark, Cog, GraduationCap } from 'lucide-react';

const CATEGORIES = [
    { name: 'التكنولوجيا والبرمجة', icon: Code2, count: 120, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'التصميم والإبداع', icon: PenTool, count: 85, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'البيانات والذكاء الاصطناعي', icon: Database, count: 45, color: 'text-teal-600', bg: 'bg-teal-50' },
    { name: 'التسويق والمبيعات', icon: LineChart, count: 200, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'الطب والرعاية الصحية', icon: Stethoscope, count: 150, color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'المحاسبة والمالية', icon: Landmark, count: 90, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'الهندسة', icon: Cog, count: 110, color: 'text-slate-600', bg: 'bg-slate-100' },
    { name: 'التعليم والتدريب', icon: GraduationCap, count: 60, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-20" dir="rtl">
            <div className="container mx-auto px-6">

                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-blue-950 mb-4">تصفح الوظائف حسب التخصص</h1>
                    <p className="text-xl text-slate-600">اكتشف الفرص المتاحة في مجالك المفضل</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {CATEGORIES.map((cat, i) => (
                        <Link href="/dashboard/jobs" key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-center">
                            <div className={`w-16 h-16 ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">{cat.name}</h3>
                            <p className="text-slate-400 text-sm font-medium">{cat.count} وظيفة متاحة</p>
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
}
