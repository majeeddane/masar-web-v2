'use server';

import { createClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createJob(formData: FormData) {
    const supabase = await createClient();

    // 1. التحقق من المستخدم
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'يجب عليك تسجيل الدخول لنشر وظيفة' };
    }

    // 2. استلام البيانات
    const title = formData.get('title') as string;
    const company_name = formData.get('company') as string; // Form likely still sends 'company', mapping manually
    const location = formData.get('location') as string;
    const type = formData.get('job_type') as string; // Form sends 'job_type', DB expects 'type'
    const salary_range = formData.get('salary') as string;
    const description = formData.get('description') as string;
    const category_id = formData.get('category_id') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;

    // Strict Validation
    if (!title || !title.trim()) throw new Error('بيانات ناقصة: الحقل title مطلوب');
    if (!company_name || !company_name.trim()) throw new Error('بيانات ناقصة: الحقل company_name مطلوب');
    if (!location || !location.trim()) throw new Error('بيانات ناقصة: الحقل location مطلوب');
    if (!type || !type.trim()) throw new Error('بيانات ناقصة: الحقل type مطلوب');
    if (!description || !description.trim()) throw new Error('بيانات ناقصة: الحقل description مطلوب');

    // 3. الإدخال في قاعدة البيانات
    const payload = {
        user_id: user.id,
        title,
        company_name,
        location,
        type, // Using 'type' as requested
        description,
        salary_range,
        category_id: category_id || null, // Optional in strict list provided? User listed it as required in text but not in "Required columns (NOT NULL)" list. Validation strictness applied to NOT NULL list.
        phone,
        email,
        is_active: true
    };

    console.log("JOB PAYLOAD", payload);

    const { error } = await supabase.from('jobs').insert(payload).select().single();

    if (error) {
        console.error("SUPABASE ERROR FULL:", JSON.stringify(error, null, 2));
        throw new Error(`خطأ في النشر: ${error.message} (${error.code})`);
    }

    // 4. التحديث والتوجيه
    revalidatePath('/jobs');
    redirect('/jobs'); // سنقوم بإنشاء هذه الصفحة لاحقاً لعرض الوظائف
}

// دالة التقديم على وظيفة
export async function applyToJob(jobId: string) {
    const supabase = await createClient();

    // 1. التحقق من المستخدم
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'يجب تسجيل الدخول للتقديم' };
    }

    // 2. التحقق مما إذا كان قد قدم مسبقاً (اختياري، لأن قاعدة البيانات تمنع التكرار أيضاً)
    const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('applicant_id', user.id)
        .single();

    if (existing) {
        return { success: false, error: 'لقد قمت بالتقديم على هذه الوظيفة مسبقاً' };
    }

    // 3. إنشاء الطلب
    const { error } = await supabase.from('applications').insert({
        job_id: jobId,
        applicant_id: user.id,
        status: 'pending'
    });

    if (error) {
        console.error('Application Error:', error);
        return { success: false, error: 'حدث خطأ أثناء التقديم، حاول مرة أخرى' };
    }

    revalidatePath(`/jobs/${jobId}`);
    return { success: true };
}
