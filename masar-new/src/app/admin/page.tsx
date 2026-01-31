'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { verifyAdminPassword, checkAdminSession, deleteJob, triggerScraper, updateJob } from './actions';
import {
    Lock, LayoutDashboard, Briefcase, Trash2, Edit, RefreshCw,
    Search, X, Save, CheckCircle, AlertCircle, Building2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    // --- State ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<any[]>([]);
    const [filter, setFilter] = useState('');
    const [scraping, setScraping] = useState(false);

    // Edit Modal State
    const [editingJob, setEditingJob] = useState<any>(null);

    // --- Stats ---
    const stats = {
        total: jobs.length,
        today: jobs.filter(j => new Date(j.created_at).toDateString() === new Date().toDateString()).length,
        riyadh: jobs.filter(j => j.city?.includes('Riyadh') || j.city?.includes('الرياض')).length
    };

    // --- Init ---
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        const isAuth = await checkAdminSession();
        setIsAuthenticated(isAuth);
        if (isAuth) fetchJobs();
        setLoading(false);
    };

    const fetchJobs = async () => {
        const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
        if (data) setJobs(data);
    };

    // --- Handlers ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await verifyAdminPassword(password);
        if (res.success) {
            setIsAuthenticated(true);
            fetchJobs();
        } else {
            alert(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return;
        try {
            await deleteJob(id);
            setJobs(jobs.filter(j => j.id !== id));
        } catch (e: any) {
            alert('فشل الحذف: ' + e.message);
        }
    };

    const handleScrape = async () => {
        setScraping(true);
        try {
            const res = await triggerScraper();
            if (res.success) {
                alert(`تم التحديث بنجاح! تم العثور على ${res.data.stats?.total} وظيفة.`);
                fetchJobs();
            } else {
                alert('فشل التحديث: ' + res.error);
            }
        } catch (e) {
            alert('خطأ غير متوقع');
        } finally {
            setScraping(false);
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingJob) return;
        try {
            await updateJob(editingJob.id, {
                title: editingJob.title,
                city: editingJob.city,
                company: editingJob.company_name, // Map UI to DB
                category: editingJob.category
            });
            setJobs(jobs.map(j => j.id === editingJob.id ? { ...j, ...editingJob, company_name: editingJob.company } : j));
            setEditingJob(null);
            alert('تم التعديل بنجاح');
            fetchJobs(); // Refresh to be safe
        } catch (e: any) {
            alert('فشل التعديل: ' + e.message);
        }
    };

    // --- Filtered Jobs ---
    const filteredJobs = jobs.filter(j =>
        j.title?.toLowerCase().includes(filter.toLowerCase()) ||
        j.company_name?.toLowerCase().includes(filter.toLowerCase())
    );

    // --- Loading Screen ---
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );

    // --- Login Screen ---
    if (!isAuthenticated) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4" dir="rtl">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">لوحة المشرف</h2>
                <p className="text-center text-gray-500 mb-8">يرجى إدخال كلمة المرور للمتابعة</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        placeholder="كلمة المرور..."
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">
                        دخول
                    </button>
                </form>
            </div>
        </div>
    );

    // --- Dashboard ---
    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 font-sans" dir="rtl">
            {/* Navbar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 text-blue-600" />
                        <h1 className="text-xl font-black text-gray-900">مسار <span className="text-blue-600">Admin</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleScrape}
                            disabled={scraping}
                            className={`flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all ${scraping ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            <RefreshCw className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
                            {scraping ? 'جاري التحديث...' : 'تحديث الوظائف الآن'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-gray-500 text-sm font-bold mb-1">إجمالي الوظائف</div>
                        <div className="text-3xl font-black text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-gray-500 text-sm font-bold mb-1">وظائف اليوم</div>
                        <div className="text-3xl font-black text-green-600">{stats.today}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-gray-500 text-sm font-bold mb-1">الرياض</div>
                        <div className="text-3xl font-black text-blue-600">{stats.riyadh}</div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ابحث عن وظيفة..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="flex-1 outline-none text-gray-700 font-medium"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">العنوان</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">الشركة</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">المدينة</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">القسم</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-gray-900">{job.title}</td>
                                        <td className="px-6 py-4 text-gray-600">{job.company_name}</td>
                                        <td className="px-6 py-4 text-gray-600">{job.city}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                                                {job.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingJob(job)}
                                                    className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    className="p-2 bg-white border border-gray-200 text-red-500 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {editingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Edit className="w-5 h-5 text-blue-600" />
                                تعديل الوظيفة
                            </h3>
                            <button onClick={() => setEditingJob(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">العنوان</label>
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editingJob.title}
                                    onChange={e => setEditingJob({ ...editingJob, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">الشركة</label>
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editingJob.company_name || ''}
                                    onChange={e => setEditingJob({ ...editingJob, company_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">المدينة</label>
                                    <input
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={editingJob.city || ''}
                                        onChange={e => setEditingJob({ ...editingJob, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">القسم</label>
                                    <input
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={editingJob.category || ''}
                                        onChange={e => setEditingJob({ ...editingJob, category: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    حفظ التعديلات
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingJob(null)}
                                    className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
