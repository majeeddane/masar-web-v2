'use client';

import { useState } from 'react';
import { applyToJob } from '@/lib/jobActions';
import { Loader2, CheckCircle, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ApplyButton({ jobId, hasApplied }: { jobId: string, hasApplied: boolean }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isApplied, setIsApplied] = useState(hasApplied);
    const router = useRouter();

    async function handleApply() {
        if (!confirm('هل أنت متأكد من رغبتك في التقديم على هذه الوظيفة؟ سيتم إرسال ملفك الشخصي لصاحب العمل.')) return;

        setIsLoading(true);
        const res = await applyToJob(jobId);

        if (res.success) {
            setIsApplied(true);
            alert('تم إرسال طلبك بنجاح! 🎉');
            router.refresh();
        } else {
            alert(res.error);
        }
        setIsLoading(false);
    }

    if (isApplied) {
        return (
            <button disabled className="w-full bg-green-50 text-green-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 cursor-default border border-green-100">
                <CheckCircle className="w-5 h-5" />
                تم التقديم مسبقاً
            </button>
        );
    }

    return (
        <button
            onClick={handleApply}
            disabled={isLoading}
            className="w-full bg-[#0084db] text-white font-black py-4 rounded-xl hover:bg-[#006bb3] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
            {isLoading ? <Loader2 className="animate-spin" /> : <><Send className="w-5 h-5" /> تقديم الآن</>}
        </button>
    );
}
