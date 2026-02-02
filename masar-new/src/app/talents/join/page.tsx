'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { joinTalent } from '@/lib/talentActions';
import { ShieldCheck, Upload, FileText, Loader2, X, Image as ImageIcon, Check } from 'lucide-react';
import Cropper from 'react-easy-crop'; // استيراد مكتبة القص
import { getCroppedImg } from '@/lib/cropImage'; // استيراد دالة القص المساعدة

export default function JoinPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams.get('id');

    const [isLoading, setIsLoading] = useState(false);
    const [existingCv, setExistingCv] = useState('');

    // --- حالات القص (Cropping States) ---
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null); // الصورة الأصلية للقص
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false); // هل نافذة القص مفتوحة؟
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null); // النتيجة النهائية

    // --- حالات المهارات ---
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
                    if (data.avatar_url) setAvatarPreview(data.avatar_url);
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

    // --- منطق المهارات ---
    const handleSkillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
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

    // --- منطق اختيار الصورة والبدء بالقص ---
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl); // وضع الصورة في المعالجة
            setIsCropping(true); // فتح نافذة القص
            // مسح القيمة لكي يسمح باختيار نفس الملف مرة أخرى إذا ألغى المستخدم
            e.target.value = '';
        }
    };

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result as string));
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // --- تنفيذ القص والحفظ المؤقت ---
    const showCroppedImage = async () => {
        try {
            if (!imageSrc || !croppedAreaPixels) return;
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

            if (croppedImageBlob) {
                setCroppedBlob(croppedImageBlob); // حفظ الملف الفعلي للإرسال لاحقاً
                setAvatarPreview(URL.createObjectURL(croppedImageBlob)); // عرض النتيجة
                setIsCropping(false); // إغلاق النافذة
            }
        } catch (e) {
            console.error(e);
        }
    };

    // --- الإرسال النهائي للسيرفر ---
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formPayload = new FormData(event.currentTarget);
        formPayload.set('skills', skillsList.join(','));

        // *** السحر هنا: استبدال ملف الصورة الأصلي بالملف المقصوص ***
        if (croppedBlob) {
            formPayload.delete('avatar'); // حذف الملف الأصلي الكبير
            formPayload.append('avatar', croppedBlob, 'avatar.jpg'); // إضافة المقصوص
        }

        try {
            const result = await joinTalent(formPayload);
            if (result?.success) {
                alert('تم حفظ البيانات بنجاح! 🚀');
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

            {/* --- نافذة القص (Modal) --- */}
            {isCropping && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">تعديل الصورة الشخصية</h3>
                            <button onClick={() => setIsCropping(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative w-full h-80 bg-gray-900">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // نسبة 1:1 للصورة الدائرية
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                objectFit="contain"
                            />
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-gray-500">تصغير</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0084db]"
                                />
                                <span className="text-xs font-bold text-gray-500">تكبير</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={showCroppedImage}
                                    className="flex-1 bg-[#0084db] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#006bb3] transition-colors"
                                >
                                    <Check className="w-5 h-5" /> اعتماد الصورة
                                </button>
                                <button
                                    onClick={() => setIsCropping(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-gray-100">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-4">
                        {editId ? 'تحديث ملفك المهني' : 'أنشئ ملفك المهني'}
                    </h1>
                    <p className="text-gray-500">حدث بياناتك لتظهر بأفضل صورة للشركات</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* --- قسم الصورة (الزر فقط يفتح القص) --- */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="relative group cursor-pointer w-40 h-40">
                            <div className={`w-full h-full rounded-full border-4 ${avatarPreview ? 'border-white shadow-xl' : 'border-dashed border-gray-300'} flex items-center justify-center overflow-hidden transition-all relative bg-gray-50`}>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <span className="text-xs text-gray-400 font-bold">رفع صورة</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onFileChange} // لاحظ: لم نعد نستخدم name="avatar" هنا مباشرة
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-3 font-medium">اضغط لتغيير الصورة (يمكنك القص والتكبير)</p>
                    </div>

                    {/* الحقول النصية (نفس السابق) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">الاسم الكامل</label>
                            <input name="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">المسمى الوظيفي</label>
                            <input name="jobTitle" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all" />
                        </div>
                    </div>
                    {/* ... باقي الحقول كما هي ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">الموقع الجغرافي</label>
                            <input name="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">الجنسية</label>
                            <input name="nationality" value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">نبذة شخصية</label>
                        <textarea name="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">البريد الإلكتروني</label>
                            <input name="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required readOnly={!!editId} className={`w-full px-4 py-3 rounded-xl border border-gray-200 outline-none transition-all ${editId ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:border-[#0084db] focus:ring-4 focus:ring-blue-50'}`} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">رقم الجوال</label>
                            <input name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] focus:ring-4 focus:ring-blue-50 outline-none transition-all" />
                        </div>
                    </div>

                    {/* قسم المهارات */}
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
                                placeholder="اكتب مهارة واضغط Enter..."
                            />
                        </div>
                        <input type="hidden" name="skills" value={skillsList.join(',')} />
                    </div>

                    {/* قسم السيرة الذاتية */}
                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                            <FileText className="w-5 h-5 text-[#0084db]" />
                            السيرة الذاتية (PDF)
                        </label>
                        <input type="file" name="cv" accept=".pdf" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer" />
                        {existingCv && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 font-bold bg-green-50 p-3 rounded-xl border border-green-100">
                                <ShieldCheck className="w-4 h-4" />
                                ملفك محفوظ (ارفع جديداً للاستبدال)
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