'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Upload, X, Plus, Loader2, CheckCircle, ChevronRight } from 'lucide-react';
import { joinTalent } from '@/lib/talentActions';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

function JoinTalentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');

    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [skills, setSkills] = useState<string[]>([]);
    const [currentSkill, setCurrentSkill] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form States
    const [formData, setFormData] = useState({
        fullName: '',
        jobTitle: '',
        location: '',
        bio: '',
        email: '',
        phone: ''
    });

    // Fetch Data for Editing
    useEffect(() => {
        if (editId) {
            const fetchTalentData = async () => {
                setLoading(true); // Show loading while fetching
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
                        bio: data.bio || '',
                        email: data.email || '',
                        phone: data.phone || ''
                    });

                    // Handle Skills
                    if (Array.isArray(data.skills)) {
                        setSkills(data.skills);
                    } else if (typeof data.skills === 'string') {
                        setSkills(data.skills.split(',').map((s: string) => s.trim()));
                    }

                    // Handle Avatar
                    if (data.avatar_url) {
                        setAvatarPreview(data.avatar_url);
                    }
                }
                setLoading(false);
            };
            fetchTalentData();
        }
    }, [editId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (file.size > maxSize) {
                alert('⚠️ حجم الصورة كبير جداً! الحد الأقصى المسموح به هو 5 ميجابايت فقط.');
                e.target.value = '';
                setAvatarPreview(null);
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            setAvatarPreview(objectUrl);
        }
    };

    const addSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
        if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !currentSkill.trim()) return;
        e.preventDefault();
        if (!skills.includes(currentSkill.trim())) {
            setSkills([...skills, currentSkill.trim()]);
        }
        setCurrentSkill('');
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const submitData = new FormData();
        submitData.append('fullName', formData.fullName);
        submitData.append('jobTitle', formData.jobTitle);
        submitData.append('location', formData.location);
        submitData.append('bio', formData.bio);
        submitData.append('email', formData.email);
        submitData.append('phone', formData.phone);
        submitData.append('skills', JSON.stringify(skills));

        if (fileInputRef.current?.files?.[0]) {
            submitData.append('avatar', fileInputRef.current.files[0]);
        }

        const result = await joinTalent(submitData);

        if (result.success) {
            alert(editId ? 'تم تحديث بياناتك بنجاح!' : 'تم انضمامك بنجاح!');
            if (editId) {
                router.push(`/talents/${editId}`); // Redirect back to profile if editing
            } else {
                router.push('/talents');
            }
        } else {
            alert(result.error || 'حدث خطأ ما');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                    {editId ? 'تحديث ملفك المهني' : 'أنشئ ملفك المهني'}
                </h2>
                <p className="text-gray-500">
                    {editId ? 'قم بتعديل بياناتك وسنقوم بحفظ التغييرات فوراً' : 'انضم لنخبة الكفاءات وابدأ رحلة نجاحك معنا'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Upload Section */}
                <div className="flex flex-col items-center justify-center gap-4">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-32 h-32 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center cursor-pointer transition-all overflow-hidden group"
                    >
                        {avatarPreview ? (
                            <>
                                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-gray-400 group-hover:text-blue-500">
                                <Upload className="w-8 h-8 mx-auto mb-1" />
                                <span className="text-xs font-bold">رفع صورة</span>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <p className="text-xs text-gray-400 font-bold">الحد الأقصى للحجم: 5 ميجابايت (JPG/PNG)</p>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">الاسم الكامل</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            placeholder="مثال: محمد أحمد"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">المسمى الوظيفي</label>
                        <input
                            type="text"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleInputChange}
                            required
                            placeholder="مثال: مصمم جرافيك"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">الموقع الجغرافي</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        placeholder="مثال: الرياض، السعودية"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">نبذة شخصية</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        placeholder="تحدث عن خبراتك، مهاراتك، وماذا تقدم..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
                    />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">البريد الإلكتروني</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            readOnly={!!editId} // Read-only if editing, as email key used for upsert match
                            placeholder="example@mail.com"
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-left ${editId ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">رقم الجوال</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="+966 50 000 0000"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-left"
                            dir="ltr"
                        />
                    </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">المهارات</label>
                    <div className="flex flex-wrap gap-2 p-2 rounded-xl border border-gray-200 min-h-[50px] focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                        {skills.map((skill, index) => (
                            <span key={index} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 group">
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="text-blue-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            onKeyDown={addSkill}
                            placeholder={skills.length === 0 ? "اكتب المهارة واضغط Enter..." : ""}
                            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm p-1"
                        />
                        <button type="button" onClick={addSkill} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0084db] hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-xl mt-8 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            <span>{editId ? 'حفظ التعديلات' : 'تأكيد الانضمام'}</span>
                            <CheckCircle className="w-5 h-5" />
                        </>
                    )}
                </button>

            </form>
        </div>
    );
}

export default function JoinTalentPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <h1 className="text-xl font-black text-gray-900">انضم ككفاءة</h1>
                    <Link href="/talents" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm transition-colors">
                        <ChevronRight className="w-4 h-4" />
                        العودة
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-3xl">
                <Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
                    <JoinTalentForm />
                </Suspense>
            </main>
        </div>
    );
}