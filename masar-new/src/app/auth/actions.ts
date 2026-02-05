'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';

export async function signup(formData: FormData) {
    const supabase = await createClient();

    // استلام البيانات من النموذج
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    // 1. إنشاء المستخدم في Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    // 2. إنشاء بروفايل مرتبط بالمستخدم الجديد فوراً
    if (data.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                user_id: data.user.id, // الربط الأمني المهم
                email: email,
                full_name: fullName,
                job_title: 'عضو جديد', // قيمة افتراضية
            });

        if (profileError) {
            console.error('Profile Creation Error:', profileError);
            // لا نوقف العملية هنا لأن الحساب أنشئ، يمكن معالجة البروفايل لاحقاً
        }
    }

    revalidatePath('/', 'layout');
    redirect('/talents/join'); // توجيه المستخدم لصفحة إكمال البيانات فوراً
}

export async function login(formData: FormData) {
    const supabase = await createClient();

    // استلام البيانات
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // تسجيل الدخول عبر Supabase
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }

    // تحديث الكاش وإعادة التوجيه
    revalidatePath('/', 'layout');
    redirect('/talents/join'); // نرسله لصفحة البروفايل ليتأكد من بياناته
}

// دالة تسجيل الخروج (سنحتاجها للـ Navbar لاحقاً)
export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}
