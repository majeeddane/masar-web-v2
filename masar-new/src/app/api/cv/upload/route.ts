import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { extractSkillsFromCV } from '@/lib/ai';

// --- Utility: PDF Parser Safe Wrapper ---
// Wraps the fragile pdf-parse logic and environment shims
async function parsePdfSafe(buffer: Buffer): Promise<string> {
    // 1. Shims for Node.js environment (required by pdf-parse dependencies)
    if (!global.DOMMatrix) {
        // @ts-ignore - Shim for dependency
        global.DOMMatrix = class {
            constructor() { return this; }
            multiplySelf() { return this; }
            preMultiplySelf() { return this; }
            translateSelf() { return this; }
            scaleSelf() { return this; }
            rotateSelf() { return this; }
            skewXSelf() { return this; }
            skewYSelf() { return this; }
        };
    }
    if (!global.ImageData) {
        // @ts-ignore - Shim for dependency
        global.ImageData = class { constructor() { return this; } };
    }

    // 2. Lazy Import
    // Using require to avoid top-level load which might trigger Vercel build inspection
    const pdf = require('pdf-parse');

    // 3. Parse with disabled rendering
    const options = { pagerender: () => "" };

    try {
        const data = await pdf(buffer, options);
        return data.text;
    } catch (e) {
        console.error('Inner PDF Parse Lib Error:', e);
        throw new Error('Failed to parse PDF content');
    }
}

export async function POST(request: Request) {
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

        // 2. Extract Text (Safe Mode)
        const text = await parsePdfSafe(buffer);

        // 3. AI Extract Skills
        const skills = await extractSkillsFromCV(text);

        // 4. Save to DB
        const { data: existingCV } = await supabase
            .from('cvs')
            .select('id')
            .eq('user_id', user.id)
            .single();

        let cvData;

        // Define payload for type safety if needed, or use inline
        const payload = {
            content_text: text,
            skills_extracted: skills,
        };

        if (existingCV) {
            const { data, error } = await supabase
                .from('cvs')
                .update({ ...payload, updated_at: new Date().toISOString() })
                .eq('id', existingCV.id)
                .select()
                .single();
            if (error) throw error;
            cvData = data;
        } else {
            const { data, error } = await supabase
                .from('cvs')
                .insert({ ...payload, user_id: user.id })
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
