'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import {
    Briefcase, MapPin, Phone, Mail, Link as LinkIcon,
    UploadCloud, FileText, X, Loader2, Sparkles, Send
} from 'lucide-react';
import { SAUDI_CITIES } from '@/lib/constants';

// قائمة الأقسام
const CATEGORIES_LIST = [
    'سياحة ومطاعم', 'مهندس', 'مبيعات وتسويق', 'حرفيين', 'مقاولات', 'طب وتمريض',
    'عمال دليفري', 'حراسة وأمن', 'تزين وتجميل', 'تعليم وتدريس', 'كمبيوتر وشبكات',
    'شراكة', 'موارد بشرية', 'حدائق ومناظر طبيعية', 'سكرتارية', 'لياقة بدنية',
    'فنون جميلة', 'سياحة وسفر', 'حضانة أطفال', 'أزياء', 'سائق', 'حسابات',
    'عمال', 'إدارة', 'تقني', 'خدمة الزبائن', 'موظفين', 'مدخل بيانات', 'تصميم',
    'عمال تنظيف', 'خياطين', 'عمالة منزلية', 'تقنيين تكييف وتبريد', 'برمجة',
    'محاماة وقانون', 'مونتاج وإخراج', 'تصميم مواقع', 'علاقات عامة', 'مترجمين', 'محررين'
];

export default function PostTalentPage() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        post_title: '',
        category: '',
        city: '',
        content: '',
        phone_number: '',
        contact_email: '',
        external_link: '',
        cv_url: '' // سيتم ملؤها بعد رفع الملف
    });

    // دالة رفع الملف
    const handleFileUpload = async (file: File) => {
        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // الحصول على الرابط العام
            const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);

            setResumeFile(file);
            setFormData(prev => ({ ...prev, cv_url: data.publicUrl }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('حدث خطأ أثناء رفع الملف، تأكد أنه PDF أو صورة وأقل من 5 ميجا.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('يجب تسجيل الدخول');

            const { error } = await supabase
                .from('talent_posts')
                .insert({
                    user_id: user.id,
                    post_title: formData.post_title,
                    category: formData.category,
                    city: formData.city,
                    content: formData.content,
                    phone_number: formData.phone_number,
                    contact_email: formData.contact_email || null,
                    external_link: formData.external_link || null, // إذا كان فارغاً يرسل null
                    cv_url: formData.cv_url || null // رابط الملف المرفوع
                });

            if (error) throw error;

            router.push('/talents');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('حدث خطأ أثناء النشر');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans relative overflow-hidden flex items-center justify-center py-12 px-4" dir="rtl">

            {/* خلفية جمالية متحركة */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#115d9a] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-4xl w-full relative z-10">

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-blue-300 text-sm font-bold mb-4 shadow-lg">
                        <Sparkles className="w-4 h-4" /> انطلق نحو مستقبلك
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        أنشئ إعلانك <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">الاحترافي</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        املأ البيانات بعناية. الإعلانات المكتملة والاحترافية تجذب انتباه الشركات الكبرى بنسبة 80% أكثر.
                    </p>
                </div>

                {/* الكارت الزجاجي الفخم */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">

                    {/* شريط علوي ملون */}
                    <div className="h-2 w-full bg-gradient-to-r from-[#115d9a] via-purple-500 to-pink-500"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">

                        {/* القسم 1: العنوان */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 mr-1">عنوان الإعلان (كن مميزاً)</label>
                            <input
                                type="text" required
                                placeholder="مثال: مهندس معماري بخبرة 5 سنوات في التصميم المودرن..."
                                value={formData.post_title}
                                onChange={(e) => setFormData({ ...formData, post_title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-lg placeholder-gray-600 font-bold"
                            />
                        </div>

                        {/* القسم 2: التصنيف والمدينة */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-400" /> القسم المهني
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                    >
                                        <option value="" className="text-gray-900">اختر القسم المناسب</option>
                                        {CATEGORIES_LIST.map(cat => <option key={cat} value={cat} className="text-gray-900">{cat}</option>)}
                                    </select>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-purple-400" /> المدينة
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                                    >
                                        <option value="" className="text-gray-900">اختر مدينتك</option>
                                        {SAUDI_CITIES.map(city => <option key={city} value={city} className="text-gray-900">{city}</option>)}
                                    </select>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                </div>
                            </div>
                        </div>

                        {/* القسم 3: التفاصيل */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300">تفاصيل خبراتك ومهاراتك</label>
                            <textarea
                                rows={6} required
                                placeholder="اكتب نبذة احترافية عنك. ما هي البرامج التي تتقنها؟ ما هي مشاريعك السابقة؟ (كلما كتبت أكثر، زادت فرصك)"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-blue-500 transition-all leading-relaxed placeholder-gray-600"
                            ></textarea>
                        </div>

                        {/* فاصل */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                        {/* القسم 4: التواصل */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-green-400" /> رقم الجوال (أساسي)
                                </label>
                                <input
                                    type="tel" required
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-green-500 font-numeric"
                                    placeholder="05xxxxxxxx"
                                    dir="ltr"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-orange-400" /> البريد الإلكتروني (اختياري)
                                </label>
                                <input
                                    type="email"
                                    placeholder="example@mail.com"
                                    value={formData.contact_email}
                                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-orange-500"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* القسم 5: المرفقات والروابط */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* رفع السيفي */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-400" /> السيرة الذاتية (CV)
                                </label>

                                {!resumeFile ? (
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.jpg,.png"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={uploading}
                                        />
                                        <div className="w-full bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-6 text-center group-hover:border-blue-500/50 group-hover:bg-white/10 transition-all">
                                            {uploading ? (
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <Loader2 className="animate-spin w-6 h-6" />
                                                    <span className="text-xs">جاري الرفع...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-300">
                                                    <UploadCloud className="w-8 h-8" />
                                                    <span className="text-sm font-bold">اضغط لرفع ملف PDF أو صورة</span>
                                                    <span className="text-[10px] text-gray-600">اختياري (الحد الأقصى 5MB)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-blue-500 p-2 rounded-lg text-white">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm text-blue-200 truncate">{resumeFile.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setResumeFile(null); setFormData(prev => ({ ...prev, cv_url: '' })) }}
                                            className="text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* الرابط الخارجي */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-pink-400" /> رابط معرض أعمال / موقع (اختياري)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://my-portfolio.com"
                                    value={formData.external_link}
                                    onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-pink-500"
                                    dir="ltr"
                                />
                                <p className="text-xs text-gray-500">لن يظهر هذا الحقل في الإعلان إذا تركته فارغاً</p>
                            </div>
                        </div>

                        {/* زر الإرسال */}
                        <div className="pt-8 flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 bg-gradient-to-r from-[#115d9a] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-5 rounded-2xl font-black shadow-lg shadow-blue-900/40 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>نشر الإعلان فوراً <Send className="w-5 h-5 rotate-180" /></>}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-8 py-5 rounded-2xl font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}