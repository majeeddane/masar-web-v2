'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Search, MapPin, User, ArrowLeft, Loader2 } from 'lucide-react';

export default function TalentsPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [talents, setTalents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTalents() {
            const { data } = await supabase
                .from('profiles').select('*')
                .not('full_name', 'is', null)
                .order('updated_at', { ascending: false });
            if (data) setTalents(data);
            setLoading(false);
        }
        fetchTalents();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            <div className="bg-[#1e293b] text-white py-12 text-center">
                <h1 className="text-3xl font-bold mb-4">اكتشف نخبة الكفاءات</h1>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {loading ? <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" /> : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {talents.map((talent) => (
                            <div key={talent.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all">
                                <div className="flex gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden">
                                        {talent.avatar_url ? <img src={talent.avatar_url} className="w-full h-full object-cover" /> : <User className="w-8 h-8 m-auto mt-3 text-gray-400" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{talent.full_name}</h3>
                                        <p className="text-blue-600 text-sm">{talent.job_title}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {Array.isArray(talent.skills) && talent.skills.slice(0, 3).map((s: string, i: number) => (
                                        <span key={i} className="bg-gray-50 text-xs px-2 py-1 rounded border">{s}</span>
                                    ))}
                                </div>
                                <div className="border-t pt-4">
                                    {/* 👇 الرابط الصحيح الذي يوجه لصفحة الشخص 👇 */}
                                    <Link href={`/profile/${talent.id}`} className="text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                        عرض الملف الشخصي <ArrowLeft className="w-4 h-4 text-blue-600" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}