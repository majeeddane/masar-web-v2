import { NextResponse } from 'next/server';
import { scrapeJobs } from '@/lib/scraper';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        console.log('🚀 محرك مسار: بدء عملية السحب الشاملة للبيانات...');
        const jobs = await scrapeJobs();

        if (!jobs || jobs.length === 0) {
            return NextResponse.json({ success: false, message: 'لا توجد وظائف جديدة حالياً.' }, { status: 404 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // مسح القديم لإفساح المجال للجديد
        await supabaseAdmin.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const jobsToInsert = jobs.map(job => ({
            title: job.title,
            description: job.description,
            city: job.location,     // مطابقة الحقل مع عمود city في جدولك
            category: job.category,
            company: job.company,    // العمود الجديد الذي أضفته الآن
            source_url: job.source_url, // العمود الجديد الذي أضفته الآن
            posted_at: job.posted_at    // العمود الجديد الذي أضفته الآن
        }));

        const { data, error } = await supabaseAdmin.from('jobs').insert(jobsToInsert).select();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            count: data?.length,
            message: "تم تحديث البيانات بالكامل مع أسماء الشركات والروابط."
        });
    } catch (error: any) {
        console.error('❌ فشل في التحديث النهائي:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}