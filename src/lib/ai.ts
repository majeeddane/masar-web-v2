import dotenv from 'dotenv';
import path from 'path';

// تحميل الإعدادات من ملف .env.local فوراً وبشكل يدوي لضمان وصول المفتاح
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { GoogleGenerativeAI } from '@google/generative-ai';

// قراءة المفتاح
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ تحذير: لم يتم العثور على GEMINI_API_KEY. المحرك سيتوقف!");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

/** * تم التغيير إلى gemini-2.5-flash بناءً على قائمة الموديلات المتاحة لك.
 * هذا الموديل يمتلك حصة استخدام (Quota) أعلى في الفئة المجانية مقارنة بـ Pro.
 */
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
        responseMimeType: "application/json",
    }
});

export interface RewrittenJob {
    title: string;
    description: string;
    category?: string;
    skills_required?: string[];
    job_type: string;
    experience_level: string;
    salary_min: number | null;
    salary_max: number | null;
}

export interface MatchResult {
    score: number;
    reasoning: string;
}

// 1. إعادة صياغة الوظيفة
export async function rewriteJob(title: string, location: string, originalText: string): Promise<RewrittenJob | null> {
    if (!apiKey) return null;

    const prompt = `
    You are an expert HR Specialist for "Masar" Job Board.
    Task: Analyze the job post and rewrite it into professional Arabic.
    Input: Title: ${title}, Location: ${location}, Text: ${originalText}
    Output JSON Schema:
    {
      "title": "Arabic Professional Title",
      "description": "HTML Arabic Content",
      "category": "string",
      "skills_required": ["skill1", "skill2"],
      "job_type": "string",
      "experience_level": "string",
      "salary_min": number | null,
      "salary_max": number | null
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        console.log(`✅ ذكاء اصطناعي (Flash 2.5): تمت معالجة وظيفة "${title}" بنجاح.`);
        return parsed;
    } catch (error: any) {
        console.error('❌ خطأ في معالجة الذكاء الاصطناعي:', error.message);
        return null;
    }
}

// 2. استخراج المهارات من السيرة الذاتية
export async function extractSkillsFromCV(cvText: string): Promise<string[]> {
    if (!apiKey) return [];
    const prompt = `Extract top technical skills from this CV as JSON array: ${cvText.substring(0, 3000)}`;
    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        return [];
    }
}

// 3. حساب نسبة المطابقة
export async function calculateMatchScore(jobDescription: string, cvText: string): Promise<MatchResult> {
    if (!apiKey) return { score: 0, reasoning: 'AI unavailable' };
    const prompt = `Compare Job vs CV. Return JSON: {"score": number, "reasoning": "string"}
    Job: ${jobDescription.substring(0, 1500)}
    CV: ${cvText.substring(0, 1500)}`;
    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        return { score: 0, reasoning: 'Error' };
    }
}

// 4. كتابة رسالة التغطية
export async function generateCoverLetter(jobTitle: string, userSkills: string[], userName: string): Promise<string> {
    if (!apiKey) return '';
    const prompt = `Write a short professional Arabic cover letter for ${userName} applying for ${jobTitle} with skills: ${userSkills.join(', ')}. Return plain text only.`;
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return '';
    }
}