'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin, Building2, Banknote, Sparkles, Filter, CheckCircle2, Clock, Briefcase, X, ChevronLeft, Share2 } from 'lucide-react';

// Enhanced Mock Data
const MOCK_JOBS = [
    {
        id: 1,
        title: 'مهندس برمجيات أول',
        company: 'شركة تقنية المستقبل',
        location: 'الرياض',
        salary: '18,000 - 22,000 ر.س',
        type: 'دوام كامل',
        postedAt: 'منذ يومين',
        matchScore: 98,
        logoColor: 'bg-blue-100',
        tags: ['React', 'Node.js', 'Team Lead'],
        description: 'نبحث عن مهندس برمجيات ذو خبرة لقيادة فريق التطوير لدينا. يجب أن يكون لديك خبرة قوية في React و Node.js وقدرة على توجيه المطورين المبتدئين.',
        requirements: ['خبرة 5+ سنوات', 'مهارات قيادية', 'إجادة اللغة الإنجليزية']
    },
    {
        id: 2,
        title: 'مطوّر واجهات مستخدم',
        company: 'حلول الويب المتقدمة',
        location: 'عن بعد',
        salary: '12,000 - 15,000 ر.س',
        type: 'دوام جزئي',
        postedAt: 'منذ 4 ساعات',
        matchScore: 92,
        logoColor: 'bg-teal-100',
        tags: ['Vue.js', 'Tailwind', 'UI/UX'],
        description: 'انضم إلينا لبناء واجهات مستخدم تفاعلية وجذابة. العمل مرن وعن بعد بالكامل.',
        requirements: ['خبرة في Vue.js', 'دقة في التصميم', 'التزام بالمواعيد']
    },
    {
        id: 3,
        title: 'مصمم تجربة مستخدم',
        company: 'إبداع للابتكار',
        location: 'جدة',
        salary: '10,000 - 14,000 ر.س',
        type: 'دوام كامل',
        postedAt: 'منذ أسبوع',
        matchScore: 85,
        logoColor: 'bg-purple-100',
        tags: ['Figma', 'Prototyping', 'User Research'],
        description: 'نبحث عن مصمم مبدع لتحويل الأفكار المعقدة إلى تجارب مستخدم سلسة وبسيطة.',
        requirements: ['ملف أعمال قوي', 'خبرة في Figma', 'فهم عميق لسلوك المستخدم']
    },
    {
        id: 4,
        title: 'مدير منتج تقني',
        company: 'سحابة الخليج',
        location: 'الدمام',
        salary: '25,000 - 30,000 ر.س',
        type: 'دوام كامل',
        postedAt: 'منذ 3 أيام',
        matchScore: 78,
        logoColor: 'bg-orange-100',
        tags: ['Agile', 'Jira', 'Product Strategy'],
        description: 'قم بقيادة استراتيجية المنتج لدينا من المفهوم إلى الإطلاق. فرصة رائعة للعمل مع فريق عالمي.',
        requirements: ['خبرة في إدارة المنتجات', 'خلفية تقنية', 'مهارات تواصل ممتازة']
    },
    {
        id: 5,
        title: 'مهندس بيانات',
        company: 'بياناتكم',
        location: 'الرياض',
        salary: '16,000 - 20,000 ر.س',
        type: 'عقد',
        postedAt: 'منذ 5 ساعات',
        matchScore: 95,
        logoColor: 'bg-indigo-100',
        tags: ['Python', 'SQL', 'Big Data'],
        description: 'نحتاج إلى مهندس بيانات لبناء وصيانة خطوط أنابيب البيانات الخاصة بنا.',
        requirements: ['خبرة في ETL', 'إتقان Python', 'معرفة بـ AWS']
    }
];

const FILTERS = ['الكل', 'عن بعد', 'دوام كامل', 'الرياض', 'الأعلى راتباً'];

