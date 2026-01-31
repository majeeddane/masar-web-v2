import { NextResponse } from 'next/server';
import { scrapeJobs } from '@/lib/scraper';
import { createClient } from '@supabase/supabase-js';

// النوع GET متوافق مع Vercel Cron وتجاوزنا خطأ 405
export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error('⛔ محاولة وصول غير مصرح بها للـ Cron');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        console.log('🚀 محرك مسار: بدء عملية سحب الوظائف المجدولة...');
        const jobs = await scrapeJobs();

        if (!jobs || jobs.length === 0) {
            return NextResponse.json({ success: false, message: 'لم يتم العثور على وظائف جديدة.' }, { status: 404 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY مفقود في إعدادات السيرفر');
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // مسح الوظائف القديمة لتحديث القائمة
        await supabaseAdmin.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const jobsToInsert = jobs.map(job => ({
            title: job.title,
            description: job.description,
            city: job.location, // تم التغيير من location إلى city لتطابق جدولك
            category: job.category,
            // ملاحظة: حذفنا company و source_url و posted_at لأنها غير موجودة في Supabase حالياً
        }));

        const { data, error } = await supabaseAdmin.from('jobs').insert(jobsToInsert).select();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `تم تحديث ${data?.length || 0} وظيفة بنجاح.`
        });
    } catch (error: any) {
        console.error('❌ خطأ في محرك السحب:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}