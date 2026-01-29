// @ts-nocheck
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { extractSkillsFromCV } from '@/lib/ai';

// Polyfill for Vercel/Node environment where DOMMatrix/ImageData might be missing
// when pdf-parse tries to initialize.
if (typeof Promise.withResolvers === "undefined") {
    // Some envs might need this too, but mainly DOMMatrix.
}

// Global Shims for pdf-parse (it relies on browser APIs sometimes)
global.DOMMatrix = global.DOMMatrix || class {
    constructor() { return this; }
    multiplySelf() { return this; }
    preMultiplySelf() { return this; }
    translateSelf() { return this; }
    scaleSelf() { return this; }
    rotateSelf() { return this; }
    skewXSelf() { return this; }
    skewYSelf() { return this; }
};

global.ImageData = global.ImageData || class {
    constructor() { return this; }
};

export async function POST(request: Request) {
    // Lazy load pdf-parse to avoid top-level evaluation issues during build
    const pdf = require('pdf-parse');

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Buffer the file
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Extract Text (PDF Parse)
        let text = '';
        try {
            // Disable page rendering to prevent further canvas/DOM usage
            const options = { pagerender: () => "" };
            const data = await pdf(buffer, options);
            text = data.text;
        } catch (e) {
            console.error('PDF Parse Error:', e);
            return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
        }

        // 3. AI Extract Skills
        const skills = await extractSkillsFromCV(text);

        // 4. Save to DB (cvs table)
        // Check if user already has a CV entry
        const { data: existingCV } = await supabase
            .from('cvs')
            .select('id')
            .eq('user_id', user.id)
            .single();

        let cvData;
        if (existingCV) {
            const { data, error } = await supabase
                .from('cvs')
                .update({
                    content_text: text, // Store raw text for future matching
                    skills_extracted: skills,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingCV.id)
                .select()
                .single();
            if (error) throw error;
            cvData = data;
        } else {
            const { data, error } = await supabase
                .from('cvs')
                .insert({
                    user_id: user.id,
                    content_text: text,
                    skills_extracted: skills
                })
                .select()
                .single();
            if (error) throw error;
            cvData = data;
        }

        return NextResponse.json({ success: true, skills, cvId: cvData.id });

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
