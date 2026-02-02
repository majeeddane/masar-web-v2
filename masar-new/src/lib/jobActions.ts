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
    const company = formData.get('company') as string;
    const location = formData.get('location') as string;
    const type = formData.get('type') as string;
    const salary = formData.get('salary') as string;
    const description = formData.get('description') as string;

    // 3. الإدخال في قاعدة البيانات
    const { error } = await supabase.from('jobs').insert({
        user_id: user.id, // ربط الوظيفة بصاحبها
        title,
        company_name: company,
        location,
        type,
        salary_range: salary,
        description,
        is_active: true
    });

    if (error) {
        console.error('Job Creation Error:', error);
        return { success: false, error: 'حدث خطأ أثناء نشر الوظيفة' };
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
