import dotenv from 'dotenv';
import path from 'path';
import { MASAR_JOB_CATEGORIES } from './constants';

// تحميل الإعدادات من ملف .env.local فوراً وبشكل يدوي لضمان وصول المفتاح
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { GoogleGenerativeAI } from '@google/generative-ai';

// قراءة المفتاح
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ تحذير: لم يتم العثور على GEMINI_API_KEY. المحرك سيعتمد على المعالجة الاحتياطية!");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const getAIModel = () => {
    return genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            responseMimeType: "application/json",
        }
    });
};

export interface RawJobInput {
    title: string;
    company: string;
    description: string;
    url: string;
    location?: string;
    salary?: string;
    category?: string;
    job_type?: string;
    source_name?: string;
}

export interface ProcessedRealJob {
    title: string;
    company: string;
    company_name: string;
    category: string;
    city: string;
    location: string;
    job_type: string;
    experience_level: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_range: string;
    description: string;
    phone_number: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    application_link: string;
    source_url: string;
}

// تنظيف نصوص HTML البسيطة
function cleanHtml(html: string): string {
    if (!html) return '';
    return html
        .replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '')
        .replace(/<style[^>]*>([\S\s]*?)<\/style>/gmi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

// دالة لمعالجة وإعادة صياغة الوظيفة الحقيقية بواسطة الذكاء الاصطناعي
export async function processRealJobWithAI(rawJob: RawJobInput): Promise<ProcessedRealJob> {
    const cleanedText = cleanHtml(rawJob.description).substring(0, 4000);
    const validCategories = MASAR_JOB_CATEGORIES.join('", "');

    if (!apiKey) {
        return createFallbackJob(rawJob);
    }

    const prompt = `
أنت خبير توظيف ومسؤول موارد بشرية لمنصة التوظيف "مسار" (Masar Job Board).
المهمة: قم بتحليل إعلان الوظيفة الحقيقي التالي وإعادة صياغته وترجمته بالكامل إلى اللغة العربية بأسلوب احترافي وجذاب ومنظم، واستخراج كافة بيانات التواصل والشروط.

بيانات الوظيفة الأصلية:
- المسمى الوظيفي: ${rawJob.title}
- الشركة: ${rawJob.company}
- الموقع الأصلي: ${rawJob.location || 'Remote / عن بعد'}
- الراتب المعلن: ${rawJob.salary || 'غير محدد'}
- رابط التقديم: ${rawJob.url}
- تفاصيل الوظيفة:
${cleanedText}

قائمة التصنيفات المعتمدة في منصة مسار (اختر الأنسب تماماً منها):
["${validCategories}"]

يرجى إرجاع الرد بتنسيق JSON حصراً وفق المخطط التالي:
{
  "title": "مسمى الوظيفة بالعربية واضح ومختصر واحترافي (مثال: مهندس برمجيات أول - عن بعد)",
  "company_name": "${rawJob.company}",
  "category": "اختر تصنيفاً واحداً فقط وبدقة من قائمة التصنيفات المعتمدة أعلاه",
  "city": "اسم المدينة إذا كانت محددة أو 'العمل عن بعد'",
  "location": "المدينة أو 'عن بعد - عالمي'",
  "job_type": "دوام كامل أو دوام جزئي أو عن بعد أو عقد",
  "experience_level": "مبتدئ / حديث التخرج أو متوسط الخبرة أو خبير / متقدم أو مدير / قائد فريق",
  "salary_min": null,
  "salary_max": null,
  "salary_range": "الراتب إذا وجد بالريال أو الدولار أو 'يحدد بعد المقابلة'",
  "contact_email": "البريد الإلكتروني المذكور للتواصل إن وجد أو null",
  "contact_phone": "رقم الهاتف أو الواتساب إن وجد أو null",
  "description": "النص الوظيفي الكامل والمنسق باللغة العربية مع العناوين والرموز التعبيرية مثل: 📌 نبذة عن الوظيفة | 📋 المهام والمسؤوليات | 🎯 المؤهلات والخبرات | 🎁 المزايا"
}
`;

    try {
        const aiModel = getAIModel();
        const result = await aiModel.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        return {
            title: parsed.title || rawJob.title,
            company: rawJob.company || parsed.company_name || 'شركة معتمدة',
            company_name: rawJob.company || parsed.company_name || 'شركة معتمدة',
            category: parsed.category || rawJob.category || 'برمجة',
            city: parsed.city || 'العمل عن بعد',
            location: parsed.location || rawJob.location || 'عن بعد',
            job_type: parsed.job_type || rawJob.job_type || 'دوام كامل',
            experience_level: parsed.experience_level || 'متوسط الخبرة',
            salary_min: typeof parsed.salary_min === 'number' ? parsed.salary_min : null,
            salary_max: typeof parsed.salary_max === 'number' ? parsed.salary_max : null,
            salary_range: parsed.salary_range || rawJob.salary || 'حسب الخبرة والكفاءة',
            description: parsed.description || rawJob.description,
            phone_number: parsed.contact_phone || null,
            contact_phone: parsed.contact_phone || null,
            contact_email: parsed.contact_email || extractEmail(rawJob.description),
            application_link: rawJob.url,
            source_url: rawJob.url
        };
    } catch (error: any) {
        console.warn(`⚠️ فشل معالجة AI للوظيفة (${rawJob.title})، سيتم استخدام المعالجة الاحتياطية:`, error?.message || error);
        return createFallbackJob(rawJob);
    }
}

// استخراج البريد الإلكتروني بالـ Regex
function extractEmail(text: string): string | null {
    if (!text) return null;
    const match = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
    return match ? match[1] : null;
}

// دالة احتياطية لتنسيق الوظيفة في حال عدم توفر الذكاء الاصطناعي
function createFallbackJob(rawJob: RawJobInput): ProcessedRealJob {
    const cleaned = cleanHtml(rawJob.description);
    const email = extractEmail(rawJob.description);

    // تخمين التصنيف تلقائياً
    let matchedCategory = 'برمجة';
    const lowerTitle = (rawJob.title + ' ' + (rawJob.category || '')).toLowerCase();
    
    if (lowerTitle.includes('design') || lowerTitle.includes('ux') || lowerTitle.includes('ui') || lowerTitle.includes('art')) {
        matchedCategory = 'تصميم';
    } else if (lowerTitle.includes('marketing') || lowerTitle.includes('sales') || lowerTitle.includes('seo') || lowerTitle.includes('growth')) {
        matchedCategory = 'مبيعات وتسويق';
    } else if (lowerTitle.includes('manager') || lowerTitle.includes('management') || lowerTitle.includes('director') || lowerTitle.includes('lead')) {
        matchedCategory = 'إدارة';
    } else if (lowerTitle.includes('account') || lowerTitle.includes('finance') || lowerTitle.includes('audit')) {
        matchedCategory = 'حسابات';
    } else if (lowerTitle.includes('support') || lowerTitle.includes('customer') || lowerTitle.includes('service')) {
        matchedCategory = 'خدمة الزبائن';
    } else if (lowerTitle.includes('hr') || lowerTitle.includes('people') || lowerTitle.includes('recruiter')) {
        matchedCategory = 'موارد بشرية';
    } else if (lowerTitle.includes('devops') || lowerTitle.includes('system') || lowerTitle.includes('network') || lowerTitle.includes('cloud')) {
        matchedCategory = 'كمبيوتر وشبكات';
    } else if (lowerTitle.includes('web') || lowerTitle.includes('frontend')) {
        matchedCategory = 'تصميم مواقع';
    }

    const formattedDescription = `📌 **نبذة عن الوظيفة:**
فرصة وظيفية حقيقية مقدمة من شركة ${rawJob.company}.

📋 **تفاصيل الوظيفة ومسؤوليات العمل:**
${cleaned.substring(0, 1500)}

🔗 **طريقة التقديم:**
يمكنك التقديم مباشرة عبر الضغط على زر التقديم الخارجي بالأسفل للانتقال لصفحة التقديم الرسمية.`;

    return {
        title: rawJob.title,
        company: rawJob.company,
        company_name: rawJob.company,
        category: matchedCategory,
        city: rawJob.location || 'العمل عن بعد',
        location: rawJob.location || 'عن بعد',
        job_type: rawJob.job_type || 'دوام كامل',
        experience_level: 'متوسط الخبرة',
        salary_min: null,
        salary_max: null,
        salary_range: rawJob.salary || 'يحدد بعد المقابلة',
        description: formattedDescription,
        phone_number: null,
        contact_phone: null,
        contact_email: email,
        application_link: rawJob.url,
        source_url: rawJob.url
    };
}

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
        const aiModel = getAIModel();
        const result = await aiModel.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        console.log(`✅ ذكاء اصطناعي: تمت معالجة وظيفة "${title}" بنجاح.`);
        return parsed;
    } catch (error: any) {
        console.error('❌ خطأ في معالجة الذكاء الاصطناعي:', error?.message || error);
        return null;
    }
}

// 2. استخراج المهارات من السيرة الذاتية
export async function extractSkillsFromCV(cvText: string): Promise<string[]> {
    if (!apiKey) return [];
    const prompt = `Extract top technical skills from this CV as JSON array: ${cvText.substring(0, 3000)}`;
    try {
        const aiModel = getAIModel();
        const result = await aiModel.generateContent(prompt);
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
        const aiModel = getAIModel();
        const result = await aiModel.generateContent(prompt);
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
        const aiModel = getAIModel();
        const result = await aiModel.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return '';
    }
}