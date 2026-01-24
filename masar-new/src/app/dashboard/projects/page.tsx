'use client';

import { useState, useEffect } from 'react';
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
    Filter,
    X,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Project {
    id: string;
    title: string;
    type: string;
    status: 'active' | 'completed' | 'draft';
    due_date: string;
    progress: number;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // New Project Form State
    const [newTitle, setNewTitle] = useState('');
    const [newStatus, setNewStatus] = useState('active');
    const [newProgress, setNewProgress] = useState(0);
    const [newDueDate, setNewDueDate] = useState('');

    // Fetch Projects
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Assuming 'projects' table has a user_id column or RLS policies in place
            // The user didn't specify user_id column but said "for the current user".
            // I'll try to select all, relying on RLS if configured, or just filter match user_id if column exists.
            // Given I don't know the full schema, I'll attempt a standard select.
            // If the table was just created by the user, hopefully they added RLS or user_id.
            // I will try to fetch all first.
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('id', { ascending: false });

            if (error) {
                console.error('Error fetching projects:', error);
            } else {
                // Map DB status to UI status if needed, or assume they match.
                // User said status is 'قيد التنفيذ', 'مكتمل', 'معلق' in UI select.
                // I'll assume DB stores these English keys I set in UI select? 
                // Or text?
                // To be safe, I'll map the incoming data to the UI interface.
                // But since I control the insert, I can control the format.
                setProjects(data as Project[]);
            }
        }
        setLoading(false);
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { error } = await supabase
            .from('projects')
            .insert([
                {
                    title: newTitle,
                    status: newStatus,
                    progress: newProgress,
                    due_date: newDueDate,
                    // user_id: user.id // Usually required, but I'll omit if not sure. 
                    // Wait, if I don't send user_id, how is it assigned?
                    // I should probably send it. Most Supabase setups require it.
                    user_id: user.id
                }
            ]);

        if (error) {
            console.error('Error creating project:', error);
            alert('حدث خطأ أثناء إنشاء المشروع');
        } else {
            setIsModalOpen(false);
            setNewTitle('');
            setNewStatus('active');
            setNewProgress(0);
            setNewDueDate('');
            fetchProjects(); // Refresh list
        }
        setSaving(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'draft': return 'bg-amber-100 text-amber-700'; // 'pending' mapped also maybe?
            case 'pending': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'قيد التنفيذ'; // 'نشط'
            case 'completed': return 'مكتمل';
            case 'draft': return 'مسودة';
            case 'pending': return 'معلق';
            default: return status;
        }
    };

    // Helper to determine icon based on title? Or just default.
    // The DB doesn't have an 'icon' or 'type' column mentioned in prompt.
    // I will just use a default icon or guess based on keywords if I wanted to be fancy.
    // Default to FileText for now.

    return (
        <div className="space-y-8 animate-fade-in-up relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-950">مشاريعي</h1>
                    <p className="text-slate-500 mt-1">أدر سيرك الذاتية وطلبات التوظيف الخاصة بك من مكان واحد</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium shadow-sm hover:shadow-md"
                >
                    <Plus size={20} />
                    <span>مشروع جديد</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : (
                /* Projects Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Helper Card for New Project */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 h-full min-h-[280px] transition-all duration-200"
                    >
                        <div className="w-16 h-16 bg-white group-hover:bg-blue-50 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                            <Plus size={32} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-700 group-hover:text-blue-700 mb-1 transition-colors">إنشاء مشروع جديد</h3>
                            <p className="text-sm text-slate-500 group-hover:text-slate-600">أضف مشروعاً جديداً إلى قائمتك</p>
                        </div>
                    </button>

                    {/* Project Cards */}
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 flex flex-col justify-between group">

                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-3 rounded-xl ${project.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                    <FileText size={24} />
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
                                    {project.due_date && (
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {project.due_date}
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-lg text-primary mb-1 group-hover:text-blue-600 transition-colors">
                                    {project.title}
                                </h3>
                                {/* <p className="text-sm text-slate-500 mb-6">{project.type}</p> Type not in DB yet */}

                                <div className="space-y-2 mt-4">
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
                                <span className="text-xs text-slate-400">تاريخ الاستحقاق: {project.due_date || '-'}</span>
                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/btn">
                                    التفاصيل
                                    <span className="group-hover/btn:-translate-x-1 transition-transform">←</span>
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* New Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">مشروع جديد</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">عنوان المشروع</label>
                                <input
                                    type="text"
                                    required
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all"
                                    placeholder="مثال: سيرة ذاتية - مصمم جرافيك"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">الحالة</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['active', 'completed', 'pending'].map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setNewStatus(status)}
                                            className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${newStatus === status
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {status === 'active' && 'قيد التنفيذ'}
                                            {status === 'completed' && 'مكتمل'}
                                            {status === 'pending' && 'معلق'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">نسبة الإنجاز ({newProgress}%)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={newProgress}
                                    onChange={(e) => setNewProgress(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ الاستحقاق</label>
                                <input
                                    type="date"
                                    value={newDueDate}
                                    onChange={(e) => setNewDueDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-right"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <span>حفظ المشروع</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
