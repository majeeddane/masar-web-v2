'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Save, Lock, Bell, User, Mail, Smartphone, Briefcase, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [fullName, setFullName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Fetch User Data
    useEffect(() => {
        const fetchUserData = async () => {
            setFetching(true);
            const { data: { user }, error } = await supabase.auth.getUser();

            if (user) {
                setEmail(user.email || '');
                setFullName(user.user_metadata?.full_name || '');
                setJobTitle(user.user_metadata?.job_title || '');
                setPhone(user.user_metadata?.phone || '');
                setAvatarUrl(user.user_metadata?.avatar_url || null);
            }
            if (error) {
                console.error('Error fetching user:', error);
            }
            setFetching(false);
        };

        fetchUserData();
    }, []);

    // Handle Profile Update
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // ONLY update user metadata (data object). 
        // We do NOT include 'email' or 'phone' at the root level to avoid triggering auth verification flows.
        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: fullName,
                job_title: jobTitle,
                phone: phone,
                // avatar_url is updated separately immediately after upload, but good to ensure consistency if needed.
                // However, we rely on the specific upload handler for that.
            }
        });

        if (error) {
            console.error('Supabase Update Error:', error);
            setMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ التغييرات. يرجى المحاولة مرة أخرى.' });
        } else {
            setMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح!' });
        }
        setLoading(false);
    };

    // Handle Avatar Upload
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        setUploading(true);
        setMessage(null);
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();

        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const filePath = `${user.id}/${Math.random()}.${fileExt}`;

        try {
            // 1. Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update User Metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            // 4. Update UI
            setAvatarUrl(publicUrl);
            setMessage({ type: 'success', text: 'تم تحديث الصورة الشخصية بنجاح!' });

        } catch (error) {
            console.error('Error uploading avatar:', error);
            setMessage({ type: 'error', text: 'حدث خطأ أثناء رفع الصورة.' });
        } finally {
            setUploading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-blue-950">الإعدادات</h1>
                <p className="text-slate-500 mt-2">إدارة ملفك الشخصي وتفضيلات الأمان</p>
            </div>

            {/* Feedback Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'} animate-fade-in`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card (1/3) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center">
                        <div className="relative mb-6 group">
                            <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative">
                                {uploading ? (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                                        <Loader2 className="animate-spin text-white" size={32} />
                                    </div>
                                ) : null}

                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-slate-300" />
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                title="تغيير الصورة"
                            >
                                <Camera size={18} />
                            </button>
                        </div>

                        <h2 className="text-xl font-bold text-blue-950">{fullName || 'مستخدم جديد'}</h2>
                        <p className="text-slate-500 mb-6">{jobTitle}</p>

                        <div className="w-full pt-6 border-t border-slate-100 flex justify-between text-sm">
                            <div className="text-center">
                                <span className="block font-bold text-slate-700">12</span>
                                <span className="text-slate-400">مشاريع</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-slate-700">85%</span>
                                <span className="text-slate-400">اكتمال الملف</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-slate-700">24</span>
                                <span className="text-slate-400">مشاهدة</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Forms (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Personal Info Form */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <User size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">المعلومات الشخصية</h3>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">المسمى الوظيفي</label>
                                        <div className="relative">
                                            <Briefcase size={18} className="absolute top-1/2 -translate-y-1/2 right-3 rtl:left-3 text-slate-400 left-auto" />
                                            <input
                                                type="text"
                                                value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                                            <input
                                                type="email"
                                                value={email}
                                                readOnly
                                                className="w-full px-4 py-3 pl-10 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 cursor-not-allowed"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف</label>
                                        <div className="relative">
                                            <Smartphone size={18} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-slate-700"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>جاري الحفظ...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                <span>حفظ التغييرات</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    {/* Security Section (UI Only for now) */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                <Shield size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">الأمان وكلمة المرور</h3>
                        </div>
                        <div className="p-8">
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور الحالية</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" dir="ltr" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور الجديدة</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" dir="ltr" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">تأكيد كلمة المرور</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" dir="ltr" />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button type="button" className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all">
                                        تحديث كلمة المرور
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    {/* Notifications Section (UI Only for now) */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <Bell size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">التنبيهات</h3>
                        </div>
                        <div className="p-8 space-y-6">
                            {[
                                { title: 'تنبيهات الوظائف', desc: 'استلم إشعارات عند توفر وظائف تناسب مهاراتك' },
                                { title: 'تحديثات المنصة', desc: 'أخبار وميزات جديدة في منصة مسار' },
                                { title: 'تنبيهات الأمان', desc: 'إشعارات حول نشاط حسابك والأمان' },
                            ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div>
                                        <div className="font-medium text-slate-800">{item.title}</div>
                                        <div className="text-sm text-slate-500">{item.desc}</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
