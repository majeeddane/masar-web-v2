'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { joinTalent } from '@/lib/talentActions';
import { ShieldCheck, Upload, FileText, Loader2, X, Image as ImageIcon } from 'lucide-react';

export default function JoinPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams.get('id');

    const [isLoading, setIsLoading] = useState(false);
    const [existingCv, setExistingCv] = useState('');

    // --- 1. حالة جديدة لمعاينة الصورة ---
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // --- 2. حالة جديدة لنظام المهارات (Tags) ---
    const [skillsList, setSkillsList] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        jobTitle: '',
        location: '',
        nationality: '',
        bio: '',
        email: '',
        phone: '',
    });

    // جلب البيانات
    useEffect(() => {
        if (editId) {
            const fetchTalentData = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', editId)
                    .single();

                if (data && !error) {
                    setFormData({
                        fullName: data.full_name || '',
                        jobTitle: data.job_title || '',
                        location: data.location || '',
                        nationality: data.nationality || '',
                        bio: data.bio || '',
                        email: data.email || '',
                        phone: data.phone || '',
                    });
                    if (data.cv_url) setExistingCv(data.cv_url);

                    // ضبط الصورة الحالية
                    if (data.avatar_url) setAvatarPreview(data.avatar_url);

                    // ضبط المهارات وتحويلها لمصفوفة
                    if (data.skills && Array.isArray(data.skills)) {
                        setSkillsList(data.skills);
                    } else if (typeof data.skills === 'string') {
                        setSkillsList(data.skills.split(',').map((s: string) => s.trim()));
                    }
                }
            };
            fetchTalentData();
        }
    }, [editId]);

    // --- منطق التعامل مع المهارات ---
    const handleSkillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // منع إرسال النموذج
            if (skillInput.trim()) {
                if (!skillsList.includes(skillInput.trim())) {
                    setSkillsList([...skillsList, skillInput.trim()]);
                }
                setSkillInput('');
            }
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkillsList(skillsList.filter(skill => skill !== skillToRemove));
    };

    // --- منطق معاينة الصورة المحلية عند الرفع ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setAvatarPreview(objectUrl);
        }
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formPayload = new FormData(event.currentTarget);

        // مهم جداً: استبدال نص المهارات بالمصفوفة الجديدة
        // سنرسلها كنص مفصول بفاصلة لكي يفهمها السيرفر كما هو معتاد
        formPayload.set('skills', skillsList.join(','));

        try {
            const result = await joinTalent(formPayload);
            if (result?.success) {
                alert('تم حفظ التعديلات بنجاح! 🌟');
                router.push('/talents');
                router.refresh();
            } else {
                alert('حدث خطأ: ' + (result?.error || 'غير معروف'));
            }
        } catch (e) {
            console.error(e);
            alert('حدث خطأ في الاتصال');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <div className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-gray-100">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-4">
                        {editId ? 'تحديث ملفك المهني' : 'أنشئ ملفك المهني'}
                    </h1>
                    <p className="text-gray-500">حدث بياناتك لتظهر بأفضل صورة للشركات</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* --- قسم الصورة المحسن --- */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="relative group cursor-pointer w-40 h-40">
                            <div className={`w-full h-full rounded-full border-4 ${avatarPreview ? 'border-white shadow-xl' : 'border-dashed border-gray-300'} flex items-center justify-center overflow-hidden transition-all relative`}>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <span className="text-xs text-gray-400 font-bold">رفع صورة</span>
                                    </div>
                                )}

                                {/* Overlay عند التحويم */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                name="avatar"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-3 font-medium">اضغط لتغيير الصورة</p>
                    </div>

                    {/* الحقول النصية */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">الاسم الكامل</label>
                            <input name="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="مثال: محمد أحمد" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">المسمى الوظيفي</label>
                            <input name="jobTitle" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="مثال: مصمم جرافيك" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">الموقع الجغرافي</label>
                            <input name="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="مثال: الرياض" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">الجنسية</label>
                            <input name="nationality" value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="مثال: سعودي" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">نبذة شخصية</label>
                        <textarea name="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none" placeholder="تحدث عن خبراتك..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">البريد الإلكتروني</label>
                            <input name="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required readOnly={!!editId} className={`w-full px-4 py-3 rounded-xl border border-gray-200 outline-none transition-all ${editId ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:border-[#0084db] focus:ring-4 focus:ring-blue-50'}`} placeholder="example@mail.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">رقم الجوال</label>
                            <input name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="0500000000" />
                        </div>
                    </div>

                    {/* --- قسم المهارات الاحترافي (Tags) --- */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 block">المهارات والقدرات</label>
                        <div className="w-full px-4 py-3 rounded-xl border border-gray-200 focus-within:border-[#0084db] focus-within:ring-4 focus-within:ring-blue-50 transition-all bg-white min-h-[60px] flex flex-wrap gap-2 items-center">
                            {skillsList.map((skill, index) => (
                                <span key={index} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 group animate-in fade-in zoom-in duration-200">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="hover:bg-blue-100 rounded-full p-0.5 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <input
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillKeyDown}
                                className="flex-1 outline-none bg-transparent min-w-[150px] text-sm font-medium"
                                placeholder={skillsList.length === 0 ? "اكتب مهارة واضغط Enter (مثال: فوتوشوب)" : "أضف المزيد..."}
                            />
                        </div>
                        <p className="text-xs text-gray-400">نصيحة: اضغط Enter بعد كتابة كل مهارة لإضافتها</p>
                        {/* حقل مخفي لإرسال البيانات للسيرفر */}
                        <input type="hidden" name="skills" value={skillsList.join(',')} />
                    </div>

                    {/* قسم السيرة الذاتية */}
                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                            <FileText className="w-5 h-5 text-[#0084db]" />
                            السيرة الذاتية (PDF)
                        </label>
                        <div className="relative group">
                            <input type="file" name="cv" accept=".pdf" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer" />
                        </div>
                        {existingCv && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 font-bold bg-green-50 p-3 rounded-xl border border-green-100">
                                <ShieldCheck className="w-4 h-4" />
                                ملفك محفوظ وآمن (ارفع جديداً فقط إذا أردت استبداله)
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-[#0084db] text-white font-black py-4 rounded-xl hover:bg-[#006bb3] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]">
                        {isLoading ? (
                            <> <Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ... </>
                        ) : (
                            editId ? 'حفظ التعديلات' : 'انضمام الآن'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}