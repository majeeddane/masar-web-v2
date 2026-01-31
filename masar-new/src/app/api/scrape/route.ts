import { NextResponse } from 'next/server';
import { scrapeJobs } from '@/lib/scraper';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    // 1. التحقق من الهوية (Security Check)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        console.log('🚀 API: /api/scrape authorized and starting...');
        const jobs = await scrapeJobs();

        if (!jobs || jobs.length === 0) {
            return NextResponse.json({ success: false, message: 'No jobs found.' }, { status: 404 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey!);

        // تنظيف البيانات القديمة وإضافة الجديدة
        await supabaseAdmin.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const jobsToInsert = jobs.map(job => ({
            title: job.title,
            company_name: job.company,
            location: job.location,
            category: job.category,
            source_url: job.source_url,
            description: job.description,
            posted_at: job.posted_at
        }));

        const { data, error } = await supabaseAdmin.from('jobs').insert(jobsToInsert).select();

        return NextResponse.json({ success: true, count: data?.length || 0 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}