'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function deleteJob(jobId: string) {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    // Delete the job from jobs table
    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('user_id', user.id) // Security: Ensure user owns the job

    if (error) {
        throw new Error('Failed to delete job: ' + error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/my-jobs')
    revalidatePath('/dashboard/my-jobs')
}

