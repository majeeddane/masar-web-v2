'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Briefcase, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            if (error) {
                // Handle "User already exists" nicely
                if (error.message.includes("User already registered")) {
                    throw new Error("هذا البريد الإلكتروني مسجل بالفعل.");
                }
                throw error;
            }

            // Success state
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse pointer-events-none" />

            {/* Header / Nav */}
            <header className="absolute top-0 w-full z-50 p-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white shadow-lg group-hover:bg-white/20 transition-colors">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">مسار</span>
                </Link>

                <Link href="/" className="text-white/80 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                    العودة للرئيسية
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </header>

            <div className="flex-1 flex items-center justify-center px-4 relative z-10 pt-20 pb-10">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-fade-in-up">
                    <div className="p-8">

                        {success ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-blue-950 mb-2">تم إنشاء الحساب بنجاح!</h2>
                                <p className="text-slate-500 mb-8">
                                    يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك قبل تسجيل الدخول.
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-block w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold shadow-md transition-all"
                                >
                                    تسجيل الدخول الآن
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-blue-950 mb-2">إنشاء حساب جديد</h2>
                                    <p className="text-slate-500">انضم إلينا وابدأ مسارك المهني</p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSignup} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل</label>
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="محمد أحمد"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="name@example.com"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور</label>
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

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                جاري الإنشاء...
                                            </>
                                        ) : (
                                            'إنشاء الحساب'
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    {!success && (
                        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-600">
                            لديك حساب بالفعل؟{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">
                                تسجيل الدخول
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
