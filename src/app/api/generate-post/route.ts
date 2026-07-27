import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { title, category } = await req.json();

        if (!title) {
            return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 });
        }

        // هندسة البرومبت لضمان مقال احترافي (SEO)
        const prompt = `
      بصفتك خبير توظيف ومستشار مهني، اكتب مقالاً احترافياً وشاملاً باللغة العربية حول: "${title}".
      التصنيف: ${category || 'عام'}.

      المواصفات المطلوبة:
      1. التنسيق: HTML Tags فقط (بدون markdown). استخدم <h2> للعناوين، <p> للفقرات، <ul> للنقاط.
      2. لا تضع وسوم <html> أو <body>، ابدأ بالمحتوى مباشرة.
      3. الأسلوب: احترافي، مشجع، وغني بالمعلومات الحصرية.
      4. الطول: حوالي 500-600 كلمة.
      5. الهيكل: مقدمة قوية، 3 عناوين فرعية، نصائح عملية، وخاتمة.
    `;

        // 👇 التغيير تم هنا: استخدام gpt-3.5-turbo
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
        });

        const content = completion.choices[0].message.content;

        // توليد وصف مختصر (Excerpt)
        const excerptResponse = await openai.chat.completions.create({
            messages: [{ role: 'user', content: `اكتب وصفاً جذاباً (Meta Description) من سطرين للمقال: ${title}` }],
            model: 'gpt-3.5-turbo',
        });

        const excerpt = excerptResponse.choices[0].message.content;

        return NextResponse.json({ content, excerpt });

    } catch (error: any) {
        console.error('OpenAI Error:', error);
        // قمنا بإرجاع رسالة الخطأ الحقيقية لتساعدك في معرفة السبب (مثل نفاذ الرصيد)
        return NextResponse.json({ error: error.message || 'فشل التوليد' }, { status: 500 });
    }
}