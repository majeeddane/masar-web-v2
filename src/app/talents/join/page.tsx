'use client';
import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop';
import {
    User, Briefcase, Phone, Globe, MapPin, Linkedin, Github, Upload,
    X, Plus, Save, FileText, Loader2, Camera, Trash2, ChevronRight,
    CheckCircle2, ZoomIn, ZoomOut, Check
} from 'lucide-react';

// دالة قص الصورة (تعمل في المتصفح)
async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(
        image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
    );
    return new Promise((resolve) => {
        canvas.toBlob((blob) => { resolve(blob!); }, 'image/jpeg', 0.95);
    });
}

type Experience = {
    id?: string; company: string; position: string; start_date: string;
    end_date: string; description: string; is_current: boolean;
};

export default function ProfessionalProfileSetup() {
    const router = useRouter();
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    // حالات الصفحة
    const [loading, setLoading] = useState(true); // نبدأ بالتحميل
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [user, setUser] = useState<any>(null);

    // البيانات
    const [profile, setProfile] = useState({
        full_name: '', headline: '', location: '', phone: '', website: '',
        linkedin: '', github: '', bio: '', avatar_url: '', resume_url: '',
    });
    const [skills, setSkills] = useState<string[]>([]);
    const [currentSkill, setCurrentSkill] = useState('');
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [newExp, setNewExp] = useState<Experience>({
        company: '', position: '', start_date: '', end_date: '', description: '', is_current: false
    });
    const [showExpForm, setShowExpForm] = useState(false);

    // حالات قص الصورة
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCroppingModalOpen, setIsCroppingModalOpen] = useState(false);

    // تحميل البيانات (مع حماية ضد الأخطاء)
    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { router.push('/login'); return; }
                setUser(user);

                // جلب البروفايل
                const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (p) {
                    setProfile({
                        full_name: p.full_name || '', headline: p.job_title || '', location: p.location || '',
                        phone: p.phone || '', website: p.website || '', linkedin: p.linkedin || '',
                        github: p.github || '', bio: p.bio || '', avatar_url: p.avatar_url || '',
                        resume_url: p.resume_url || '',
                    });
                    if (p.skills) setSkills(p.skills);
                }

                // جلب الخبرات
                const { data: exps } = await supabase.from('experiences').select('*').eq('user_id', user.id);
                if (exps) setExperiences(exps);
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false); // إيقاف التحميل دائماً
            }
        };
        init();
    }, []);

    // 1. اختيار الصورة
    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.addEventListener('load', () => {
                setTempImageSrc(reader.result?.toString() || null);
                setIsCroppingModalOpen(true);
                setZoom(1);
            });
        }
    };

    // 2. حفظ الصورة المقصوصة
    const uploadCroppedImage = async () => {
        if (!tempImageSrc || !croppedAreaPixels || !user) return;
        setSaving(true);
        try {
            const blob = await getCroppedImg(tempImageSrc, croppedAreaPixels);
            const fileName = `${user.id}/${Math.random().toString(36).substring(7)}.jpg`;
            const { error } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true });
            if (error) throw error;
            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
            setIsCroppingModalOpen(false);
            setTempImageSrc(null);
        } catch (e: any) {
            alert('خطأ في رفع الصورة: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    // 3. رفع الـ CV
    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !user) return;
        const file = e.target.files[0];
        const safeName = `${Math.random().toString(36).substring(7)}.pdf`;
        setSaving(true);
        try {
            const { error } = await supabase.storage.from('resumes').upload(`${user.id}/${safeName}`, file);
            if (error) throw error;
            const { data } = supabase.storage.from('resumes').getPublicUrl(`${user.id}/${safeName}`);
            setProfile(prev => ({ ...prev, resume_url: data.publicUrl }));
            alert('تم رفع السيرة الذاتية ✅');
        } catch (e: any) { alert('فشل الرفع: ' + e.message); } finally { setSaving(false); }
    };

    // 4. الحفظ النهائي
    const handleFinalSave = async () => {
        setSaving(true);
        try {
            // حفظ البروفايل
            const { error: pErr } = await supabase.from('profiles').upsert({
                id: user.id, full_name: profile.full_name, job_title: profile.headline,
                location: profile.location, phone: profile.phone, website: profile.website,
                linkedin: profile.linkedin, github: profile.github, bio: profile.bio,
                skills: skills, avatar_url: profile.avatar_url, resume_url: profile.resume_url,
                updated_at: new Date().toISOString()
            });
            if (pErr) throw pErr;

            // حفظ الخبرات الجديدة
            const newExps = experiences.filter(e => e.id?.startsWith('temp-'));
            if (newExps.length > 0) {
                const { error: eErr } = await supabase.from('experiences').insert(
                    newExps.map(e => ({
                        user_id: user.id, position: e.position, company: e.company,
                        start_date: e.start_date || null, end_date: e.end_date || null,
                        description: e.description, is_current: e.is_current
                    }))
                );
                if (eErr) throw eErr;
            }

            alert('✅ تم الحفظ بنجاح!');
            window.location.reload();
        } catch (e: any) {
            console.error(e);
            alert('حدث خطأ أثناء الحفظ: ' + e.message);
        } finally { setSaving(false); }
    };

    // إدارة الخبرات والمهارات
    const addSkill = (e: any) => {
        if (e.key === 'Enter' && currentSkill.trim() && !skills.includes(currentSkill.trim())) {
            setSkills([...skills, currentSkill.trim()]); setCurrentSkill('');
        }
    };
    const saveExperience = () => {
        if (!newExp.position || !newExp.company) return alert('مطلوب المسمى والشركة');
        setExperiences([...experiences, { ...newExp, id: `temp-${Date.now()}` }]);
        setNewExp({ company: '', position: '', start_date: '', end_date: '', description: '', is_current: false });
        setShowExpForm(false);
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-right" dir="rtl">

            {/* نافذة القص */}
            {isCroppingModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                    <div className="relative w-full max-w-md h-96 bg-gray-800 rounded-xl overflow-hidden mb-4">
                        <Cropper
                            image={tempImageSrc!} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop}
                            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} onZoomChange={setZoom} cropShape="round"
                        />
                    </div>
                    <div className="flex items-center gap-4 mb-6 w-full max-w-md">
                        <ZoomOut className="text-white" />
                        <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
                        <ZoomIn className="text-white" />
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setIsCroppingModalOpen(false)} className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold">إلغاء</button>
                        <button onClick={uploadCroppedImage} disabled={saving} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2">
                            {saving ? <Loader2 className="animate-spin" /> : <Check />} قص وحفظ
                        </button>
                    </div>
                </div>
            )}

            {/* القائمة الجانبية */}
            <aside className="w-full md:w-72 bg-white border-l p-6 sticky top-0 md:h-screen z-10 flex flex-col gap-2 shadow-sm">
                <div className="mb-6 flex items-center gap-2 text-blue-600 font-bold text-2xl"><span>مسار</span><CheckCircle2 /></div>
                {[
                    { id: 'basic', label: 'المعلومات الأساسية', icon: User },
                    { id: 'skills', label: 'المهارات والخبرات', icon: Briefcase },
                    { id: 'resume', label: 'السيرة الذاتية', icon: FileText },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <tab.icon className="w-5 h-5" /><span>{tab.label}</span>
                    </button>
                ))}
                <div className="mt-auto">
                    <button onClick={handleFinalSave} disabled={saving} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold flex justify-center gap-2">
                        {saving ? <Loader2 className="animate-spin" /> : <Save />} حفظ التغييرات
                    </button>
                </div>
            </aside>

            {/* المحتوى */}
            <main className="flex-1 p-6 max-w-4xl mx-auto w-full">

                {/* --- المعلومات الأساسية --- */}
                {activeTab === 'basic' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group w-32 h-32">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-50">
                                    {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User className="w-12 h-12 m-auto mt-8 text-gray-300" />}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:scale-110 transition-transform">
                                    <Camera className="w-5 h-5" />
                                    <input type="file" className="hidden" accept="image/*" onChange={onSelectFile} />
                                </label>
                            </div>
                            <div className="text-center md:text-right flex-1">
                                <h3 className="font-bold text-lg">الصورة الشخصية</h3>
                                <p className="text-gray-500 text-sm">اضغط الكاميرا لرفع وقص صورة جديدة.</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border grid md:grid-cols-2 gap-4">
                            <input value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} placeholder="الاسم الكامل" className="p-3 border rounded-xl w-full" />
                            <input value={profile.headline} onChange={e => setProfile({ ...profile, headline: e.target.value })} placeholder="المسمى الوظيفي" className="p-3 border rounded-xl w-full" />
                            <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="نبذة عنك..." className="p-3 border rounded-xl w-full md:col-span-2 h-24" />
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border grid md:grid-cols-2 gap-4">
                            <h3 className="md:col-span-2 font-bold mb-2">معلومات التواصل</h3>
                            <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="رقم الهاتف" className="p-3 border rounded-xl" />
                            <input value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="المدينة" className="p-3 border rounded-xl" />
                            <input value={profile.linkedin} onChange={e => setProfile({ ...profile, linkedin: e.target.value })} placeholder="رابط LinkedIn" className="p-3 border rounded-xl" dir="ltr" />
                            <input value={profile.github} onChange={e => setProfile({ ...profile, github: e.target.value })} placeholder="رابط GitHub" className="p-3 border rounded-xl" dir="ltr" />
                        </div>
                    </div>
                )}

                {/* --- المهارات والخبرات --- */}
                {activeTab === 'skills' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border">
                            <h3 className="font-bold mb-4">المهارات</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {skills.map(s => <span key={s} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg flex items-center gap-2">{s} <button onClick={() => setSkills(skills.filter(i => i !== s))}><X className="w-4 h-4" /></button></span>)}
                            </div>
                            <input value={currentSkill} onChange={e => setCurrentSkill(e.target.value)} onKeyDown={addSkill} placeholder="اكتب المهارة واضغط Enter..." className="w-full p-3 border rounded-xl" />
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold">الخبرات العملية</h3>
                                <button onClick={() => setShowExpForm(true)} className="text-blue-600 flex items-center gap-1 font-bold hover:bg-blue-50 px-3 py-1 rounded-lg"><Plus className="w-4 h-4" /> إضافة</button>
                            </div>
                            {experiences.map(exp => (
                                <div key={exp.id} className="border p-4 rounded-xl mb-3 flex justify-between">
                                    <div>
                                        <h4 className="font-bold">{exp.position}</h4>
                                        <p className="text-gray-600">{exp.company}</p>
                                        <p className="text-sm text-gray-400">{exp.start_date} - {exp.is_current ? 'حتى الآن' : exp.end_date}</p>
                                    </div>
                                    <button onClick={() => setExperiences(experiences.filter(e => e.id !== exp.id))} className="text-red-400"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            ))}
                            {showExpForm && (
                                <div className="bg-gray-50 p-4 rounded-xl border mt-4">
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <input value={newExp.position} onChange={e => setNewExp({ ...newExp, position: e.target.value })} placeholder="المسمى الوظيفي" className="p-3 border rounded-xl" />
                                        <input value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} placeholder="الشركة" className="p-3 border rounded-xl" />
                                        <input type="date" value={newExp.start_date} onChange={e => setNewExp({ ...newExp, start_date: e.target.value })} className="p-3 border rounded-xl" />
                                        <input type="date" value={newExp.end_date} onChange={e => setNewExp({ ...newExp, end_date: e.target.value })} disabled={newExp.is_current} className="p-3 border rounded-xl" />
                                    </div>
                                    <label className="flex items-center gap-2 mb-3"><input type="checkbox" checked={newExp.is_current} onChange={e => setNewExp({ ...newExp, is_current: e.target.checked })} /> ما زلت أعمل هنا</label>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setShowExpForm(false)} className="px-4 py-2">إلغاء</button>
                                        <button onClick={saveExperience} className="px-4 py-2 bg-blue-600 text-white rounded-xl">حفظ</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- السيرة الذاتية --- */}
                {activeTab === 'resume' && (
                    <div className="bg-white p-12 rounded-3xl shadow-sm border text-center">
                        <div className="border-2 border-dashed rounded-3xl p-10 cursor-pointer hover:bg-gray-50 relative">
                            <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleResumeUpload} />
                            <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="font-bold text-lg">ارفع ملف السيرة الذاتية (PDF)</h3>
                        </div>
                        {profile.resume_url && (
                            <div className="mt-6 flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl">
                                <CheckCircle2 className="w-5 h-5" /> <span>تم رفع الملف بنجاح</span>
                                <a href={profile.resume_url} target="_blank" className="underline mr-2">عرض</a>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}