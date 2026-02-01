'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client with Service Role Key for Admin privileges (DB Insert/Storage)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function submitApplication(formData: FormData) {
    const jobId = formData.get('jobId') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const file = formData.get('cv') as File;

    if (!file || !jobId || !name || !email) {
        return { success: false, message: 'Missing required fields' };
    }

    if (file.size > 5 * 1024 * 1024) {
        return { success: false, message: 'File size exceeds 5MB' };
    }

    try {
        // 1. Upload File to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${jobId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('cv-uploads')
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) throw new Error('Upload failed: ' + uploadError.message);

        // Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('cv-uploads')
            .getPublicUrl(fileName);

        // 2. Insert Record into DB
        const { error: dbError } = await supabase
            .from('job_applications')
            .insert({
                job_id: jobId,
                applicant_name: name,
                email: email,
                phone: phone,
                cv_url: publicUrl
            });

        if (dbError) throw new Error('Database insert failed: ' + dbError.message);

        return { success: true, message: 'تم إرسال طلبك بنجاح!' };

    } catch (error: any) {
        console.error('Submission Error:', error);
        return { success: false, message: error.message };
    }
}
