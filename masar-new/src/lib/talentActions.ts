'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
    return createClient(supabaseUrl, serviceRoleKey);
}

export async function joinTalent(formData: FormData) {
    const supabase = getAdminClient();
    const email = formData.get('email') as string;

    // 1. جلب الملف القديم للحفاظ على البيانات
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('avatar_url, cv_url') // <-- لاحظ جلبنا cv_url أيضاً
        .eq('email', email)
        .single();

    const fullName = formData.get('fullName') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const location = formData.get('location') as string;
    const nationality = formData.get('nationality') as string;
    const bio = formData.get('bio') as string;
    const phone = formData.get('phone') as string;
    const skillsString = formData.get('skills') as string;

    // استلام الملفات
    const avatarFile = formData.get('avatar') as File;
    const cvFile = formData.get('cv') as File; // <-- الملف الجديد

    let skills: string[] = [];
    try {
        skills = JSON.parse(skillsString);
    } catch {
        skills = skillsString ? skillsString.split(',').map(s => s.trim()) : [];
    }

    // --- منطق الصورة (كما هو) ---
    let avatarUrl = existingProfile?.avatar_url || '';
    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: false });
        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            avatarUrl = publicUrl;
        }
    }

    // --- منطق السيرة الذاتية (الجديد) ---
    let cvUrl = existingProfile?.cv_url || ''; // الاحتفاظ بالقديم افتراضياً

    if (cvFile && cvFile.size > 0) {
        // التحقق من أن الملف PDF (اختياري لكن مفضل)
        if (cvFile.type === 'application/pdf') {
            const fileName = `cv_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;

            const { error: uploadCvError } = await supabase.storage
                .from('resumes') // السلة الجديدة
                .upload(fileName, cvFile, { contentType: 'application/pdf', upsert: false });

            if (!uploadCvError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('resumes')
                    .getPublicUrl(fileName);
                cvUrl = publicUrl;
            } else {
                console.error('CV Upload Error:', uploadCvError);
            }
        }
    }

    // 3. الحفظ في القاعدة
    const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
            full_name: fullName,
            job_title: jobTitle,
            location: location,
            nationality: nationality,
            bio: bio,
            email: email,
            phone: phone,
            skills: skills,
            avatar_url: avatarUrl,
            cv_url: cvUrl // <-- حفظ رابط السيرة الذاتية
        }, { onConflict: 'email' });

    if (dbError) {
        return { success: false, error: 'فشل في حفظ البيانات: ' + dbError.message };
    }

    revalidatePath('/talents');
    return { success: true };
}
