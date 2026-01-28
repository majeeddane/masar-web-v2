import { NextResponse } from 'next/server';
import { scrapeJobs } from '@/lib/scraper';
import { createClient } from '@supabase/supabase-js'; // DIRECT IMPORT for Admin Client

export async function POST(req: Request) {
    try {
        console.log('🚀 API: /api/scrape called');

        // 1. Run the Scraper
        const jobs = await scrapeJobs();

        if (!jobs || jobs.length === 0) {
            return NextResponse.json({ success: false, message: 'No jobs found.' }, { status: 404 });
        }

        // 2. Initialize Admin Supabase Client (Bypass RLS)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
            return NextResponse.json({
                success: false,
                message: 'Configuration Error: Missing SUPABASE_SERVICE_ROLE_KEY. Please add it to .env.local to bypass RLS.'
            }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // A. Clear existing data
        const { error: deleteError } = await supabaseAdmin.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError) console.error('Clear DB Error:', deleteError);

        // B. Prepare Data for Insertion
        // We removed 'author_id' previously to fix schemas. Any other 'not null' fields must be satisfied by DB defaults.
        let insertedCount = 0;

        const jobsToInsert = jobs.map(job => ({
            title: job.title,
            company_name: job.company,
            location: job.location,
            description: job.description,
            source_url: job.source_url,
            status: 'active',
            created_at: new Date().toISOString()
        }));

        const { data, error } = await supabaseAdmin.from('jobs').insert(jobsToInsert).select();

        if (error) {
            console.error('Insert Error details:', error);
            return NextResponse.json({ success: false, message: 'DB Insert Failed: ' + error.message, error }, { status: 500 });
        } else {
            insertedCount = data?.length || 0;
        }

        return NextResponse.json({
            success: true,
            message: `Scraping completed. Found ${jobs.length} items. Inserted ${insertedCount} new jobs.`,
            stats: {
                total: jobs.length,
                inserted: insertedCount
            }
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
