'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
    Loader2, Briefcase, MapPin, DollarSign, FileText,
    ArrowRight, Building2, Phone, Mail, Globe, Clock, CheckCircle2
} from 'lucide-react';
import { SAUDI_CITIES } from '@/lib/constants';

// ✅ القائمة الموحدة لضمان ظهور الوظائف في أقسامها الصحيحة
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
        experience_level: 'Entry Level',
        category: '',
        city: '',
        salary_min: '',
        salary_max: '',
        description: '',
        application_link: '',
        phone_number: '', // ✅ هذا هو الحقل الذي سيجعل زر الاتصال يعمل
        contact_email: ''
    });

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.category || !formData.city || !formData.description) {
            setError('يرجى ملء جميع الحقول الإلزامية (القسم، المدينة، والوصف).');
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('يرجى تسجيل الدخول أولاً');

            const { error: insertError } = await supabase
                .from('jobs')
                .insert({
                    ...formData,
                    location: formData.city,
                    salary_min: formData.salary_min ? Number(formData.salary_min) : null,
                    salary_max: formData.salary_max ? Number(formData.salary_max) : null,
                    user_id: user.id
                });

            if (insertError) throw insertError;
            router.push('/jobs');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء نشر الوظيفة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-28 pb-12 px-4" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-100">
                    <div className="bg-[#115d9a] h-3 w-full"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-12">

                        {/* القسم 1: المعلومات الأساسية */}
                        <section className="space-y-6">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="w-10 h-10 bg-blue-50 text-[#115d9a] rounded-2xl flex items-center justify-center text-lg italic">1</span>
                                المعلومات الأساسية
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-black text-slate-700 mb-2">مسمى الوظيفة *</label>
                                    <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#115d9a] outline-none transition-all font-bold" placeholder="مثال: مهندس برمجيات" />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2">القسم *</label>
                                    <select name="category" required value={formData.category} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none appearance-none font-bold">
                                        <option value="">اختر القسم</option>
                                        {CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2">المدينة *</label>
                                    <select name="city" required value={formData.city} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none appearance-none font-bold">
                                        <option value="">اختر المدينة</option>
                                        {SAUDI_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* القسم 2: تفاصيل الوظيفة - كان مفقوداً في صورتك */}
                        <section className="space-y-6 pt-6 border-t border-slate-50">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-lg italic">2</span>
                                تفاصيل العمل والراتب
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2">نوع الدوام</label>
                                    <select name="job_type" value={formData.job_type} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold">
                                        <option value="Full-time">دوam كامل</option>
                                        <option value="Part-time">دوام جزئي</option>
                                        <option value="Remote">عن بعد</option>
                                    </select>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-black text-slate-700 mb-2">الراتب (من)</label>
                                        <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="0" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-black text-slate-700 mb-2">(إلى)</label>
                                        <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="0" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-black text-slate-700 mb-2">الوصف الوظيفي والمسؤوليات *</label>
                                    <textarea name="description" required rows={5} value={formData.description} onChange={handleChange} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium leading-relaxed" placeholder="اكتب بوضوح عن متطلبات الوظيفة..."></textarea>
                                </div>
                            </div>
                        </section>

                        {/* القسم 3: التواصل - كان مفقوداً في صورتك */}
                        <section className="space-y-6 pt-6 border-t border-slate-50">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <span className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-lg italic">3</span>
                                قنوات التواصل (اختياري)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2 text-emerald-600 flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> رقم الهاتف (واتساب/اتصال)
                                    </label>
                                    <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="05xxxxxxxx" />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> البريد الإلكتروني
                                    </label>
                                    <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="hr@company.com" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-black text-slate-700 mb-2 flex items-center gap-2">
                                        <Globe className="w-4 h-4" /> رابط التقديم الخارجي (إن وجد)
                                    </label>
                                    <input type="url" name="application_link" value={formData.application_link} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="https://..." dir="ltr" />
                                </div>
                            </div>
                        </section>

                        {error && <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-black border-2 border-red-100 animate-pulse text-center">⚠️ {error}</div>}

                        <button type="submit" disabled={loading} className="w-full py-6 bg-[#115d9a] text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 hover:bg-[#0e4d82] disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                            {loading ? <Loader2 className="animate-spin w-8 h-8" /> : (
                                <>نشر الوظيفة الآن <ArrowRight className="w-6 h-6 rotate-180" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}