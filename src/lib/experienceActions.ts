'use server';

import { createClient } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

// دالة إضافة خبرة جديدة
export async function addExperience(formData: FormData) {
    const supabase = await createClient();

    // 1. التحقق من المستخدم الحالي (للحصول على الـ ID)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }

    // 2. استخراج البيانات من النموذج
    const title = formData.get('title') as string;
    const company = formData.get('company') as string;
    const location = formData.get('location') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const isCurrent = formData.get('isCurrent') === 'on'; // Checkbox returns 'on'
    const description = formData.get('description') as string;

    // 3. الإدخال في قاعدة البيانات
    const { error } = await supabase.from('experiences').insert({
        user_id: user.id, // الربط الأمني
        title,
        company,
        location,
        start_date: startDate,
        end_date: isCurrent ? null : endDate, // إذا كان عملاً حالياً، نترك تاريخ الانتهاء فارغاً
        is_current: isCurrent,
        description,
    });

    if (error) {
        console.error('Error adding experience:', error);
        return { success: false, error: 'فشل في إضافة الخبرة' };
    }

    // 4. تحديث الصفحة لإظهار البيانات الجديدة فوراً
    revalidatePath('/talents/join');
    return { success: true };
}

// دالة حذف خبرة
export async function deleteExperience(experienceId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', experienceId)
        .eq('user_id', user.id); // حماية إضافية: التأكد أن المستخدم يحذف خبرته هو فقط

    if (error) {
        return { success: false, error: 'فشل في حذف الخبرة' };
    }

    revalidatePath('/talents/join');
    return { success: true };
}
