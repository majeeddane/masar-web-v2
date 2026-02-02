'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { joinTalent } from '@/lib/talentActions';
import { ShieldCheck, Upload, FileText, Loader2, X, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';
import ExperienceSection from '@/components/ExperienceSection';

export default function JoinPage() {
    const router = useRouter();

    // حالات التحميل
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [existingCv, setExistingCv] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string>('');

    // حالات القص (Cropping)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

    // حالات المهارات
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

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setCurrentUserId(user.id);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data && !error) {
                setFormData({
                    fullName: data.full_name || '',
                    jobTitle: data.job_title || '',
                    location: data.location || '',
                    nationality: data.nationality || '',
                    bio: data.bio || '',
                    email: data.email || user.email || '',
                    phone: data.phone || '',
                });
                if (data.cv_url) setExistingCv(data.cv_url);
                if (data.avatar_url) setAvatarPreview(data.avatar_url);
                if (data.skills) {
                    if (Array.isArray(data.skills)) {
                        setSkillsList(data.skills);
                    } else if (typeof data.skills === 'string') {
                        setSkillsList(data.skills.split(',').map((s: string) => s.trim()));
                    }
                }
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, [router]);

    // منطق المهارات
    const handleSkillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
                setSkillsList([...skillsList, skillInput.trim()]);
                setSkillInput('');
            }
        }
    };
    const removeSkill = (skillToRemove: string) => {
        setSkillsList(skillsList.filter(skill => skill !== skillToRemove));
    };

    // منطق الصور
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result as string);
                setIsCropping(true);
            });
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };
    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => setCroppedAreaPixels(croppedAreaPixels), []);
    const showCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImageBlob) {
                setCroppedBlob(croppedImageBlob);
                setAvatarPreview(URL.createObjectURL(croppedImageBlob));
                setIsCropping(false);
            }
        } catch (e) { console.error(e); }
    };

    // الإرسال
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);

        const formPayload = new FormData(event.currentTarget);
        formPayload.set('skills', skillsList.join(','));

        if (croppedBlob) {
            formPayload.delete('avatar');
            formPayload.append('avatar', croppedBlob, 'avatar.jpg');
        }

        try {
            const result = await joinTalent(formPayload);
            if (result?.success) {
                alert('تم حفظ البيانات بنجاح! 🚀');
                router.refresh();
            } else {
                alert('حدث خطأ: ' + (result?.error || 'غير معروف'));
            }
        } catch (e) {
            alert('حدث خطأ في الاتصال');
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#0084db]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            {/* Modal للقص */}
            {isCropping && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="relative w-full h-80 bg-gray-900">
                            <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} objectFit="contain" />
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[#0084db]" />
                            <div className="flex gap-3">
                                <button onClick={showCroppedImage} className="flex-1 bg-[#0084db] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">اعتماد</button>
                                <button onClick={() => setIsCropping(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold">إلغاء</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-gray-100">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-4">ملفي الشخصي</h1>
                    <p className="text-gray-500">حدث بياناتك لتظهر بأفضل صورة للشركات</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* الصورة */}
                    <div className="flex justify-center mb-8">
                        <div className="relative group cursor-pointer w-32 h-32">
                            <div className={`w-full h-full rounded-full border-4 overflow-hidden ${avatarPreview ? 'border-white shadow-lg' : 'border-dashed border-gray-300'}`}>
                                {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" /> : <Upload className="w-8 h-8 text-gray-400 m-auto mt-10" />}
                            </div>
                            <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    {/* الحقول الأساسية */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <input name="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="الاسم الكامل" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none" required />
                        <input name="jobTitle" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} placeholder="المسمى الوظيفي" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none" required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <input name="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="الموقع" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none" required />
                        <input name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="الجوال" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none" required />
                    </div>
                    <textarea name="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} placeholder="نبذة شخصية" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none resize-none" />

                    {/* المهارات */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <label className="font-bold text-sm mb-2 block">المهارات</label>
                        <div className="flex flex-wrap gap-2">
                            {skillsList.map((skill, i) => (
                                <span key={i} className="bg-white border px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                                    {skill} <button type="button" onClick={() => removeSkill(skill)}><X className="w-3 h-3 text-red-400" /></button>
                                </span>
                            ))}
                            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="أضف مهارة..." className="bg-transparent outline-none min-w-[100px] text-sm" />
                        </div>
                        <input type="hidden" name="skills" value={skillsList.join(',')} />
                    </div>

                    {/* 🔥🔥 قسم الخبرات (Timeline) 🔥🔥 */}
                    {currentUserId && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <ExperienceSection userId={currentUserId} />
                        </div>
                    )}

                    {/* السيرة الذاتية */}
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                        <label className="flex items-center gap-2 font-bold text-sm mb-3"><FileText className="w-4 h-4 text-[#0084db]" /> السيرة الذاتية (PDF)</label>
                        <input type="file" name="cv" accept=".pdf" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        {existingCv && <p className="text-xs text-green-600 font-bold mt-2">✅ يوجد ملف محفوظ</p>}
                    </div>

                    <button type="submit" disabled={isSaving} className="w-full bg-[#0084db] text-white py-4 rounded-xl font-black text-lg hover:bg-[#006bb3] transition-all shadow-lg flex justify-center items-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : 'حفظ التعديلات'}
                    </button>
                </form>
            </div>
        </div>
    );
}