'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
    Loader2, Briefcase, MapPin, DollarSign, FileText,
    ArrowRight, Building2, Link as LinkIcon, Phone, Mail, Save
} from 'lucide-react';

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        job_type: 'Full-time',
        location: '',
        salary_range: '',
        description: '',
        application_link: '',
        contact_phone: '',
        contact_email: ''
    });

    useEffect(() => {
        if (id) fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('الوظيفة غير موجودة');

            // Verify ownership
            if (data.user_id !== user.id) {
                router.push('/my-jobs');
                return;
            }

            setFormData({
                title: data.title || '',
                job_type: data.job_type || 'Full-time',
                location: data.location || '',
                salary_range: data.salary_range || '',
                description: data.description || '',
                application_link: data.application_link || '',
                contact_phone: data.contact_phone || '',
                contact_email: data.contact_email || ''
            });

        } catch (err: any) {
            console.error(err);
            setError('حدث خطأ أثناء تحميل بيانات الوظيفة.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const { error: updateError } = await supabase
                .from('jobs')
                .update({
                    title: formData.title,
                    job_type: formData.job_type,
                    location: formData.location,
                    salary_range: formData.salary_range,
                    description: formData.description,
                    application_link: formData.application_link || null,
                    contact_phone: formData.contact_phone || null,
                    contact_email: formData.contact_email || null,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            // Success -> Redirect
            router.push('/my-jobs');
            router.refresh();

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'حدث خطأ أثناء تحديث الوظيفة.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#115d9a] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">تعديل الوظيفة</h1>
                        <p className="mt-2 text-gray-600">قم بتحديث تفاصيل الوظيفة لإعادة نشرها.</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="p-2 text-gray-500 hover:text-[#115d9a] hover:bg-blue-50 rounded-full transition-colors"
                    >
                        <ArrowRight className="h-6 w-6 rotate-180" />
                    </button>
                </div>

                {/* Form Card */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="bg-[#115d9a] h-2 w-full"></div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                مسمى الوظيفة
                            </label>
                            <div className="relative">
                                <span className="absolute right-3 top-3 text-gray-400"><Briefcase className="h-5 w-5" /></span>
                                <input
                                    type="text" name="title" id="title" required
                                    placeholder="مثال: مصمم جرافيك أول"
                                    value={formData.title} onChange={handleChange}
                                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Job Type */}
                            <div>
                                <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-1">
                                    نوع الوظيفة
                                </label>
                                <div className="relative">
                                    <span className="absolute right-3 top-3 text-gray-400"><Building2 className="h-5 w-5" /></span>
                                    <select
                                        name="job_type" id="job_type" required
                                        value={formData.job_type} onChange={handleChange}
                                        className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none transition-all bg-white"
                                    >
                                        <option value="Full-time">دوام كامل</option>
                                        <option value="Part-time">دوام جزئي</option>
                                        <option value="Remote">عن بعد</option>
                                        <option value="Freelance">عمل حر</option>
                                    </select>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    الموقع
                                </label>
                                <div className="relative">
                                    <span className="absolute right-3 top-3 text-gray-400"><MapPin className="h-5 w-5" /></span>
                                    <input
                                        type="text" name="location" id="location" required
                                        placeholder="مثال: الرياض، أو عن بعد"
                                        value={formData.location} onChange={handleChange}
                                        className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Salary */}
                        <div>
                            <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700 mb-1">
                                الراتب المتوقع (اختياري)
                            </label>
                            <div className="relative">
                                <span className="absolute right-3 top-3 text-gray-400"><DollarSign className="h-5 w-5" /></span>
                                <input
                                    type="text" name="salary_range" id="salary_range"
                                    placeholder="مثال: 5000 - 7000 ريال"
                                    value={formData.salary_range} onChange={handleChange}
                                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                تفاصيل الوظيفة
                            </label>
                            <div className="relative">
                                <span className="absolute right-3 top-3 text-gray-400"><FileText className="h-5 w-5" /></span>
                                <textarea
                                    name="description" id="description" required rows={8}
                                    placeholder="أدخل الوصف الوظيفي والمهام والمتطلبات هنا..."
                                    value={formData.description} onChange={handleChange}
                                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none transition-all"
                                ></textarea>
                            </div>
                        </div>

                        {/* --- Contact Options Section --- */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">خيارات التقديم والتواصل (اختياري)</h3>

                            <div className="space-y-4">
                                {/* Application Link */}
                                <div>
                                    <label htmlFor="application_link" className="block text-sm font-medium text-gray-700 mb-1">
                                        رابط التقديم الخارجي (إن وجد)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute right-3 top-3 text-gray-400"><LinkIcon className="h-5 w-5" /></span>
                                        <input
                                            type="url" name="application_link" id="application_link"
                                            placeholder="https://example.com/apply"
                                            value={formData.application_link} onChange={handleChange}
                                            className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none transition-all text-left"
                                            dir="ltr"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">إذا أضفت رابطاً، سيتم توجيه المتقدمين إليه بدلاً من فتح المحادثة.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            رقم التواصل
                                        </label>
                                        <div className="relative">
                                            <span className="absolute right-3 top-3 text-gray-400"><Phone className="h-5 w-5" /></span>
                                            <input
                                                type="tel" name="contact_phone" id="contact_phone"
                                                placeholder="05xxxxxxxx"
                                                value={formData.contact_phone} onChange={handleChange}
                                                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                                            البريد الإلكتروني
                                        </label>
                                        <div className="relative">
                                            <span className="absolute right-3 top-3 text-gray-400"><Mail className="h-5 w-5" /></span>
                                            <input
                                                type="email" name="contact_email" id="contact_email"
                                                placeholder="hr@company.com"
                                                value={formData.contact_email} onChange={handleChange}
                                                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-[#115d9a] hover:bg-[#0e4d82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#115d9a] transition-all
                                    ${submitting ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 ml-2" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save className="h-5 w-5" />
                                        <span>حفظ التعديلات</span>
                                    </div>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
