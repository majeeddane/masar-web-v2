'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, Briefcase, FileCheck, CheckCircle2, XCircle, Trash2, Search, ShieldCheck,
    Activity, Loader2, Ban, UserCheck, Eye, MapPin, Building2, Calendar, Newspaper, Plus, Edit, Save, Image as ImageIcon, X
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Data State
    const [stats, setStats] = useState({
        users: 0,
        activeJobs: 0,
        applications: 0,
        seekers: 0,
        posts: 0
    });

    const [jobs, setJobs] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);

    // UI State
    const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'applications' | 'posts'>('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // CMS Modal State
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [postForm, setPostForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image: '',
        category: 'General'
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const checkAdminAccess = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.is_admin) {
            router.push('/');
            return;
        }

        setIsAdmin(true);
        fetchAdminData();
    };

    const fetchAdminData = async () => {
        try {
            // Stats (Approximate counts for speed)
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
            const { count: appsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });
            const { count: seekersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_looking_for_work', true);
            const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });

            setStats({
                users: usersCount || 0,
                activeJobs: jobsCount || 0,
                applications: appsCount || 0,
                seekers: seekersCount || 0,
                posts: postsCount || 0
            });

            // 1. Fetch All Users
            const { data: allUsers } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            setUsers(allUsers || []);

            // 2. Fetch All Jobs
            const { data: allJobs } = await supabase
                .from('jobs')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false });
            setJobs(allJobs || []);

            // 3. Fetch All Applications
            const { data: allApps } = await supabase
                .from('applications')
                .select(`
                    *,
                    seeker:seeker_id(full_name, email),
                    employer:employer_id(full_name),
                    job:job_id(title)
                `)
                .order('created_at', { ascending: false });
            setApplications(allApps || []);

            // 4. Fetch All Posts (CMS)
            const { data: allPosts } = await supabase
                .from('posts')
                .select('*, author:author_id(full_name)')
                .order('published_at', { ascending: false });
            setPosts(allPosts || []);

        } catch (error) {
            console.error('Error fetching admin data:', error);
            showToast('حدث خطأ أثناء تحميل البيانات', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    // Toggle Verification
    const toggleVerification = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_verified: !currentStatus })
            .eq('id', userId);

        if (error) {
            showToast('فشل تحديث حالة التوثيق', 'error');
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, is_verified: !currentStatus } : u));
            showToast(currentStatus ? 'تم إلغاء التوثيق' : 'تم توثيق الحساب بنجاح');

            // Send Notification if Verified
            if (!currentStatus) { // If it WAS false and now becomes TRUE
                await supabase.from('notifications').insert({
                    user_id: userId,
                    message: '🎉 تهانينا! تم توثيق حسابك بنجاح. يمكنك الآن التمتع بمميزات إضافية.',
                    type: 'success'
                });
            }
        }
    };

    // Toggle Block
    const toggleBlock = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_blocked: !currentStatus })
            .eq('id', userId); // Assuming is_blocked column exists

        if (error) {
            showToast('فشل تحديث حالة الحظر', 'error');
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: !currentStatus } : u));
            showToast(currentStatus ? 'تم رفع الحظر' : 'تم حظر المستخدم');
        }
    };

    // Delete Job
    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الوظيفة نهائياً؟')) return;

        const { error } = await supabase.from('jobs').delete().eq('id', jobId);
        if (error) {
            showToast('فشل حذف الوظيفة', 'error');
        } else {
            setJobs(jobs.filter(j => j.id !== jobId));
            setStats(prev => ({ ...prev, activeJobs: prev.activeJobs - 1 }));
            showToast('تم حذف الوظيفة بنجاح');
        }
    };


    // --- CMS Logic ---

    const openCreatePostModal = () => {
        setEditingPost(null);
        setPostForm({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            cover_image: '',
            category: 'General'
        });
        setIsPostModalOpen(true);
    };

    const openEditPostModal = (post: any) => {
        setEditingPost(post);
        setPostForm({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            content: post.content,
            cover_image: post.cover_image || '',
            category: post.category || 'General'
        });
        setIsPostModalOpen(true);
    };

    // Auto-generate slug from title if empty
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setPostForm(prev => ({
            ...prev,
            title: newTitle,
            slug: !editingPost && !prev.slug ? newTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : prev.slug
        }));
    };

    const handleSavePost = async () => {
        if (!postForm.title || !postForm.slug || !postForm.content) {
            showToast('يرجى ملء الحقول الإلزامية (العنوان، الرابط، المحتوى)', 'error');
            return;
        }

        setFormLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        try {
            if (editingPost) {
                // Update
                const { data, error } = await supabase
                    .from('posts')
                    .update({
                        title: postForm.title,
                        slug: postForm.slug,
                        excerpt: postForm.excerpt,
                        content: postForm.content,
                        cover_image: postForm.cover_image,
                        category: postForm.category,
                        // Not updating author_id or created_at
                    })
                    .eq('id', editingPost.id)
                    .select('*, author:author_id(full_name)')
                    .single();

                if (error) throw error;

                setPosts(posts.map(p => p.id === editingPost.id ? data : p));
                showToast('تم تحديث المقال بنجاح');
            } else {
                // Create
                const { data, error } = await supabase
                    .from('posts')
                    .insert({
                        title: postForm.title,
                        slug: postForm.slug,
                        excerpt: postForm.excerpt,
                        content: postForm.content,
                        cover_image: postForm.cover_image,
                        category: postForm.category,
                        author_id: user?.id,
                        published_at: new Date().toISOString()
                    })
                    .select('*, author:author_id(full_name)')
                    .single();

                if (error) throw error;

                setPosts([data, ...posts]);
                setStats(prev => ({ ...prev, posts: prev.posts + 1 }));
                showToast('تم نشر المقال بنجاح');
            }
            setIsPostModalOpen(false);
        } catch (error: any) {
            console.error('Error saving post:', error);
            showToast(`فشل حفظ المقال: ${error.message}`, 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المقال نهائياً؟')) return;

        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) {
            showToast('فشل حذف المقال', 'error');
        } else {
            setPosts(posts.filter(p => p.id !== postId));
            setStats(prev => ({ ...prev, posts: prev.posts - 1 }));
            showToast('تم حذف المقال بنجاح');
        }
    };


    // --- Filtering ---
    const getFilteredData = () => {
        const lowerSearch = searchTerm.toLowerCase();

        if (activeTab === 'users') {
            return users.filter(user =>
                user.full_name?.toLowerCase().includes(lowerSearch) ||
                user.email?.toLowerCase().includes(lowerSearch) ||
                user.job_title?.toLowerCase().includes(lowerSearch)
            );
        }
        if (activeTab === 'jobs') {
            return jobs.filter(job =>
                job.title?.toLowerCase().includes(lowerSearch) ||
                job.city?.toLowerCase().includes(lowerSearch) ||
                job.category?.toLowerCase().includes(lowerSearch)
            );
        }
        if (activeTab === 'applications') {
            return applications.filter(app =>
                app.seeker?.full_name?.toLowerCase().includes(lowerSearch) ||
                app.employer?.full_name?.toLowerCase().includes(lowerSearch) ||
                app.job?.title?.toLowerCase().includes(lowerSearch)
            );
        }
        if (activeTab === 'posts') {
            return posts.filter(post =>
                post.title?.toLowerCase().includes(lowerSearch) ||
                post.category?.toLowerCase().includes(lowerSearch)
            );
        }
        return [];
    };

    const filteredData = getFilteredData();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans p-6 relative" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3">
                            <ShieldCheck className="h-8 w-8 text-teal-400" />
                            لوحة القيادة (Founder Mode)
                        </h1>
                        <p className="text-gray-400 mt-1">التحكم الكامل في منصة مسار</p>
                    </div>
                    <Link href="/dashboard" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        العودة للموقع
                    </Link>
                </div>

                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed bottom-4 left-4 px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 z-[60] ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                        {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        {toast.message}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'إجمالي المستخدمين', value: stats.users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                        { label: 'الوظائف النشطة', value: stats.activeJobs, icon: Briefcase, color: 'text-green-400', bg: 'bg-green-400/10' },
                        { label: 'طلبات التوظيف', value: stats.applications, icon: FileCheck, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                        { label: 'المتميزون (Verified)', value: users.filter(u => u.is_verified).length, icon: ShieldCheck, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                        { label: 'المقالات المنشورة', value: stats.posts, icon: Newspaper, color: 'text-pink-400', bg: 'bg-pink-400/10' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</h3>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-white font-numeric">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 sticky top-4 z-30 bg-gray-950/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-2xl">
                    <div className="flex bg-gray-900 p-1 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Users className="h-4 w-4" /> إدارة المستخدمين
                        </button>
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'jobs' ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Briefcase className="h-4 w-4" /> إدارة الوظائف
                        </button>
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'applications' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FileCheck className="h-4 w-4" /> مراقبة الطلبات
                        </button>
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'posts' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Newspaper className="h-4 w-4" /> إدارة المقالات (CMS)
                        </button>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="بحث في القائمة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 text-white pr-9 pl-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-600 text-sm"
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl min-h-[500px]">

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-black/20 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">المستخدم</th>
                                        <th className="px-6 py-4">الدور والمسمى</th>
                                        <th className="px-6 py-4">الحالة</th>
                                        <th className="px-6 py-4">الانضمام</th>
                                        <th className="px-6 py-4">إجراءات المدير</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredData.map((user: any) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} className="w-10 h-10 rounded-full bg-gray-800 object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500">
                                                            <Users className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-white flex items-center gap-1.5">
                                                            {user.full_name}
                                                            {user.is_admin && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">ADMIN</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{user.email || 'No Email'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">{user.job_title || '-'}</div>
                                                <div className="text-xs text-gray-500">{user.category}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    {user.is_verified && (
                                                        <span className="bg-teal-500/10 text-teal-400 text-[10px] px-2 py-0.5 rounded-full border border-teal-500/20 flex items-center gap-1">
                                                            <ShieldCheck className="h-3 w-3" /> موثق
                                                        </span>
                                                    )}
                                                    {user.is_blocked && (
                                                        <span className="bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">
                                                            <Ban className="h-3 w-3" /> محظور
                                                        </span>
                                                    )}
                                                    {!user.is_verified && !user.is_blocked && (
                                                        <span className="text-gray-500 text-xs">نشط</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-numeric">
                                                {new Date(user.created_at).toLocaleDateString('ar-SA')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => toggleVerification(user.id, user.is_verified)}
                                                        className={`p-2 rounded-lg transition-colors ${user.is_verified ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                                        title={user.is_verified ? 'إلغاء التوثيق' : 'توثيق الحساب'}
                                                    >
                                                        <ShieldCheck className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => toggleBlock(user.id, user.is_blocked)}
                                                        className={`p-2 rounded-lg transition-colors ${user.is_blocked ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-gray-700'}`}
                                                        title={user.is_blocked ? 'رفع الحظر' : 'حظر المستخدم'}
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                    </button>

                                                    <Link href={`/profile/${user.id}`} target="_blank" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors">
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* JOBS TAB */}
                    {activeTab === 'jobs' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-black/20 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">عنوان الوظيفة</th>
                                        <th className="px-6 py-4">تفاصيل</th>
                                        <th className="px-6 py-4">الموقع</th>
                                        <th className="px-6 py-4">الناشر</th>
                                        <th className="px-6 py-4">تاريخ النشر</th>
                                        <th className="px-6 py-4">تحكم</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredData.map((job: any) => (
                                        <tr key={job.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-white">
                                                {job.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs border border-gray-700">
                                                    {job.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {job.city}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                {job.profiles?.full_name}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-numeric">
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <Link href={`/jobs/${job.id}`} target="_blank" className="p-2 bg-gray-800 rounded-lg text-blue-400 hover:bg-gray-700">
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteJob(job.id)}
                                                    className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* APPLICATIONS TAB */}
                    {activeTab === 'applications' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-black/20 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">المتقدم (Seeker)</th>
                                        <th className="px-6 py-4">الوظيفة المستهدفة</th>
                                        <th className="px-6 py-4">صاحب العمل</th>
                                        <th className="px-6 py-4">الحالة</th>
                                        <th className="px-6 py-4">التاريخ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredData.map((app: any) => (
                                        <tr key={app.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-bold text-white text-sm">
                                                {app.seeker?.full_name}
                                            </td>
                                            <td className="px-6 py-4 text-blue-400 text-sm">
                                                {app.job?.title}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {app.employer?.full_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${app.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {app.status === 'accepted' ? 'مقبول' : app.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-numeric">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* POSTS TAB (CMS) */}
                    {activeTab === 'posts' && (
                        <div className="overflow-x-auto relative">
                            {/* Create Button in local scope */}
                            <div className="absolute top-4 left-4 z-10">
                                <button
                                    onClick={openCreatePostModal}
                                    className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 transition-colors"
                                >
                                    <Plus className="h-4 w-4" /> كتابة مقال جديد
                                </button>
                            </div>

                            <table className="w-full text-right mt-16 md:mt-0">
                                <thead className="bg-black/20 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">عنوان المقال</th>
                                        <th className="px-6 py-4">التصنيف</th>
                                        <th className="px-6 py-4">المؤلف</th>
                                        <th className="px-6 py-4">تاريخ النشر</th>
                                        <th className="px-6 py-4">تحكم</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredData.map((post: any) => (
                                        <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-white max-w-[250px] truncate">
                                                {post.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-800 text-pink-400 px-2 py-1 rounded text-xs border border-gray-700 font-bold">
                                                    {post.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400 flex items-center gap-1">
                                                <Users className="h-3 w-3" /> {post.author?.full_name || 'Admin'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-numeric">
                                                {new Date(post.published_at).toLocaleDateString('ar-SA')}
                                            </td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <button
                                                    onClick={() => openEditPostModal(post)}
                                                    className="p-2 bg-blue-500/10 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-10 text-gray-500">
                                                لا توجد مقالات حتى الآن
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create/Edit Post Modal */}
                {isPostModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-gray-900 rounded-3xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setIsPostModalOpen(false)}
                                className="absolute top-4 left-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="p-8">
                                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                                    {editingPost ? <Edit className="h-6 w-6 text-blue-500" /> : <Plus className="h-6 w-6 text-pink-500" />}
                                    {editingPost ? 'تعديل المقال' : 'كتابة مقال جديد'}
                                </h2>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">عنوان المقال</label>
                                            <input
                                                type="text"
                                                value={postForm.title}
                                                onChange={handleTitleChange}
                                                className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all placeholder-gray-600"
                                                placeholder="أدخل عنوان المقال..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">الرابط المخصص (Slug)</label>
                                            <input
                                                type="text"
                                                value={postForm.slug}
                                                onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                                                className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all placeholder-gray-600 font-mono text-sm"
                                                placeholder="post-slug-example"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">التصنيف</label>
                                            <select
                                                value={postForm.category}
                                                onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                                                className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                                            >
                                                <option value="General">عام</option>
                                                <option value="Career Tips">نصائح مهنية</option>
                                                <option value="Market News">أخبار السوق</option>
                                                <option value="Success Stories">قصص نجاح</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">رابط صورة الغلاف</label>
                                            <div className="relative">
                                                <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={postForm.cover_image}
                                                    onChange={(e) => setPostForm({ ...postForm, cover_image: e.target.value })}
                                                    className="w-full bg-black/30 border border-gray-700 rounded-xl pr-10 pl-4 py-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all placeholder-gray-600 text-sm"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">مقتطف قصير (Short Excerpt)</label>
                                        <textarea
                                            rows={2}
                                            value={postForm.excerpt}
                                            onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                                            className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all placeholder-gray-600 resize-none"
                                            placeholder="اكتب وصفاً مختصراً للمقال يظهر في القائمة..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">محتوى المقال</label>
                                        <textarea
                                            rows={12}
                                            value={postForm.content}
                                            onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                                            className="w-full bg-black/30 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all placeholder-gray-600 font-mono text-sm leading-relaxed"
                                            placeholder="اكتب محتوى المقال هنا..."
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-800">
                                        <button
                                            onClick={handleSavePost}
                                            disabled={formLoading}
                                            className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-pink-900/20 transition-all flex items-center gap-2"
                                        >
                                            {formLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                            {editingPost ? 'حفظ التغييرات' : 'نشر المقال'}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
