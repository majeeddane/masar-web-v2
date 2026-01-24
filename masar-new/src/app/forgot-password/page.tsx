'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Mail, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Allow overriding via env var (standard Vercel practice), otherwise fallback to origin
        // The user specifically requested ensuring it points to their production URL when needed.
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const redirectUrl = `${siteUrl}/auth/callback?next=/update-password`;

        console.log('Sending reset to:', redirectUrl); // Debug log

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err: any) {
            console.error('Reset Password Error:', err);
            // Show exact error as requested for debugging
            setError(err.message || 'حدث خطأ أثناء إرسال الرابط.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>

            {/* Header */}
            <header className="absolute top-0 w-full z-50 p-6 flex items-center justify-between">
                <Link href="/" className="text-white/80 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                    العودة للرئيسية
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </header>

            <div className="flex-1 flex items-center justify-center px-4 relative z-10">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-fade-in-up">
                    <div className="p-8">
                        {success ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-blue-950 mb-2">تم الإرسال بنجاح!</h2>
                                <p className="text-slate-500 mb-8">
                                    لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. تفقد صندوق الوارد (أو البريد العشوائي).
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-block w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold shadow-md transition-all"
                                >
                                    العودة لتسجيل الدخول
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-blue-950 mb-2">نسيت كلمة المرور؟</h2>
                                    <p className="text-slate-500">لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادتها.</p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleReset} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                                        <div className="relative">
                                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 rtl:left-auto rtl:right-3" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="name@example.com"
                                                dir="ltr"
                                            />
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
                                                جاري الإرسال...
                                            </>
                                        ) : (
                                            'إرسال رابط الاستعادة'
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    {!success && (
                        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-600">
                            تذكرت كلمة المرور؟{' '}
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
