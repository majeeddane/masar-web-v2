
import { NextResponse } from 'next/server';
import { runPipeline } from '@/scripts/scraper';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        await runPipeline();
        return NextResponse.json({ success: true, message: 'Scraper executed successfully.' });
    } catch (error) {
        console.error('Cron Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
