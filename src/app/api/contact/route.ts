import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'جميع الحقول المحددة مطلوبة' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('contact_messages')
            .insert([
                {
                    name,
                    email,
                    subject: subject || 'General Inquiry',
                    message,
                }
            ]);

        if (error) {
            console.error('Database insertion error for contact message:', error.message);
            return NextResponse.json({ success: true, warning: 'Failed to insert to table' });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('Contact API Error:', err.message);
        return NextResponse.json(
            { error: 'حدث خطأ غير متوقع عند معالجة طلبك' },
            { status: 500 }
        );
    }
}
