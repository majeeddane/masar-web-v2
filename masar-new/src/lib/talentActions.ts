'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Use Service Role Key for Admin privileges (bypassing RLS if needed, although policies allow insert)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
    return createClient(supabaseUrl, serviceRoleKey);
}

export async function joinTalent(formData: FormData) {
    const supabase = getAdminClient();

    const fullName = formData.get('fullName') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const location = formData.get('location') as string;
    const bio = formData.get('bio') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const skillsString = formData.get('skills') as string;
    const avatarFile = formData.get('avatar') as File;

    // Parse skills (comma separated or JSON string depending on frontend)
    // We will assume frontend sends a JSON string or we split by comma
    let skills: string[] = [];
    try {
        skills = JSON.parse(skillsString);
    } catch {
        skills = skillsString ? skillsString.split(',').map(s => s.trim()) : [];
    }

    let avatarUrl = '';

    // 1. Upload Avatar
    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, {
                contentType: avatarFile.type,
                upsert: false
            });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            return { success: false, error: 'فشل في رفع الصورة الشخصية' };
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        avatarUrl = publicUrl;
    }

    // 2. Insert into Profiles
    const { error: dbError } = await supabase
        .from('profiles')
        .insert({
            full_name: fullName,
            job_title: jobTitle,
            location: location,
            bio: bio,
            email: email,
            phone: phone,
            skills: skills,
            avatar_url: avatarUrl
        });

    if (dbError) {
        console.error('DB Error:', dbError);
        return { success: false, error: 'فشل في حفظ البيانات: ' + dbError.message };
    }

    revalidatePath('/talents');
    return { success: true };
}
