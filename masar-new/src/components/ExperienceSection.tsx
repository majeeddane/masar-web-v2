'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient'; // تأكد من المسار الصحيح للكلاينت
import { addExperience, deleteExperience } from '@/lib/experienceActions';
import { Briefcase, Calendar, MapPin, Plus, Trash2, Loader2, Building2 } from 'lucide-react';

interface Experience {
    id: string;
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    description: string;
}

export default function ExperienceSection({ userId }: { userId: string }) {
    const supabase = createClient();
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // جلب الخبرات عند التحميل
    const fetchExperiences = async () => {
        const { data } = await supabase
            .from('experiences')
            .select('*')
            .eq('user_id', userId)
            .order('start_date', { ascending: false }); // الأحدث أولاً

        if (data) setExperiences(data);
        setIsLoading(false);
    };

    useEffect(() => {
        if (userId) fetchExperiences();
    }, [userId]);

    // معالجة الإضافة
    async function handleAdd(formData: FormData) {
        setIsSaving(true);
        const res = await addExperience(formData);
        if (res.success) {
            await fetchExperiences(); // تحديث القائمة
            setIsAdding(false); // إغلاق النموذج
        } else {
            alert(res.error);
        }
        setIsSaving(false);
    }

    // معالجة الحذف
    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذه الخبرة؟')) return;
        const res = await deleteExperience(id);
        if (res.success) {
            setExperiences(experiences.filter(exp => exp.id !== id));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#0084db]" />
                    الخبرات المهنية
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-sm bg-blue-50 text-[#0084db] px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" /> إضافة خبرة
                </button>
            </div>

            {/* --- نموذج الإضافة --- */}
            {isAdding && (
                <form action={handleAdd} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input name="title" required placeholder="المسمى الوظيفي" className="px-4 py-2 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none" />
                        <input name="company" required placeholder="اسم الشركة" className="px-4 py-2 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
                            <span className="text-xs text-gray-400 font-bold">من:</span>
                            <input name="startDate" type="date" required className="flex-1 outline-none text-sm" />
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
                            <span className="text-xs text-gray-400 font-bold">إلى:</span>
                            <input name="endDate" type="date" className="flex-1 outline-none text-sm" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-600 cursor-pointer">
                            <input type="checkbox" name="isCurrent" className="w-4 h-4 accent-[#0084db]" />
                            أعمل هنا حالياً
                        </label>
                    </div>
                    <textarea name="description" rows={3} placeholder="وصف موجز للمهام والإنجازات..." className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none mb-4 resize-none" />

                    <div className="flex gap-2">
                        <button type="submit" disabled={isSaving} className="bg-[#0084db] text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} حفظ
                        </button>
                        <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-200 text-gray-600 px-6 py-2 rounded-xl font-bold text-sm">إلغاء</button>
                    </div>
                </form>
            )}

            {/* --- قائمة الخبرات (Timeline) --- */}
            <div className="relative border-r-2 border-gray-100 mr-3 space-y-8">
                {isLoading ? (
                    <p className="text-gray-400 text-sm pr-6">جاري التحميل...</p>
                ) : experiences.length === 0 ? (
                    <p className="text-gray-400 text-sm pr-6 italic">لا توجد خبرات مضافة حتى الآن.</p>
                ) : (
                    experiences.map((exp) => (
                        <div key={exp.id} className="relative pr-6 group">
                            {/* النقطة الزمنية */}
                            <div className="absolute -right-[9px] top-1 w-4 h-4 bg-white border-4 border-[#0084db] rounded-full"></div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{exp.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-medium">
                                            <Building2 className="w-4 h-4" /> {exp.company}
                                            {exp.location && <><span className="text-gray-300">|</span> <MapPin className="w-4 h-4" /> {exp.location}</>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(exp.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-bold text-[#0084db] mt-3 bg-blue-50 w-fit px-3 py-1 rounded-full">
                                    <Calendar className="w-3 h-3" />
                                    {exp.start_date} - {exp.is_current ? 'الآن' : exp.end_date}
                                </div>

                                {exp.description && (
                                    <p className="text-gray-600 text-sm mt-3 leading-relaxed border-t border-gray-50 pt-3">
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
