'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import {
    Briefcase, DollarSign, Award, FileText, Save, Loader2, UserPlus, Grid
} from 'lucide-react';
import { CATEGORY_OPTIONS } from '@/components/CategoryBar'; // Value updated

export default function PostTalentPage() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        job_title: '',
        category: '', // Added category
        bio: '',
        expected_salary: '',
        skills: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            // Fetch existing profile data
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFormData({
                    job_title: profile.job_title || '',
                    category: profile.category || '', // Fetch saved category
                    bio: profile.bio || '',
                    expected_salary: profile.expected_salary || '',
                    skills: profile.skills || ''
                });
            }
            setInitialLoading(false);
        };
        fetchUser();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.category) {
            alert('يرجى اختيار القسم.');
            setLoading(false);
            return;
        }

        try {
            const updates = {
                id: user.id,
                job_title: formData.job_title,
                category: formData.category, // Save category
                bio: formData.bio,
                expected_salary: formData.expected_salary,
                skills: formData.skills,
                is_looking_for_work: true,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            alert('تم نشر ملفك كباحث عن عمل بنجاح!');
            router.push('/talents');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#115d9a] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

                    <div className="text-center mb-10">
                        <div className="bg-teal-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
                            <UserPlus className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">أعلن عن مهاراتك</h1>
                        <p className="text-gray-500">
                            املأ البيانات التالية لعرض ملفك الشخصي أمام مئات الشركات التي تبحث عن كفاءات مثلك.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Job Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                المسمى الوظيفي المستهدف <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="مثال: مهندس برمجيات، مصمم جرافيك..."
                                    value={formData.job_title}
                                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                    className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Category Dropdown */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                القسم <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                                    <Grid className="h-5 w-5" />
                                </div>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all bg-white appearance-none"
                                >
                                    <option value="" disabled>اختر القسم (التخصص)</option>
                                    {CATEGORY_OPTIONS.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                نبذة مهنية مختصرة <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-4 right-4 text-gray-400">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="تحدث عن خبراتك، مهاراتك، وما يمكنك تقديمه..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full py-4 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Salary & Skills */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    الراتب المتوقع (شهرياً)
                                </label>
                                <div className="relative">
                                    <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="مثال: 5000 - 8000 ريال"
                                        value={formData.expected_salary}
                                        onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value })}
                                        className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    أبرز المهارات
                                </label>
                                <div className="relative">
                                    <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                                        <Award className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="مثال: React, Node.js, Photoshop..."
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-600/20"
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    نشر الملف الشخصي
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
