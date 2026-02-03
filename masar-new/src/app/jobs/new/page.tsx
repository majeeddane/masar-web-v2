'use client';

import { useState, useEffect } from 'react';
import { createJob } from '@/lib/jobActions';
import { createClient } from '@/lib/supabaseServer';
// Note: We need a client-side supabase for fetching categories if we do it effectively on load, 
// OR we can pass categories as props if this was a server component.
// But this is 'use client', so we can fetch or use server action to get categories.
// Let's use a server component wrapper or just fetch via client for now to keep it simple, 
// OR better: make it a Server Component that renders the form (Client Component).

// Let's stick to valid Next.js patterns.
// We'll create a separate component for the form or fetch in a server component.
// For simplicity in this step, I'll make this file a Server Component that fetches categories, 
// and imports a Client form.
// ... Wait, the user asked for `src/app/jobs/new/page.tsx`.
// I will make `page.tsx` a Server Component and `JobForm.tsx` a Client Component.

// RE-WRITING strategy:
// 1. Create `src/components/JobForm.tsx` (Client)
// 2. Create `src/app/jobs/new/page.tsx` (Server)

// ... Since I can't create two files in one step properly without multiple calls, 
// I will create the Page as a Client Component for now to handle everything (fetching categories) 
// simply, OR use a Server Action to fetch categories.

// Let's go with Client Component for the page for now, fetching categories via Supabase Client.
import { createBrowserClient } from '@supabase/ssr';
import { Loader2 } from 'lucide-react';
import { Category } from '@/lib/types';

export default function NewJobPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [errorMsg, setErrorMsg] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase.from('categories').select('*');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, [supabase]);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const result = await createJob(formData);
            if (result?.error) {
                setErrorMsg(result.error);
                setIsLoading(false);
            }
        } catch (e) {
            console.error(e);
            setErrorMsg('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.');
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-[30px] shadow-sm border border-gray-100">
                <h1 className="text-3xl font-black text-gray-900 mb-8 text-center">نشر وظيفة جديدة</h1>

                <form action={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الوظيفة</label>
                            <input name="title" required placeholder="مثال: محاسب عام" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">اسم الشركة / صاحب العمل</label>
                            <input name="company" required placeholder="مثال: شركة مسار التقنية" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">المدينة</label>
                            <input name="location" required list="cities" placeholder="الرياض" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all" />
                            <datalist id="cities">
                                <option value="الرياض" />
                                <option value="جدة" />
                                <option value="الدمام" />
                                <option value="مكة المكرمة" />
                                <option value="المدينة المنورة" />
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">التصنيف</label>
                            <select name="category_id" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all bg-white">
                                <option value="">اختر التصنيف...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">نوع الوظيفة</label>
                            <select name="job_type" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all bg-white">
                                <option value="Full-time">دوام كامل</option>
                                <option value="Part-time">دوام جزئي</option>
                                <option value="Contract">عقد مشروع</option>
                                <option value="Remote">عن بعد</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">الراتب المتوقع (اختياري)</label>
                            <input name="salary" placeholder="مثال: 5000 - 7000 ريال" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all" />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                            بيانات التواصل (ستظهر للمتقدمين المسجلين فقط)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف / واتساب</label>
                                <input name="phone" type="tel" placeholder="05xxxxxxxx" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني للتقديم</label>
                                <input name="email" type="email" placeholder="hr@company.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">وصف الوظيفة والمتطلبات</label>
                        <textarea name="description" required rows={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0084db] outline-none transition-all" placeholder="اكتب تفاصيل الوظيفة هنا..."></textarea>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-bold">
                            {errorMsg}
                        </div>
                    )}

                    <button disabled={isLoading} type="submit" className="w-full bg-[#0084db] text-white font-black py-4 rounded-xl hover:bg-[#006bb3] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex justify-center items-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'نشـر الوظيفة الآن'}
                    </button>

                </form>
            </div>
        </div>
    );
}
