'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import { ArrowRight, CheckCircle2, Loader2, LogIn, Briefcase, Building2, MapPin, AlignLeft, Phone, Mail, Globe, DollarSign, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SAUDI_CITIES } from '@/lib/constants';
import { getArabicErrorMessage } from '@/lib/errorHandler';

const CATEGORY_OPTIONS = [
    'سياحة ومطاعم', 'مهندس', 'مبيعات وتسويق', 'حرفيين', 'مقاولات',
    'طب وتمريض', 'عمال دليفري', 'حراسة وأمن', 'تزين وتجميل',
    'تعليم وتدريس', 'كمبيوتر وشبكات', 'شراكة', 'موارد بشرية',
    'حدائق ومناظر طبيعية', 'سكرتارية', 'لياقة بدنية', 'فنون جميلة',
    'سياحة وسفر', 'حضانة أطفال', 'أزياء', 'سائق', 'حسابات',
    'عمال', 'إدارة', 'تقني', 'خدمة الزبائن', 'موظفين',
    'مدخل بيانات', 'تصميم', 'عمال تنظيف', 'خياطين', 'عمالة منزلية',
    'تقنيين تكييف وتبريد', 'برمجة', 'محاماة وقانون', 'مونتاج وإخراج',
    'تصميم مواقع', 'علاقات عامة', 'مترجمين', 'محررين'
];

