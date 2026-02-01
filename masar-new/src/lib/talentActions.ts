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
    const email = formData.get('email') as string;

    // 1. Fetch existing profile to preserve data (like avatar) if not updated
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('email', email)
        .single();

    const fullName = formData.get('fullName') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const location = formData.get('location') as string;
    const bio = formData.get('bio') as string;
    const phone = formData.get('phone') as string;
    const skillsString = formData.get('skills') as string;
    const avatarFile = formData.get('avatar') as File;

    let skills: string[] = [];
    try {
        skills = JSON.parse(skillsString);
    } catch {
        skills = skillsString ? skillsString.split(',').map(s => s.trim()) : [];
    }

    // Default: Use existing avatar if available
    let avatarUrl = existingProfile?.avatar_url || '';

    // 2. Upload new avatar ONLY if provided
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

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            avatarUrl = publicUrl;
        }
    }

    // 3. Smart Upsert
    const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
            full_name: fullName,
            job_title: jobTitle,
            location: location,
            bio: bio,
            email: email,
            phone: phone,
            skills: skills,
            avatar_url: avatarUrl // Will retain old url if no new one
        }, { onConflict: 'email' });

    if (dbError) {
        console.error('DB Error:', dbError);
        return { success: false, error: 'فشل في حفظ البيانات: ' + dbError.message };
    }

    revalidatePath('/talents');
    return { success: true };
}
