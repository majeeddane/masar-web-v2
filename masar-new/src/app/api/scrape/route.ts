import { NextResponse } from 'next/server';
import { scrapeJobs } from '@/lib/scraper';
import { createClient } from '@supabase/supabase-js'; // Admin Client
import { createClient as createServerClient } from '@/lib/supabaseServer'; // Auth Client

export async function POST(req: Request) {
    try {
        console.log('🚀 API: /api/scrape called');

        // --- 1. Security Check (Dual Layer) ---
        let isAuthorized = false;
        let authMethod = '';

        // Layer A: Check for CRON_SECRET (Scheduled Tasks)
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
            isAuthorized = true;
            authMethod = 'CRON_SECRET';
        }

        // Layer B: Check for User Session (Manual Trigger)
        if (!isAuthorized) {
            const supabaseAuth = await createServerClient();
            const { data: { user } } = await supabaseAuth.auth.getUser();
            if (user) {
                isAuthorized = true;
                authMethod = 'USER_SESSION';
            }
        }

        if (!isAuthorized) {
            console.error('⛔ Access Denied: Missing CRON_SECRET or Valid Session');
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }

        console.log(`✅ Authorized via: ${authMethod}`);

        // --- 2. Run the Scraper ---
        const jobs = await scrapeJobs();

        if (!jobs || jobs.length === 0) {
            return NextResponse.json({ success: false, message: 'No jobs found.' }, { status: 404 });
        }

        // --- 3. Database Sync (Admin Privileges) ---
        // Only initialize Admin Client AFTER auth check passes
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.error('❌ Configuration Error: Missing SUPABASE_SERVICE_ROLE_KEY');
            return NextResponse.json({
                success: false,
                message: 'Server Configuration Error. Check logs.'
            }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // A. Clear existing data (Demo Mode)
        const { error: deleteError } = await supabaseAdmin.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError) console.error('Clear DB Error:', deleteError);

        // B. Insert New Data
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
        let insertedCount = 0;

        if (error) {
            console.error('Insert Error details:', error);
            return NextResponse.json({ success: false, message: 'DB Insert Failed: ' + error.message }, { status: 500 });
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
