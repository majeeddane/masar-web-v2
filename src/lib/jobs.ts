
import { createClient } from '@/lib/supabaseServer';

// unstable_cache removed to avoid "cookies() inside unstable_cache" error on Vercel
// Since createClient() uses cookies(), we cannot wrap it in a static cache function.

export const getJobs = async (filters?: { q?: string; city?: string; type?: string; level?: string; date?: string; limit?: number; offset?: number }) => {
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

    if (filters?.date === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('created_at', `${today}T00:00:00`);
    } else if (filters?.date === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        const todayStr = new Date().toISOString().split('T')[0];
        query = query.gte('created_at', `${yStr}T00:00:00`).lt('created_at', `${todayStr}T00:00:00`);
    }

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
