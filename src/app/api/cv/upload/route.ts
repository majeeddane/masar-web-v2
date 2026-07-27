import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { extractSkillsFromCV } from '@/lib/ai';

// دالة لمعالجة البيئة قبل استدعاء المكتبة
function applyNodeShims() {
    if (typeof globalThis.DOMMatrix === 'undefined') {
        // @ts-ignore
        globalThis.DOMMatrix = class {
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
    if (typeof globalThis.ImageData === 'undefined') {
        // @ts-ignore
        globalThis.ImageData = class { constructor() { return this; } };
    }
}

async function parsePdfSafe(buffer: Buffer): Promise<string> {
    applyNodeShims(); // تطبيق الترقيعات داخل الدالة لضمان عدم فشل البناء

    // تحميل المكتبة بشكل متأخر (Lazy Import)
    const pdf = require('pdf-parse');
    const options = { pagerender: () => "" };

    try {
        const data = await pdf(buffer, options);
        return data.text || "";
    } catch (e) {
        console.error('PDF Parsing Failed:', e);
        throw new Error('فشل استخراج النص من ملف PDF');
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'يرجى رفع ملف PDF صحيح' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const text = await parsePdfSafe(buffer);

        if (!text.trim()) {
            throw new Error('الملف فارغ أو لا يمكن قراءته');
        }

        const skills = await extractSkillsFromCV(text);

        // تحديث أو إدخال البيانات في Supabase
        const { data: cvData, error: dbError } = await supabase
            .from('cvs')
            .upsert({
                user_id: user.id,
                content_text: text,
                skills_extracted: skills,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (dbError) throw dbError;

        return NextResponse.json({ success: true, skills, cvId: cvData.id });

    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}