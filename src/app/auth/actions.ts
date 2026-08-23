'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import { getArabicErrorMessage } from '@/lib/errorHandler';

export async function signup(formData: FormData) {
    try {
        const supabase = await createClient();

        // استلام البيانات من النموذج
        const email = (formData.get('email') as string)?.trim();
        const password = formData.get('password') as string;
        const fullName = (formData.get('fullName') as string)?.trim();

        if (!email || !password || !fullName) {
            return { success: false, error: 'يرجى ملء جميع الحقول المطلوبة' };
        }

        if (password.length < 6) {
            return { success: false, error: 'يجب أن تتكون كلمة المرور من 6 خانات على الأقل' };
        }

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
            return { success: false, error: getArabicErrorMessage(error) };
        }

        // 2. إنشاء بروفايل مرتبط بالمستخدم الجديد فوراً
        if (data.user) {
            try {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,      // ✅ المفتاح الأساسي = auth.uid() لضمان التطابق
                        user_id: data.user.id, // الربط الأمني المهم
                        email: email,
                        full_name: fullName,
                        job_title: 'عضو جديد', // قيمة افتراضية
                    });

                if (profileError) {
                    console.error('Profile Creation Error:', profileError);
                }
            } catch (err) {
                console.error('Profile insert exception:', err);
            }
        }
    } catch (err: any) {
        console.error('Signup exception:', err);
        return { success: false, error: getArabicErrorMessage(err) };
    }

    revalidatePath('/', 'layout');
    redirect('/talents/join'); // توجيه المستخدم لصفحة إكمال البيانات فوراً
}

export async function login(formData: FormData) {
    try {
        const supabase = await createClient();

        // استلام البيانات
        const email = (formData.get('email') as string)?.trim();
        const password = formData.get('password') as string;

        if (!email || !password) {
            return { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
        }

        // تسجيل الدخول عبر Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { success: false, error: getArabicErrorMessage(error) };
        }

        // --- منطق التوجيه الذكي (Smart Redirection) ---
        // التحقق من اكتمال بيانات المستخدم
        if (data.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, job_title')
                .eq('user_id', data.user.id)
                .single();

            // إذا كان البروفايل ناقصاً (اسم أو مسمى وظيفي)، نوجهه للإكمال
            if (!profile || !profile.full_name || !profile.job_title) {
                revalidatePath('/', 'layout');
                redirect('/talents/join');
            }
        }
    } catch (err: any) {
        console.error('Login action error:', err);
        return { success: false, error: getArabicErrorMessage(err) };
    }

    // إذا كانت البيانات مكتملة، يذهب للرئيسية
    revalidatePath('/', 'layout');
    redirect('/');
}

// دالة تسجيل الخروج (سنحتاجها للـ Navbar لاحقاً)
export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}
