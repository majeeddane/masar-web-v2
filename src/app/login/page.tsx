'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. محاولة تسجيل الدخول
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                throw signInError;
            }

            if (data.user) {
                // 2. خطوة التحديث الفوري (مهم جداً للناف بار)
                router.refresh();

                // 3. فحص هل المستخدم "جديد" أم "قديم"؟
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, job_title')
                    .eq('id', data.user.id)
                    .single();

                // المنطق الذكي للتوجيه
                if (profile && (profile.full_name || profile.job_title)) {
                    // إذا كان لديه اسم أو وظيفة -> خذه للرئيسية
                    // نستخدم window.location لضمان تحديث الصفحة بالكامل
                    window.location.href = '/';
                } else {
                    // إذا كان ملفه فارغاً -> خذه لإكمال البيانات
                    router.push('/talents/join'); // أو صفحة التعديل الخاصة بك
                }
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                        م
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">مرحباً بعودتك</h1>
                    <p className="text-gray-500 mt-2">سجل دخولك للمتابعة في مسار</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                        <div className="relative">
                            <Mail className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-12 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-right"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700">كلمة المرور</label>
                            <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                                نسيت كلمة المرور؟
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-12 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-right"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>تسجيل الدخول</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    ليس لديك حساب؟{' '}
                    <Link href="/signup" className="text-blue-600 font-bold hover:underline">
                        إنشاء حساب جديد
                    </Link>
                </div>
            </div>
        </div>
    );
}