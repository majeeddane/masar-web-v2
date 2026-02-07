
import { NextResponse } from 'next/server';
import { getJobs } from '@/lib/jobs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const type = searchParams.get('type') || '';
    const level = searchParams.get('level') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    try {
        const jobs = await getJobs({ q, city, type, level, limit, offset });
        return NextResponse.json({ jobs, nextCursor: jobs.length === limit ? page + 1 : undefined });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}
