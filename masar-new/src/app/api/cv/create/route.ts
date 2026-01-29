
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { fullName, title, skills, summary, phone } = body;

        // Structured Data for the JSONB column
        const cvData = {
            fullName,
            title,
            summary,
            phone,
            skills // Also stored in structured way
        };

        // Check for existing
        const { data: existingCV } = await supabase
            .from('cvs')
            .select('id')
            .eq('user_id', user.id)
            .single();

        let result;
        if (existingCV) {
            result = await supabase
                .from('cvs')
                .update({
                    title: title || 'My Resumé',
                    data: cvData, // JSONB
                    skills_extracted: skills, // For the algorithm
                    content_text: `${title} ${summary} ${skills.join(' ')}`, // For text search fallback
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingCV.id);
        } else {
            result = await supabase
                .from('cvs')
                .insert({
                    user_id: user.id,
                    title: title || 'My Resumé',
                    data: cvData,
                    skills_extracted: skills,
                    content_text: `${title} ${summary} ${skills.join(' ')}`
                });
        }

        if (result.error) throw result.error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Create CV Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
