import { NextResponse } from 'next/server';
import { jobAggregator } from '@/services/jobAggregator.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        console.log("⏰ [Cron] بدء تنفيذ الجدولة اليومية لجلب وتحديث الوظائف الحقيقية...");
        const report = await jobAggregator.runSync({ limitPerSource: 15, source: 'all' });
        return NextResponse.json({
            success: true,
            message: `تم تنفيذ الجدولة اليومية بنجاح (${report.successfullyInserted} وظيفة مضافة)`,
            report
        });
    } catch (error: any) {
        console.error("❌ [Cron Error]:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

