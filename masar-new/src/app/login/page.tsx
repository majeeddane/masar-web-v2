'use client';

import { useState } from 'react';
import { login } from '../auth/actions'; // استيراد الأكشن الجديد
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setErrorMsg('');

        const result = await login(formData);

        if (result?.error) {
            setErrorMsg(result.error);
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-gray-900">أهلاً بعودتك 👋</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        سجل دخولك لمتابعة ملفك المهني والفرص المتاحة
                    </p>
                </div>

                <form action={handleSubmit} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-1 block">البريد الإلكتروني</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-bold text-gray-700">كلمة المرور</label>
                                {/* رابط نسيت كلمة المرور (مستقبلاً) */}
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all"
                                placeholder="******"
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl font-bold text-center border border-red-100">
                            ⚠️ {errorMsg}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-[#0084db] hover:bg-[#006bb3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-100"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <Link href="/signup" className="text-sm font-bold text-gray-400 hover:text-[#0084db] transition-colors">
                            ليس لديك حساب؟ انضم إلينا الآن
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
