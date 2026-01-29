
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { rewriteJob } from '@/lib/ai';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaces
interface ScrapedJob {
    title: string;
    original_description: string;
    location: string;
}

interface RewrittenJob {
    title: string;
    description: string; // The rewriten HTML/Markdown
    category?: string;
    requirements?: string[];
    salary_range?: string;
    skills_required?: string[];
}

// Helper: Generate Hash
function generateJobHash(title: string, description: string, city: string): string {
    const content = `${title}|${description}|${city}`.toLowerCase().trim();
    return crypto.createHash('sha256').update(content).digest('hex');
}

// 1. Scraper Function
async function scrapeJobs(): Promise<ScrapedJob[]> {
    console.log('Starting scraper...');
    // MOCK DATA
    const mockJobs: ScrapedJob[] = [
        {
            title: 'Junior Frontend Developer',
            location: 'Riyadh',
            original_description: `We are looking for a Junior Frontend Developer. Requirements: React, TypeScript, Tailwind.`
        },
        {
            title: 'Marketing Manager',
            location: 'Jeddah',
            original_description: `Seeking a Marketing Manager. Must know SEO, SEM.`
        },
        {
            title: 'Senior Backend Engineer',
            location: 'Riyadh',
            original_description: `We need a Senior Backend Engineer. Experience: 5+ years. Tech stack: Node.js, PostgreSQL, Redis. Full-time position. Salary: 15,000 - 20,000 SAR.`
        }
    ];
    return mockJobs;
}

// 3. Main Pipeline
export async function runPipeline() {
    console.log('Running Pipeline...');
    const jobs = await scrapeJobs();
    console.log(`Found ${jobs.length} jobs.`);

    for (const job of jobs) {
        console.log(`Processing job: ${job.title}`);

        // Generate Hash
        const jobHash = generateJobHash(job.title, job.original_description, job.location);

        // 1. Deduplication Check
        console.log(`Checking hash: ${jobHash}`);
        const { data: existing, error: checkError } = await supabase
            .from('jobs')
            .select('id')
            .eq('job_hash', jobHash)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Hash check error:', checkError);
        }

        if (existing) {
            console.log(`Skipping duplicate (hash match): ${job.title}`);
            continue;
        }

        // 2. Rewrite
        console.log('Rewriting with AI...');
        let rewritten: RewrittenJob | null = null;
        try {
            rewritten = await rewriteJob(job.title, job.location, job.original_description);
        } catch (e) {
            console.error('Rewrite exception:', e);
        }

        if (!rewritten) {
            console.warn('AI Rewrite failed. Using fallback data.');
            rewritten = {
                title: job.title,
                description: `<p>${job.original_description}</p><p><em>(AI Rewrite Unavailable)</em></p>`,
                category: 'General',
                salary_range: 'Not specified',
                skills_required: ['Communication', 'General Skills'], // Fallback skills
                job_type: 'Full-time',
                experience_level: 'Entry',
                salary_min: 0,
                salary_max: 0
            };
        }
        else {
            console.log('AI Rewrite success!');
        }

        // 3. Save to DB
        const seo_url = `${rewritten.title}-${Date.now()}`.replace(/\s+/g, '-').toLowerCase();

        const { error } = await supabase.from('jobs').insert({
            title: rewritten.title,
            description: rewritten.description,
            city: job.location,
            category: rewritten.category || 'General',
            skills_required: rewritten.skills_required || [],
            job_hash: jobHash,
            seo_url: seo_url,
            salary: rewritten.salary_range || 'Not specified',
            // New Fields
            job_type: rewritten.job_type || 'Full-time',
            experience_level: rewritten.experience_level || 'Entry',
            salary_min: rewritten.salary_min || 0,
            salary_max: rewritten.salary_max || 0,

            is_active: true,
            created_by: null
        });

        if (error) console.error('DB Insert Error:', error);
        else console.log(`Saved job: ${rewritten.title}`);
    }
    console.log('Pipeline finished.');
}

// Execute if run directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runPipeline().then(() => console.log('Done.')).catch(console.error);
}
