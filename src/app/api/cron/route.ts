import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // حذفنا سطر الـ import الخاص بالـ scraper لإصلاح خطأ الـ Build
    try {
        console.log("Cron job triggered - Scraper is disabled for now.");
        return NextResponse.json({ success: true, message: "Pipeline skipped" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
