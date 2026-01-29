
import { createClient } from '@/lib/supabaseServer';

// unstable_cache removed to avoid "cookies() inside unstable_cache" error on Vercel
// Since createClient() uses cookies(), we cannot wrap it in a static cache function.

export const getJobs = async (filters?: { q?: string; city?: string; type?: string; level?: string; limit?: number; offset?: number }) => {
    const supabase = await createClient();
    let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;

    query = query.range(offset, offset + limit - 1);

    if (filters?.q) query = query.ilike('title', `%${filters.q}%`);
    if (filters?.city) query = query.ilike('city', `%${filters.city}%`);
    if (filters?.type) query = query.eq('job_type', filters.type);
    if (filters?.level) query = query.eq('experience_level', filters.level);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

export const getJobBySlug = async (slug: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('seo_url', slug)
        .single();

    return data;
};
