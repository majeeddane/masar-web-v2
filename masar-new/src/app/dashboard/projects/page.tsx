'use client';

import { useState } from 'react';
import {
    Plus,
    FileText,
    MoreVertical,
    Clock,
    CheckCircle2,
    AlertCircle,
    Briefcase,
    PenTool,
    Search,
    Filter
} from 'lucide-react';
import Link from 'next/link';

interface Project {
    id: string;
    title: string;
    type: string;
    status: 'active' | 'completed' | 'draft';
    date: string;
    progress: number;
    icon: React.ElementType;
}

export default function ProjectsPage() {
    const [projects] = useState<Project[]>([
        {
            id: '1',
            title: 'السيرة الذاتية - مطور واجهات',
            type: 'سيرة ذاتية',
            status: 'active',
            date: '2024-01-20',
            progress: 75,
            icon: FileText
        },
        {
            id: '2',
            title: 'طلب توظيف - شركة تقنية',
            type: 'رسالة تغطية',
            status: 'draft',
            date: '2024-01-22',
            progress: 30,
            icon: PenTool
        },
        {
            id: '3',
            title: 'ملف باحث عن عمل',
            type: 'ملف شامل',
            status: 'completed',
            date: '2024-01-15',
            progress: 100,
            icon: Briefcase
        },
    ]);

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'draft': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: Project['status']) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'completed': return 'مكتمل';
            case 'draft': return 'مسودة';
            default: return status;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-950">مشاريعي</h1>
                    <p className="text-slate-500 mt-1">أدر سيرك الذاتية وطلبات التوظيف الخاصة بك من مكان واحد</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium shadow-sm hover:shadow-md">
                    <Plus size={20} />
                    <span>مشروع جديد</span>
                </button>
            </div>

            {/* Filters & Search (Optional but good for UI) */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-fit max-w-full overflow-x-auto">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium whitespace-nowrap">
                    الكل
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium whitespace-nowrap transition-colors">
                    سير ذاتية
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium whitespace-nowrap transition-colors">
                    رسائل تغطية
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button className="text-slate-400 hover:text-blue-600 p-1.5 transition-colors">
                    <Search size={18} />
                </button>
                <button className="text-slate-400 hover:text-blue-600 p-1.5 transition-colors">
                    <Filter size={18} />
                </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Helper Card for New Project */}
                <button className="group flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 h-full min-h-[280px] transition-all duration-200">
                    <div className="w-16 h-16 bg-white group-hover:bg-blue-50 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                        <Plus size={32} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-slate-700 group-hover:text-blue-700 mb-1 transition-colors">إنشاء مشروع جديد</h3>
                        <p className="text-sm text-slate-500 group-hover:text-slate-600">ابدأ بسيرة ذاتية جديدة أو رسالة تغطية</p>
                    </div>
                </button>

                {/* Project Cards */}
                {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 flex flex-col justify-between group">

                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-3 rounded-xl ${project.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                <project.icon size={24} />
                            </div>
                            <button className="text-slate-300 hover:text-slate-600 transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                                    {getStatusLabel(project.status)}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    {project.date}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg text-primary mb-1 group-hover:text-blue-600 transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">{project.type}</p>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-500 font-medium">
                                    <span>الاكتمال</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${project.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-400">آخر تعديل: منذ يومين</span>
                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/btn">
                                تحرير
                                <span className="group-hover/btn:-translate-x-1 transition-transform">←</span>
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
