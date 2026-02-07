
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { calculateMatchScore, generateCoverLetter } from '@/lib/ai';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { jobId } = await request.json();

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
        }

        // 1. Fetch User CV
        const { data: cv } = await supabase
            .from('cvs')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!cv) {
            return NextResponse.json({ error: 'No CV found. Please build or upload your CV first.' }, { status: 400 });
        }

        // 2. Fetch Job Details
        const { data: job } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // 3. Check for existing application
        const { data: existing } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', jobId)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Already applied' }, { status: 400 });
        }

        // 4. AI Processing (Score & Cover Letter)
        console.log(`Calculating match for User ${user.id} -> Job ${jobId}`);

        // Parallelize AI calls
        const [matchResult, coverLetter] = await Promise.all([
            calculateMatchScore(job.description, cv.content_text || JSON.stringify(cv.data)),
            generateCoverLetter(job.title, cv.skills_extracted || [], cv.data?.fullName || 'Candidate')
        ]);

        console.log('Match Score:', matchResult.score);

        // 5. Insert Application
        const { error: insertError } = await supabase
            .from('applications')
            .insert({
                user_id: user.id,
                job_id: jobId,
                match_score: matchResult.score || 0,
                ai_cover_letter: coverLetter,
                status: 'pending'
            });

        if (insertError) throw insertError;

        // 6. Trigger Notification
        await supabase.from('notifications').insert({
            user_id: user.id,
            title: 'تم إرسال طلبك بنجاح',
            message: `تم التقديم على وظيفة "${job.title}". نسبة التطابق: ${matchResult.score}%`,
            type: 'success',
            link: '/dashboard'
        });

        return NextResponse.json({ success: true, score: matchResult.score });

    } catch (error: any) {
        console.error('Do Apply Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
