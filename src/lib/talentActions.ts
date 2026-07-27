'use server';

import { createClient } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function joinTalent(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const fullName = formData.get('fullName') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const location = formData.get('location') as string;
    const bio = formData.get('bio') as string;
    const skills = formData.get('skills') as string;
    const phone = formData.get('phone') as string;

    // Handle Avatar if present (assuming logic for upload exists or skipping for now)
    // const avatar = formData.get('avatar'); 

    const { error } = await supabase.from('profiles').upsert({
        user_id: user.id,
        full_name: fullName,
        job_title: jobTitle,
        location,
        bio,
        skills, // Assuming text or array based on schema, using text for now if comma separated
        phone,
        updated_at: new Date().toISOString()
    });

    if (error) {
        console.error('Join Talent Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/talents');
    return { success: true };
}
