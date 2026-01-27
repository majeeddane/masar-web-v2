'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, CheckCircle2, Loader2, LogIn, Briefcase, Building2, MapPin, AlignLeft, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PostJobPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        description: '',
        contact_phone: '',
        contact_email: ''
    });

    // Check Auth on Mount
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);
        };
        checkUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('User not found');

            const { error } = await supabase.from('news').insert([{
                title: formData.title,
                original_text: formData.company,
                location: formData.location,
                description: formData.description,
                contact_phone: formData.contact_phone,
                contact_email: formData.contact_email,
                published: new Date().toISOString(),
                source_url: 'https://masar-sa.com',
                image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
                author_id: user.id
            }]);

            if (error) throw error;
            setSuccess(true);
        } catch (error) {

            console.error('Error posting job:', error);
            alert('حدث خطأ أثناء نشر الوظيفة. يرجى المحاولة مرة أخرى.');
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
                <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg w-full border border-slate-100">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogIn className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">يجب تسجيل الدخول</h2>
                    <p className="text-slate-500 mb-10 text-lg leading-relaxed">
                        عذراً، لا يمكنك نشر وظيفة جديدة إلا بعد تسجيل الدخول إلى حسابك. هذه الخطوة ضرورية لضمان جودة المحتوى.
                    </p>
                    <div className="flex flex-col gap-4">
                        <Link href="/login" className="block w-full py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors text-lg shadow-lg hover:shadow-blue-900/20">
                            تسجيل الدخول
                        </Link>
                        <Link href="/" className="block w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors">
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
                <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full animate-fade-in-up border border-green-100">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">تم النشر بنجاح!</h2>
                    <p className="text-slate-500 mb-8 text-lg">إعلانك أصبح مباشراً الآن على منصة مسار. شكراً لثقتك بنا.</p>
                    <Link href="/dashboard" className="block w-full py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors text-lg shadow-lg">
                        الذهاب للوحة التحكم
                    </Link>
                </div>
            </div>
        );
    }

    // 4. Form State
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-6 font-sans text-slate-900" dir="rtl">
            <div className="max-w-4xl mx-auto">

                <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                    إلغاء وعودة
                </Link>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-blue-900 text-white p-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>
                        <h1 className="text-3xl font-black mb-3 relative z-10">إضافة وظيفة جديدة</h1>
                        <p className="text-blue-100 text-lg relative z-10">انشر إعلانك مجاناً ليصل إلى آلاف الباحثين عن عمل فوراً.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">

                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                معلومات الوظيفة
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
                                            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                            placeholder="مثال: مدير تسويق"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label mb-2 block font-bold text-sm text-slate-700">اسم الشركة <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Building2 className="absolute top-3.5 right-4 w-5 h-5 text-slate-400" />
                                        <input
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            required
                                            type="text"
                                            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                            placeholder="اسم شركتك"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="label mb-2 block font-bold text-sm text-slate-700">المدينة / منطقة العمل <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <MapPin className="absolute top-3.5 right-4 w-5 h-5 text-slate-400" />
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        type="text"
                                        className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                        placeholder="الرياض - حي العليا"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                <AlignLeft className="w-5 h-5 text-blue-600" />
                                التفاصيل والمتطلبات
                            </h3>

                            <div>
                                <label className="label mb-2 block font-bold text-sm text-slate-700">الوصف الوظيفي <span className="text-red-500">*</span></label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={8}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium leading-relaxed"
                                    placeholder="اكتب وصفاً تفصيلياً للمهام والمسؤوليات، والشروط المطلوبة..."
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-blue-600" />
                                بيانات التواصل
                            </h3>
                            <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                هذه البيانات ستظهر للمرشحين للتواصل معك مباشرة. يمكنك ترك أحد الحقول فارغاً.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label mb-2 block font-bold text-sm text-slate-700">رقم الهاتف / واتساب</label>
                                    <div className="relative">
                                        <Phone className="absolute top-3.5 right-4 w-5 h-5 text-slate-400" />
                                        <input
                                            name="contact_phone"
                                            value={formData.contact_phone}
                                            onChange={handleChange}
                                            type="tel"
                                            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                            placeholder="05xxxxxxxx"
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
                                            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                            placeholder="jobs@company.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl shadow-xl hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
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
                            <p className="text-center text-xs text-slate-400 mt-4">
                                بمجرد النشر، سيتم عرض الوظيفة في القائمة العامة وتصبح متاحة للتقديم.
                            </p>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
