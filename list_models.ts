import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function check() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Using Key:", key?.substring(0, 10) + "...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        console.log("--- الموديلات المتاحة لمفتاحك هي ---");
        if (data.models) {
            data.models.forEach((m: any) => console.log(`- ${m.name.replace('models/', '')}`));
        } else {
            console.log("خطأ في الاستجابة:", data);
        }
    } catch (e) {
        console.error("فشل الاتصال بجوجل:", e);
    }
}
check();