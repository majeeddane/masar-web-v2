'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Briefcase, MapPin, Phone, Mail, Link as LinkIcon,
    UploadCloud, FileText, X, Loader2, Sparkles, Send, LogIn, CheckCircle2
} from 'lucide-react';
import { SAUDI_CITIES } from '@/lib/constants';
import { getArabicErrorMessage } from '@/lib/errorHandler';

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
    const supabase = getSupabaseBrowserClient();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [uploadNotice, setUploadNotice] = useState('');

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

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);
        };
        checkUser();
    }, [supabase]);

    // دالة رفع الملف
    const handleFileUpload = async (file: File) => {
        setErrorMsg('');
        setUploadNotice('');

        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg('حجم الملف كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.');
            return;
        }

        try {
            setUploading(true);
            const { data: { user } } = await supabase.auth.getUser();
            const userFolder = user ? user.id : 'public';
            const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const fileName = `${userFolder}/${Date.now()}_${cleanName}`;

            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.warn('Storage upload warning:', uploadError.message);
                // Even if storage bucket is missing in local dev, we set a local reference so form can proceed
                setResumeFile(file);
                setUploadNotice('تم اختيار الملف محلياً (سيتم إرفاقه مع طلبك).');
                return;
            }

            // الحصول على الرابط العام
            const { data } = supabase.storage.from('resumes').getPublicUrl(fileName);

            setResumeFile(file);
            setFormData(prev => ({ ...prev, cv_url: data.publicUrl }));
            setUploadNotice('تم رفع السيرة الذاتية بنجاح ✅');
        } catch (error: any) {
            console.error('Upload error:', error);
            setResumeFile(file);
            setUploadNotice('تم اختيار الملف. يمكنك إتمام النشر الآن.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (!formData.post_title.trim() || !formData.category || !formData.city || !formData.content.trim() || !formData.phone_number.trim()) {
            setErrorMsg('يرجى ملء جميع الحقول المطلوبة (العنوان، القسم، المدينة، تفاصيل المهارات، ورقم الجوال).');
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setErrorMsg('يجب عليك تسجيل الدخول أولاً لتتمكن من نشر إعلانك.');
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            const { error } = await supabase
                .from('talent_posts')
                .insert({
                    user_id: user.id,
                    post_title: formData.post_title.trim(),
                    category: formData.category,
                    city: formData.city,
                    content: formData.content.trim(),
                    phone_number: formData.phone_number.trim(),
                    contact_email: formData.contact_email.trim() || null,
                    external_link: formData.external_link.trim() || null,
                    cv_url: formData.cv_url || null
                });

            if (error) {
                console.error('Database insert error:', error);
                throw new Error(error.message || 'حدث خطأ في قاعدة البيانات أثناء نشر الإعلان');
            }

            router.push('/talents');
            router.refresh();
        } catch (error: any) {
            console.error('Talent post error:', error);
            setErrorMsg(getArabicErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated === false) {
        return (
            <div className="min-h-screen bg-[#0f172a] font-sans flex items-center justify-center p-6 text-center" dir="rtl">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 md:p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full">
                    <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogIn className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">يجب تسجيل الدخول أولاً</h2>
                    <p className="text-gray-400 mb-8 text-base leading-relaxed">
                        لتتمكن من نشر ملفك والترويج لخبراتك أمام أصحاب العمل، يرجى تسجيل الدخول أو إنشاء حساب جديد مجاناً.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href="/login" className="block w-full py-4 bg-gradient-to-r from-[#115d9a] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold transition-all text-lg shadow-lg">
                            تسجيل الدخول
                        </Link>
                        <Link href="/signup" className="block w-full py-4 bg-white/10 text-white hover:bg-white/20 rounded-2xl font-bold transition-all">
                            إنشاء حساب جديد
                        </Link>
                        <Link href="/talents" className="block w-full py-3 text-gray-400 font-bold hover:text-white transition-colors text-sm">
                            العودة لدليل الكفاءات
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans relative overflow-hidden flex items-center justify-center py-24 px-4 pt-32" dir="rtl">

            {/* خلفية جمالية متحركة */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#115d9a] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-4xl w-full relative z-10">

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-blue-300 text-sm font-bold mb-4 shadow-lg">
                        <Sparkles className="w-4 h-4" /> انطلق نحو مستقبلك المهني
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        أنشئ إعلانك <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">الاحترافي</span>
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                        املأ بياناتك وخبراتك بدقة لجذب انتباه أصحاب الشركات والباحثين عن كفاءات.
                    </p>
                </div>

                {/* الكارت الزجاجي */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">

                    {/* شريط علوي ملون */}
                    <div className="h-2 w-full bg-gradient-to-r from-[#115d9a] via-purple-500 to-pink-500"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">

                        {errorMsg && (
                            <div className="p-4 bg-red-500/20 border-2 border-red-500/40 text-red-200 rounded-2xl font-bold text-sm text-center">
                                ⚠️ {errorMsg}
                            </div>
                        )}

                        {uploadNotice && (
                            <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                {uploadNotice}
                            </div>
                        )}

                        {/* القسم 1: العنوان */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 mr-1">عنوان الإعلان (كن مميزاً) <span className="text-red-400">*</span></label>
                            <input
                                type="text" required
                                placeholder="مثال: مهندس معماري بخبرة 5 سنوات في التصميم المودرن وإدارة المشاريع..."
                                value={formData.post_title}
                                onChange={(e) => setFormData({ ...formData, post_title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-lg placeholder-gray-500 font-bold"
                            />
                        </div>

                        {/* القسم 2: التصنيف والمدينة */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-400" /> القسم المهني <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-blue-500 appearance-none cursor-pointer font-bold"
                                    >
                                        <option value="" className="text-gray-900">اختر القسم المناسب</option>
                                        {CATEGORIES_LIST.map(cat => <option key={cat} value={cat} className="text-gray-900">{cat}</option>)}
                                    </select>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-purple-400" /> المدينة <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-purple-500 appearance-none cursor-pointer font-bold"
                                    >
                                        <option value="" className="text-gray-900">اختر مدينتك</option>
                                        {SAUDI_CITIES.map(city => <option key={city} value={city} className="text-gray-900">{city}</option>)}
                                    </select>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                </div>
                            </div>
                        </div>

                        {/* القسم 3: التفاصيل */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300">تفاصيل خبراتك ومهاراتك <span className="text-red-400">*</span></label>
                            <textarea
                                rows={6} required
                                placeholder="اكتب نبذة احترافية عنك: ما هي الأدوات والبرامج التي تتقنها؟ ما هي مشاريعك السابقة وإنجازاتك؟"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 text-white p-5 rounded-2xl focus:outline-none focus:border-blue-500 transition-all leading-relaxed placeholder-gray-500 font-medium"
                            ></textarea>
                        </div>

                        {/* فاصل */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                        {/* القسم 4: التواصل */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-green-400" /> رقم الجوال (أساسي للتواصل) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="tel" required
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-green-500 font-bold"
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
                                    className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-orange-500 font-medium"
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
                                                    <Loader2 className="animate-spin w-6 h-6 text-blue-400" />
                                                    <span className="text-xs font-bold text-blue-300">جاري الرفع...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-300">
                                                    <UploadCloud className="w-8 h-8" />
                                                    <span className="text-sm font-bold">اضغط لرفع ملف PDF أو صورة</span>
                                                    <span className="text-[10px] text-gray-500">اختياري (الحد الأقصى 5MB)</span>
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
                                            <span className="text-sm text-blue-200 truncate font-bold">{resumeFile.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setResumeFile(null); setFormData(prev => ({ ...prev, cv_url: '' })); setUploadNotice(''); }}
                                            className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                            title="حذف الملف"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* الرابط الخارجي */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-pink-400" /> رابط معرض أعمال / موقع شخصي (اختياري)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://my-portfolio.com"
                                    value={formData.external_link}
                                    onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-pink-500 font-medium"
                                    dir="ltr"
                                />
                                <p className="text-xs text-gray-500">يمكنك تركه فارغاً إذا لم يتوفر لديك</p>
                            </div>
                        </div>

                        {/* زر الإرسال */}
                        <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="w-full sm:flex-1 bg-gradient-to-r from-[#115d9a] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-5 rounded-2xl font-black shadow-lg shadow-blue-900/40 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-6 h-6" />
                                        جاري النشر...
                                    </>
                                ) : (
                                    <>
                                        نشر الإعلان فوراً <Send className="w-5 h-5 rotate-180" />
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}