export default function PostJobPage() {
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        category: '',
        city: '',
        job_type: 'Full-time',
        experience_level: 'Entry Level',
        salary_min: '',
        salary_max: '',
        description: '',
        phone_number: '',
        contact_email: '',
        application_link: ''
    });

    // Check Auth on Mount
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);
        };
        checkUser();
    }, [supabase]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (!formData.title.trim() || !formData.company.trim() || !formData.category || !formData.city || !formData.description.trim()) {
            setErrorMsg('يرجى ملء جميع الحقول المطلوبة (مسمى الوظيفة، اسم الشركة، القسم، المدينة، والوصف).');
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setErrorMsg('يجب تسجيل الدخول لنشر وظيفة.');
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            // 1. Base standard payload
            const basePayload: any = {
                title: formData.title.trim(),
                company: formData.company.trim(),
                category: formData.category,
                city: formData.city,
                location: formData.city,
                description: formData.description.trim(),
                job_type: formData.job_type || 'Full-time',
                experience_level: formData.experience_level || 'Entry Level',
                salary_min: formData.salary_min ? Number(formData.salary_min) : null,
                salary_max: formData.salary_max ? Number(formData.salary_max) : null,
                phone_number: formData.phone_number.trim() || null,
                contact_email: formData.contact_email.trim() || null,
                application_link: formData.application_link.trim() || null,
                is_active: true,
                user_id: user.id
            };

            // 2. Try inserting full schema with compatibility aliases
            let { error: insertError } = await supabase.from('jobs').insert({
                ...basePayload,
                company_name: formData.company.trim(),
                contact_phone: formData.phone_number.trim() || null,
                source_url: formData.application_link.trim() || null,
                created_by: user.id
            });

            // 3. Fallback level 1: if extended columns (company_name, created_by, etc.) don't exist
            if (insertError && (insertError.message?.includes('column') || insertError.code === '42703' || insertError.code === 'PGRST204')) {
                console.warn('Retrying job insert with standard base schema...', insertError.message);
                const retry1 = await supabase.from('jobs').insert(basePayload);
                insertError = retry1.error;
            }

            // 4. Fallback level 2: if optional fields like job_type/salary columns don't exist in older table
            if (insertError && (insertError.message?.includes('column') || insertError.code === '42703' || insertError.code === 'PGRST204')) {
                console.warn('Retrying job insert with core minimal schema...', insertError.message);
                const minimalPayload = {
                    title: formData.title.trim(),
                    company: formData.company.trim(),
                    category: formData.category,
                    location: formData.city,
                    description: formData.description.trim(),
                    phone_number: formData.phone_number.trim() || null,
                    contact_email: formData.contact_email.trim() || null,
                    application_link: formData.application_link.trim() || null,
                    is_active: true,
                    user_id: user.id
                };
                const retry2 = await supabase.from('jobs').insert(minimalPayload);
                insertError = retry2.error;
            }

            if (insertError) {
                console.error('Insert error in jobs table:', insertError);
                throw insertError;
            }

            setSuccess(true);
        } catch (error: any) {
            console.error('Error posting job:', error);
            setErrorMsg(getArabicErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // 1. Loading Auth State
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    // 2. Not Authenticated State
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans" dir="rtl">
                <div className="bg-white p-10 md:p-12 rounded-3xl shadow-xl max-w-lg w-full border border-slate-100">
                    <div className="w-20 h-20 bg-blue-50 text-[#115d9a] rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogIn className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">يجب تسجيل الدخول أولاً</h2>
                    <p className="text-slate-500 mb-8 text-base leading-relaxed">
                        لتتمكن من نشر وظيفة جديدة وإدارتها لاحقاً، يرجى تسجيل الدخول إلى حسابك أو إنشاء حساب جديد مجاناً.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href="/login" className="block w-full py-4 bg-[#115d9a] text-white rounded-2xl font-bold hover:bg-[#0e4d82] transition-colors text-lg shadow-lg">
                            تسجيل الدخول
                        </Link>
                        <Link href="/signup" className="block w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-colors">
                            إنشاء حساب جديد
                        </Link>
                        <Link href="/" className="block w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm">
                            العودة للرئيسية
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Success State
    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans" dir="rtl">
                <div className="bg-white p-10 md:p-12 rounded-3xl shadow-xl max-w-md w-full animate-fade-in-up border border-green-100">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3">تم نشر الوظيفة بنجاح!</h2>
                    <p className="text-slate-500 mb-8 text-base">إعلانك متاح الآن للباحثين عن عمل في قسم الوظائف.</p>
                    <div className="flex flex-col gap-3">
                        <Link href="/jobs" className="block w-full py-4 bg-[#115d9a] text-white rounded-2xl font-bold hover:bg-[#0e4d82] transition-colors text-lg shadow-lg">
                            تصفح الوظائف
                        </Link>
                        <Link href="/dashboard" className="block w-full py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-colors">
                            الذهاب للوحة التحكم
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Form State
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-6 font-sans text-slate-900 pt-8" dir="rtl">
            <div className="max-w-4xl mx-auto">

                <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#115d9a] font-bold mb-6 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                    إلغاء وعودة
                </Link>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#115d9a] to-blue-700 text-white p-8 md:p-10 relative overflow-hidden">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-blue-200 text-xs font-bold mb-3">
                            <Sparkles className="w-3.5 h-3.5" /> النشر مجاني وفوري
                        </div>
                        <h1 className="text-3xl font-black mb-2 relative z-10">إضافة وظيفة شاغرة</h1>
                        <p className="text-blue-100 text-base relative z-10">انشر إعلانك ليصل إلى آلاف الكفاءات والباحثين عن عمل في السعودية.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">

                        {errorMsg && (
                            <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl font-bold text-sm text-center">
                                ⚠️ {errorMsg}
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#115d9a]" />
                                معلومات الوظيفة الأساسية
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label mb-2 block font-bold text-sm text-slate-700">مسمى الوظيفة <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Briefcase className="absolute top-3.5 right-4 w-5 h-5 text-slate-400" />
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            type="text"
                                            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
                                            placeholder="مثال: مهندس برمجيات"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label mb-2 block font-bold text-sm text-slate-700">اسم الشركة / الجهة <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Building2 className="absolute top-3.5 right-4 w-5 h-5 text-slate-400" />
                                        <input
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            required
                                            type="text"
                                            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
                                            placeholder="مثال: شركة المسار المتقدمة"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label mb-2 block font-bold text-sm text-slate-700">القسم المهني <span className="text-red-500">*</span></label>
                                    <select
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                    >
                                        <option value="">اختر القسم المناسب</option>
                                        {CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="label mb-2 block font-bold text-sm text-slate-700">المدينة <span className="text-red-500">*</span></label>
                                    <select
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                    >
                                        <option value="">اختر المدينة</option>
                                        {SAUDI_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Details & Salary */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                تفاصيل العمل والراتب
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label mb-2 block font-bold text-sm text-slate-700">نوع الدوام</label>
                                    <select
                                        name="job_type"
                                        value={formData.job_type}
                                        onChange={handleChange}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                    >
                                        <option value="Full-time">دوام كامل</option>
                                        <option value="Part-time">دوام جزئي</option>
                                        <option value="Remote">عن بعد</option>
                                        <option value="Contract">عقد مؤقت</option>
                                    </select>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="label mb-2 block font-bold text-sm text-slate-700">الراتب المتوقع (من)</label>
                                        <input
                                            type="number"
                                            name="salary_min"
                                            value={formData.salary_min}
                                            onChange={handleChange}
                                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="label mb-2 block font-bold text-sm text-slate-700">(إلى)</label>
                                        <input
                                            type="number"
                                            name="salary_max"
                                            value={formData.salary_max}
                                            onChange={handleChange}
                                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="label mb-2 block font-bold text-sm text-slate-700">الوصف الوظيفي والمتطلبات <span className="text-red-500">*</span></label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium leading-relaxed"
                                        placeholder="اكتب وصفاً تفصيلياً للمهام والمسؤوليات، والشروط والخبرات المطلوبة..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-orange-500" />
                                بيانات التواصل مع المتقدمين (اختياري)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label mb-2 block font-bold text-sm text-slate-700">رقم الهاتف / واتساب</label>
                                    <div className="relative">
                                        <Phone className="absolute top-3.5 right-4 w-5 h-5 text-slate-400" />
                                        <input
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            type="tel"
                                            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                            placeholder="05xxxxxxxx"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label mb-2 block font-bold text-sm text-slate-700">البريد الإلكتروني للتقديم</label>
                                    <div className="relative">
                                        <Mail className="absolute top-3.5 right-4 w-5 h-5 text-slate-400" />
                                        <input
                                            name="contact_email"
                                            value={formData.contact_email}
                                            onChange={handleChange}
                                            type="email"
                                            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                            placeholder="jobs@company.com"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label mb-2 block font-bold text-sm text-slate-700">رابط خارجي للتقديم (إن وجد)</label>
                                    <div className="relative">
                                        <Globe className="absolute top-3.5 right-4 w-5 h-5 text-slate-400" />
                                        <input
                                            name="application_link"
                                            value={formData.application_link}
                                            onChange={handleChange}
                                            type="url"
                                            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                            placeholder="https://company.com/careers/job123"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-[#115d9a] hover:bg-[#0e4d82] text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-blue-900/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        جاري النشر...
                                    </>
                                ) : (
                                    'نشر الوظيفة الآن (مجاناً)'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
