
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ApplyButton({ jobId, jobTitle, isApplied = false }: { jobId: string, jobTitle: string, isApplied?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [applied, setApplied] = useState(isApplied);
    const [error, setError] = useState('');

    const handleApply = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/applications/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId })
            });

            const data = await res.json();

            if (res.ok) {
                setApplied(true);
                alert(`تم التقديم بنجاح! نسبة التطابق المبدئية: ${data.score}%`);
            } else {
                if (data.error === 'Unauthorized') {
                    // Redirect to login (assuming we have a login page, probably /login or /auth)
                    // Since specific login page path isn't confirmed, usually /login
                    // But using Supabase Auth UI often means /auth/callback or similar.
                    // For now, alert and push /login
                    alert('يجب عليك تسجيل الدخول أولاً');
                    // router.push('/login'); // Uncomment if route exists
                } else if (data.error.includes('No CV')) {
                    if (confirm('يجب عليك إنشاء سيرة ذاتية أولاً. الذهاب لبناء السيرة الذاتية؟')) {
                        router.push('/dashboard/cv');
                    }
                } else {
                    alert(data.error);
                }
            }
        } catch (err) {
            setError('فشل الاتصال.');
        } finally {
            setLoading(false);
        }
    };

    if (applied) {
        return (
            <button disabled className="bg-green-100 text-green-700 font-bold text-lg px-8 py-4 rounded-xl w-full md:w-auto flex items-center justify-center gap-2 cursor-default">
                <CheckCircle className="w-5 h-5" />
                تم التقديم
            </button>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2 w-full md:w-auto">
            <button
                onClick={handleApply}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-all w-full md:w-auto flex items-center justify-center gap-2"
            >
                {loading ? (
                    'جاري التقديم (AI)...'
                ) : (
                    <>
                        <Send className="w-5 h-5 rtl:-scale-x-100" />
                        تقديم الآن
                    </>
                )}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}
