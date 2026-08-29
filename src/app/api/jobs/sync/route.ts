import { NextResponse } from 'next/server';
import { jobAggregator } from '@/services/jobAggregator.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max execution timeout on supported environments

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const limit = parseInt(searchParams.get('limit') || '10');
        const source = (searchParams.get('source') as any) || 'all';

        // تحقق من الصلاحية إذا كان CRON_SECRET مضبوطاً
        const expectedSecret = process.env.CRON_SECRET;
        const authHeader = request.headers.get('authorization');
        const token = authHeader ? authHeader.replace('Bearer ', '') : null;

        if (expectedSecret && secret !== expectedSecret && token !== expectedSecret) {
            // نسمح بالتنفيذ المباشر إذا كان في بيئة التطوير أو بدون سر محدد
            if (process.env.NODE_ENV === 'production' && !request.headers.get('x-vercel-cron')) {
                return NextResponse.json({ error: 'غير مصرح لك بتشغيل المزامنة' }, { status: 401 });
            }
        }

        console.log(`🚀 [JobSync API] بدء المزامنة الآلية (المصدر: ${source}, الحد: ${limit})...`);
        const report = await jobAggregator.runSync({ limitPerSource: limit, source });

        return NextResponse.json({
            success: true,
            message: `تمت المزامنة بنجاح! تم إدراج ${report.successfullyInserted} وظيفة جديدة.`,
            report
        });
    } catch (error: any) {
        console.error('❌ [JobSync API Error]:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'حدث خطأ أثناء مزامنة الوظائف'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        let body: any = {};
        try {
            body = await request.json();
        } catch (e) {
            // body empty is ok
        }

        const limit = body.limit || 10;
        const source = body.source || 'all';

        console.log(`🚀 [JobSync POST API] تشغيل المزامنة اليدوية...`);
        const report = await jobAggregator.runSync({ limitPerSource: limit, source });

        return NextResponse.json({
            success: true,
            message: `تمت المزامنة بنجاح! تم إدراج ${report.successfullyInserted} وظيفة جديدة.`,
            report
        });
    } catch (error: any) {
        console.error('❌ [JobSync POST Error]:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'حدث خطأ أثناء مزامنة الوظائف'
        }, { status: 500 });
    }
}
