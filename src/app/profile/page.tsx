'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import {
    User, MapPin, Briefcase, Mail, Phone,
    Linkedin, Globe, Edit2, Save, X, Loader2,
    Camera, Building2, Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState<any>(null); // Auth user
    const [profile, setProfile] = useState<any>(null); // DB profile

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        job_title: '',
        bio: '',
        city: '',
        phone_number: '',
        linkedin_url: '',
        portfolio_url: '',
        skills: '' // Comma separated string for input
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                router.push('/login');
                return;
            }

            setUser(authUser);

            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setFormData({
                    full_name: profileData.full_name || '',
                    job_title: profileData.job_title || '',
                    bio: profileData.bio || '',
                    city: profileData.city || '',
                    phone_number: profileData.phone_number || '',
                    linkedin_url: profileData.linkedin_url || '',
                    portfolio_url: profileData.portfolio_url || '',
                    skills: Array.isArray(profileData.skills) ? profileData.skills.join(', ') : ''
                });
            }
            setLoading(false);
        };

        fetchProfile();
    }, [router, supabase]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert skills string to array
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

            const updates = {
                full_name: formData.full_name,
                job_title: formData.job_title,
                bio: formData.bio,
                city: formData.city,
                phone_number: formData.phone_number,
                linkedin_url: formData.linkedin_url,
                portfolio_url: formData.portfolio_url,
                skills: skillsArray,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            // Update local state
            setProfile({ ...profile, ...updates });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('فشل حفظ التغييرات');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#115d9a]" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* 1. Header Card (Hero) */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                    {/* Cover Background (Optional/Decorative) */}
                    <div className="h-32 bg-gradient-to-r from-[#115d9a] to-teal-500"></div>

                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center text-gray-400 bg-gray-100">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16" />
                                    )}
                                </div>
                                {/* Optional: Avatar Upload Button could go here */}
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white border border-gray-200 hover:border-[#115d9a] text-gray-700 hover:text-[#115d9a] px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    تعديل الملف
                                </button>
                            )}
                        </div>

                        {/* Basic Info */}
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">الاسم الكامل</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">المسمى الوظيفي</label>
                                    <input
                                        type="text"
                                        value={formData.job_title}
                                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none"
                                        placeholder="مثال: مطور واجهات أمامية"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">المدينة</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none"
                                        placeholder="الرياض، جدة..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 mb-1">{profile.full_name}</h1>
                                <p className="text-xl text-[#115d9a] font-medium mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    {profile.job_title || 'لم يحدد المسمى الوظيفي'}
                                </p>

                                <div className="flex flex-wrap gap-4 text-gray-500 text-sm font-medium">
                                    {profile.city && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> {profile.city}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> انضم في {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 2. Main Content (Right Column) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* About Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#115d9a]" /> نبذة عني
                            </h2>
                            {isEditing ? (
                                <textarea
                                    rows={5}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none resize-none"
                                    placeholder="اكتب نبذة مختصرة عن خبراتك ومهاراتك..."
                                />
                            ) : (
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {profile.bio || 'لا توجد نبذة شخصية مضافة بعد.'}
                                </p>
                            )}
                        </div>

                        {/* Skills Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#115d9a]" /> المهارات
                            </h2>
                            {isEditing ? (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">أدخل المهارات (مفصولة بفاصلة)</label>
                                    <input
                                        type="text"
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#115d9a] focus:border-transparent outline-none"
                                        placeholder="React, Design, Team Leadership..."
                                    />
                                    <p className="text-xs text-gray-500 mt-2">افصل بين المهارات بفاصلة (,)</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills && profile.skills.length > 0 ? (
                                        profile.skills.map((skill: string, index: number) => (
                                            <span key={index} className="bg-blue-50 text-[#115d9a] px-4 py-2 rounded-xl font-bold text-sm border border-blue-100">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-sm">لم يتم إضافة مهارات بعد.</span>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* 3. Sidebar (Left Column) - Contact Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">معلومات التواصل</h2>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600 text-sm overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-[#115d9a]">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-xs text-gray-400 font-bold mb-0.5">البريد الإلكتروني</p>
                                        <p className="font-medium truncate">{user.email}</p>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف</label>
                                            <div className="relative">
                                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.phone_number}
                                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                    className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#115d9a] outline-none"
                                                    placeholder="05xxxxxxxx"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">حساب LinkedIn</label>
                                            <div className="relative">
                                                <Linkedin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.linkedin_url}
                                                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                                    className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#115d9a] outline-none"
                                                    placeholder="https://linkedin.com/in/..."
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">معرض الأعمال (Portfolio)</label>
                                            <div className="relative">
                                                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.portfolio_url}
                                                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                                                    className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#115d9a] outline-none"
                                                    placeholder="https://myportfolio.com"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {profile.phone_number && (
                                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-[#115d9a]">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold mb-0.5">رقم الهاتف</p>
                                                    <p className="font-medium font-numeric">{profile.phone_number}</p>
                                                </div>
                                            </div>
                                        )}
                                        {profile.linkedin_url && (
                                            <Link href={profile.linkedin_url} target="_blank" className="flex items-center gap-3 text-gray-600 text-sm hover:text-blue-700 transition-colors group">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <Linkedin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold mb-0.5">LinkedIn</p>
                                                    <p className="font-medium truncate max-w-[150px]">Visit Profile</p>
                                                </div>
                                            </Link>
                                        )}
                                        {profile.portfolio_url && (
                                            <Link href={profile.portfolio_url} target="_blank" className="flex items-center gap-3 text-gray-600 text-sm hover:text-teal-600 transition-colors group">
                                                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                                                    <Globe className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold mb-0.5">معرض الأعمال</p>
                                                    <p className="font-medium truncate max-w-[150px]">Visit Website</p>
                                                </div>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 bg-[#115d9a] text-white py-3 rounded-xl font-bold hover:bg-[#0e4d82] transition-colors shadow-lg flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    حفظ التغييرات
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    disabled={saving}
                                    className="px-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}