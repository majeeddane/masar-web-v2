import { Briefcase, MapPin, Building2 } from 'lucide-react';

export default function JobMatchesPage() {
    const dummyJobs = [
        {
            title: 'مهندس برمجيات أول',
            company: 'شركة تقنية المستقبل',
            location: 'الرياض',
            type: 'دوام كامل',
            logo: 'bg-blue-100'
        },
        {
            title: 'مطوّر واجهات مستخدم',
            company: 'حلول الويب المتقدمة',
            location: 'جدة (عن بعد)',
            type: 'عقد',
            logo: 'bg-teal-100'
        },
        {
            title: 'مدير منتج',
            company: 'إبداع للابتكار',
            location: 'الدمام',
            type: 'دوام كامل',
            logo: 'bg-purple-100'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">الوظائف المقترحة لك</h2>
                <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-bold">ذكي</span>
            </div>

            <div className="grid gap-4">
                {dummyJobs.map((job, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                        <div className={`w-14 h-14 ${job.logo} rounded-xl flex items-center justify-center text-slate-700`}>
                            <Building2 className="w-7 h-7 opacity-50" />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800">{job.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                <span className="flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    {job.company}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium">
                                {job.type}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
