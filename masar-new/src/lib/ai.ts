import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface RewrittenJob {
    title: string;
    description: string;
    category?: string;
    requirements?: string[];
    salary_range?: string;
    skills_required?: string[];
}

export interface MatchResult {
    score: number;
    reasoning: string;
}

// 1. Rewrite Job Description + Extract Skills
export async function rewriteJob(title: string, location: string, originalText: string): Promise<RewrittenJob | null> {
    if (!apiKey) return null;

    const prompt = `
    You are an expert HR AI for "Masar".
    Task: Rewrite this job post into professional Arabic and extract key technical skills.
    
    Input:
    Title: ${title}
    Location: ${location}
    Text: ${originalText}
    
    Instructions:
    1. Rewrite description in professional Arabic (HTML format).
    2. Remove contact info/links.
    3. Extract a list of TOP 5-10 technical skills (e.g. "React", "Project Management", "Accounting") in English or Arabic (maintain consistency).
    
    Output JSON:
    {
      "title": "Arabic Title",
      "description": "<p>...</p>",
      "category": "Category",
      "salary_range": "Range or 'Not specified'",
      "skills_required": ["Skill 1", "Skill 2"]
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error: any) {
        console.error('AI Rewrite Error Full:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return null;
    }
}

// 2. Extract Skills from CV Text
export async function extractSkillsFromCV(cvText: string): Promise<string[]> {
    if (!apiKey) return [];

    const prompt = `
    Extract the top technical and professional skills from this CV text.
    Return ONLY a JSON array of strings.
    
    CV Text: ${cvText.substring(0, 2000)} ...
    
    Output Example: ["Python", "Sales", "Leadership"]
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('AI CV Extract Error:', error);
        return [];
    }
}

// 3. Calculate Match Score
export async function calculateMatchScore(jobDescription: string, cvText: string): Promise<MatchResult> {
    if (!apiKey) return { score: 0, reasoning: 'AI unavailable' };

    const prompt = `
    Act as a senior Recruiter.
    Compare the Job Description and Candidate CV below.
    
    1. Analyze the fit based on skills, experience, and role requirements.
    2. Assign a Match Score from 0 to 100.
    3. Provide a brief reasoning (1-2 sentences).
    
    Job: ${jobDescription.substring(0, 1000)}
    CV: ${cvText.substring(0, 1000)}
    
    Output JSON:
    {
      "score": 85,
      "reasoning": "Candidate has strong matching skills in X and Y..."
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('AI Match Error:', error);
        return { score: 0, reasoning: 'Error calculating score' };
    }
}

// 4. Generate Cover Letter
export async function generateCoverLetter(jobTitle: string, userSkills: string[], userName: string): Promise<string> {
    if (!apiKey) return '';

    const prompt = `
      Write a professional, enthusiastic short cover letter in Arabic for a job application.
      Job: ${jobTitle}
      Candidate: ${userName}
      Skills: ${userSkills.join(', ')}
      
      Output: Plain text cover letter.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('AI Cover Letter Error:', error);
        return '';
    }
}
