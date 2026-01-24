'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('كلمة المرور غير متطابقة');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) throw error;

            setSuccess(true);
            // Optional: Redirect after a few seconds
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
        } catch (err: any) {
            console.error('Update Password Error:', err);
            setError(err.message || 'حدث خطأ أثناء تحديث كلمة المرور');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>

            <div className="flex-1 flex items-center justify-center px-4 relative z-10">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-fade-in-up">
                    <div className="p-8">
                        {success ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-blue-950 mb-2">تم التحديث بنجاح!</h2>
                                <p className="text-slate-500 mb-8">
                                    تم تغيير كلمة المرور الخاصة بك. سيتم توجيهك إلى لوحة التحكم...
                                </p>
                                <Link
                                    href="/dashboard"
                                    className="inline-block w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold shadow-md transition-all"
                                >
                                    الذهاب للوحة التحكم الآن
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-blue-950 mb-2">تعيين كلمة مرور جديدة</h2>
                                    <p className="text-slate-500">أدخل كلمة المرور الجديدة لحسابك</p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleUpdatePassword} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور الجديدة</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                minLength={6}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                                dir="ltr"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">تأكيد كلمة المرور</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                minLength={6}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                                dir="ltr"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                جاري التحديث...
                                            </>
                                        ) : (
                                            'تحديث كلمة المرور'
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
