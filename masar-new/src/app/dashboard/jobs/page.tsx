'use client';

import { useState } from 'react';
import { Search, MapPin, Building2, Banknote, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export default function JobMatchesPage() {
    const [activeFilter, setActiveFilter] = useState('الكل');

    const jobs = [
        {
            id: 1,
            title: 'مهندس برمجيات أول',
            company: 'شركة تقنية المستقبل',
            location: 'الرياض',
            salary: '18,000 - 22,000 ر.س',
            type: 'دوام كامل',
            matchScore: 98,
            logoColor: 'bg-blue-100',
            tags: ['React', 'Node.js', 'Team Lead']
        },
        {
            id: 2,
            title: 'مطوّر واجهات مستخدم',
            company: 'حلول الويب المتقدمة',
            location: 'عن بعد',
            salary: '12,000 - 15,000 ر.س',
            type: 'دوام جزئي',
            matchScore: 92,
            logoColor: 'bg-teal-100',
            tags: ['Vue.js', 'Tailwind', 'UI/UX']
        },
        {
            id: 3,
            title: 'مصمم تجربة مستخدم',
            company: 'إبداع للابتكار',
            location: 'جدة',
            salary: '10,000 - 14,000 ر.س',
            type: 'دوام كامل',
            matchScore: 85,
            logoColor: 'bg-purple-100',
            tags: ['Figma', 'Prototyping', 'User Research']
        },
        {
            id: 4,
            title: 'مدير منتج تقني',
            company: 'سحابة الخليج',
            location: 'الدمام',
            salary: '25,000 - 30,000 ر.س',
            type: 'دوام كامل',
            matchScore: 78,
            logoColor: 'bg-orange-100',
            tags: ['Agile', 'Jira', 'Product Strategy']
        },
        {
            id: 5,
            title: 'مهندس بيانات',
            company: 'بياناتكم',
            location: 'الرياض',
            salary: '16,000 - 20,000 ر.س',
            type: 'عقد',
            matchScore: 95,
            logoColor: 'bg-indigo-100',
            tags: ['Python', 'SQL', 'Big Data']
        }
    ];

    const filters = ['الكل', 'عن بعد', 'دوام كامل', 'الرياض', 'الأعلى راتباً'];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-blue-950 mb-2">وظائف تناسبك ⚡</h1>
                    <p className="text-slate-500">تم اختيار هذه الوظائف بدقة بناءً على مهاراتك وسجلك المهني.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="ابحث عن مسمى وظيفي أو شركة..."
                        className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
                <div className="flex items-center gap-2 pl-4 text-slate-500">
                    <Filter className="w-5 h-5" />
                    <span className="text-sm font-bold">تصفية:</span>
                </div>
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeFilter === filter
                                ? 'bg-blue-900 text-white border-blue-900 shadow-md transform scale-105'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group relative overflow-hidden">

                        {/* Match Score Badge */}
                        <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${job.matchScore >= 90
                                ? 'bg-teal-50 text-teal-700 border border-teal-100'
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                            }`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>تطابق {job.matchScore}%</span>
                        </div>

                        <div className="flex items-start gap-5 mb-6">
                            {/* Company Logo Placeholder */}
                            <div className={`w-16 h-16 ${job.logoColor} rounded-2xl flex items-center justify-center text-slate-700 shadow-inner shrink-0 group-hover:scale-105 transition-transform`}>
                                <Building2 className="w-8 h-8 opacity-60" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">{job.title}</h3>
                                <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                                    <span className="truncate">{job.company}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className="truncate">{job.type}</span>
                                </p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {job.location}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Banknote className="w-4 h-4 text-slate-400" />
                                <span dir="ltr">{job.salary}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {job.tags.map((tag, i) => (
                                <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs rounded-md border border-slate-100">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Action Button */}
                        <button className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>تقديم سريع</span>
                        </button>

                    </div>
                ))}
            </div>
        </div>
    );
}
