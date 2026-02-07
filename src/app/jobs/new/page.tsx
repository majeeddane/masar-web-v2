'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
    Loader2, Briefcase, MapPin, DollarSign, FileText,
    ArrowRight, Building2, Link as LinkIcon, Phone, Mail, Grid
} from 'lucide-react';
import { CATEGORY_OPTIONS } from '@/components/CategoryBar';
import { SAUDI_CITIES } from '@/lib/constants';

export default function NewJobPage() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        job_type: 'Full-time',
        category: '', // Added category
        location: '',
        salary_range: '',
        description: '',
        application_link: '',
        contact_phone: '',
        contact_email: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.category) {
            setError('يرجى اختيار القسم المناسب للوظيفة.');
            setLoading(false);
            return;
        }

        try {
            // 1. Get Current User
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('يجب عليك تسجيل الدخول أولاً لنشر وظيفة.');
                setLoading(false);
                return;
            }

            // 2. Insert Job
            const { error: insertError } = await supabase
                .from('jobs')
                .insert({
                    title: formData.title,
                    job_type: formData.job_type,
                    category: formData.category, // Save category
                    location: formData.location,
                    salary_range: formData.salary_range,
                    description: formData.description,
                    application_link: formData.application_link || null,
                    contact_phone: formData.contact_phone || null,
                    contact_email: formData.contact_email || null,
                    user_id: user.id
                });

            if (insertError) throw insertError;

            // 3. Success -> Redirect
            router.push('/jobs');
            router.refresh();

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'حدث خطأ أثناء نشر الوظيفة. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">نشر وظيفة جديدة</h1>
                        <p className="mt-2 text-gray-600">أضف تفاصيل الوظيفة وخيارات التواصل للوصول إلى أفضل الكفاءات.</p>
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
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                القسم
                            </label>
                            <div className="relative">
                                <span className="absolute right-3 top-3 text-gray-400"><Grid className="h-5 w-5" /></span>
                                <select
                                    name="category"
                                    id="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none transition-all bg-white appearance-none"
                                >
                                    <option value="" disabled>اختر القسم المناسب</option>
                                    {CATEGORY_OPTIONS.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
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

                            {/* Location - Updated to Dropdown */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    المدينة
                                </label>
                                <div className="relative">
                                    <span className="absolute right-3 top-3 text-gray-400"><MapPin className="h-5 w-5" /></span>
                                    <select
                                        name="location"
                                        id="location"
                                        required
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none transition-all bg-white appearance-none"
                                    >
                                        <option value="" disabled>اختر المدينة</option>
                                        {SAUDI_CITIES.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
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
                                disabled={loading}
                                className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-[#115d9a] hover:bg-[#0e4d82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#115d9a] transition-all
                                    ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 ml-2" />
                                        جاري النشر...
                                    </>
                                ) : (
                                    'نشر الوظيفة الآن'
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}