export default function JobMatchesPage() {
    const [activeFilter, setActiveFilter] = useState('الكل');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState<typeof MOCK_JOBS[0] | null>(null);

    // Filter Logic
    const filteredJobs = useMemo(() => {
        let result = MOCK_JOBS;

        // 1. Text Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(job =>
                job.title.toLowerCase().includes(query) ||
                job.company.toLowerCase().includes(query) ||
                job.location.toLowerCase().includes(query)
            );
        }

        // 2. Category Filter
        if (activeFilter !== 'الكل') {
            if (activeFilter === 'الأعلى راتباً') {
                // Simple sort logic mock
                result = [...result].sort((a, b) => parseInt(b.salary) - parseInt(a.salary));
            } else {
                result = result.filter(job =>
                    job.type === activeFilter ||
                    job.location === activeFilter
                );
            }
        }

        return result;
    }, [activeFilter, searchQuery]);

    return (
        <div className="space-y-8 animate-fade-in-up relative min-h-screen">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-blue-950 mb-2">وظائف تناسبك ⚡</h1>
                    <p className="text-slate-500">تم اختيار هذه الوظائف بدقة بناءً على مهاراتك وسجلك المهني.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن مسمى وظيفي أو شركة..."
                        className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all group-hover:shadow-md"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex items-center gap-2 pl-4 text-slate-500 border-l border-slate-200 ml-2">
                    <Filter className="w-5 h-5" />
                    <span className="text-sm font-bold">تصفية:</span>
                </div>
                {FILTERS.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeFilter === filter
                            ? 'bg-blue-900 text-white border-blue-900 shadow-md transform scale-105'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Job Cards Grid */}
            {filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                    {filteredJobs.map((job) => (
                        <div key={job.id} onClick={() => setSelectedJob(job)} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden cursor-pointer">

                            {/* Hover Highlight Line */}
                            <div className="absolute top-0 right-0 w-1 h-0 bg-blue-600 group-hover:h-full transition-all duration-300"></div>

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
                                <div className={`w-16 h-16 ${job.logoColor} rounded-2xl flex items-center justify-center text-slate-700 shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-300`}>
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
                                <div className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span>نشر {job.postedAt}</span>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {job.tags.map((tag, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs rounded-md border border-slate-100 font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Action Button */}
                            <button className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                                <span>عرض التفاصيل</span>
                                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                            </button>

                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد وظائف مطابقة</h3>
                    <p className="text-slate-500">جرب تغيير كلمات البحث أو الفلاتر</p>
                    <button onClick={() => { setActiveFilter('الكل'); setSearchQuery(''); }} className="mt-6 text-blue-600 font-bold hover:underline">إعادة تعيين الفلاتر</button>
                </div>
            )}

            {/* Job Details Modal - Quick Implementation for God Mode Speed */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up md:p-8 p-6 relative">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedJob(null)}
                            className="absolute top-6 left-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-start gap-5 mb-8 pr-8 md:pr-0">
                            <div className={`w-20 h-20 ${selectedJob.logoColor} rounded-2xl flex items-center justify-center text-slate-700 shadow-sm shrink-0`}>
                                <Building2 className="w-10 h-10 opacity-70" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-blue-950 mb-2">{selectedJob.title}</h2>
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-slate-500 text-sm font-medium">
                                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {selectedJob.company}</span>
                                    <span className="hidden md:inline">•</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedJob.location}</span>
                                    <span className="hidden md:inline">•</span>
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedJob.postedAt}</span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-8">
                            <section>
                                <h3 className="font-bold text-lg text-slate-800 mb-3">عن الوظيفة</h3>
                                <p className="text-slate-600 leading-relaxed">{selectedJob.description}</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-lg text-slate-800 mb-3">المتطلبات</h3>
                                <ul className="space-y-2">
                                    {selectedJob.requirements?.map((req, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-600">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Sticky Bottom Actions */}
                            <div className="pt-6 border-t border-slate-100 flex gap-4">
                                <button className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2" onClick={() => alert('تم إرسال طلبك بنجاح! 🚀')}>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>التقديم الآن</span>
                                </button>
                                <button className="px-4 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                    </div>
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setSelectedJob(null)}></div>
                </div>
            )}
        </div>
    );
}
