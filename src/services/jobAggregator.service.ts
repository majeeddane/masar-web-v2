import { createClient } from '@supabase/supabase-js';
import { processRealJobWithAI, RawJobInput, ProcessedRealJob } from '@/lib/ai';
import { saudiJobService } from './saudiJobFetcher.service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyz.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

const getAdminSupabase = () => createClient(supabaseUrl, serviceRoleKey);

export interface SyncOptions {
    limitPerSource?: number;
    source?: 'all' | 'saudi' | 'jobicy' | 'arbeitnow' | 'remotive';
}

export interface SyncReport {
    timestamp: string;
    totalFetched: number;
    alreadyExisted: number;
    newJobsProcessed: number;
    successfullyInserted: number;
    failed: number;
    insertedJobs: Array<{ title: string; company: string; category: string; url: string }>;
    errors: string[];
}


export class JobAggregatorService {
    // 1. جلب الوظائف من Jobicy API
    async fetchFromJobicy(limit: number = 20): Promise<RawJobInput[]> {
        try {
            console.log(`📡 [Jobicy] بدء جلب ${limit} وظيفة...`);
            const response = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=${limit}`, {
                headers: { 'User-Agent': 'MasarPlatform/2.0' }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status} from Jobicy`);
            const data = await response.json();
            const jobs = data.jobs || [];

            return jobs.map((j: any) => ({
                title: j.jobTitle || 'وظيفة بدون عنوان',
                company: j.companyName || 'شركة توظيف',
                description: j.jobDescription || j.jobExcerpt || '',
                url: j.url || '',
                location: j.jobGeo || 'عن بعد',
                salary: j.annualSalaryMin && j.annualSalaryMax ? `$${j.annualSalaryMin} - $${j.annualSalaryMax}` : (j.salary || ''),
                category: Array.isArray(j.jobIndustry) ? j.jobIndustry.join(', ') : (j.jobIndustry || 'تقنية'),
                job_type: Array.isArray(j.jobType) ? j.jobType[0] : (j.jobType || 'Full-time'),
                source_name: 'Jobicy'
            }));
        } catch (error: any) {
            console.error('❌ [Jobicy] خطأ أثناء الجلب:', error.message || error);
            return [];
        }
    }

    // 2. جلب الوظائف من Arbeitnow API
    async fetchFromArbeitnow(limit: number = 20): Promise<RawJobInput[]> {
        try {
            console.log(`📡 [Arbeitnow] بدء جلب الوظائف...`);
            const response = await fetch('https://arbeitnow.com/api/job-board-api', {
                headers: { 'User-Agent': 'MasarPlatform/2.0' }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status} from Arbeitnow`);
            const data = await response.json();
            const jobs = (data.data || []).slice(0, limit);

            return jobs.map((j: any) => ({
                title: j.title || 'وظيفة بدون عنوان',
                company: j.company_name || 'شركة توظيف',
                description: j.description || '',
                url: j.url || '',
                location: j.location || (j.remote ? 'عن بعد' : 'دولي'),
                salary: '',
                category: Array.isArray(j.tags) ? j.tags.join(', ') : (j.job_types?.[0] || 'وظائف عامة'),
                job_type: j.job_types?.[0] || (j.remote ? 'عن بعد' : 'Full-time'),
                source_name: 'Arbeitnow'
            }));
        } catch (error: any) {
            console.error('❌ [Arbeitnow] خطأ أثناء الجلب:', error.message || error);
            return [];
        }
    }

    // 3. جلب الوظائف من Remotive API
    async fetchFromRemotive(limit: number = 20): Promise<RawJobInput[]> {
        try {
            console.log(`📡 [Remotive] بدء جلب ${limit} وظيفة...`);
            const response = await fetch(`https://remotive.com/api/remote-jobs?limit=${limit}`, {
                headers: { 'User-Agent': 'MasarPlatform/2.0' }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status} from Remotive`);
            const data = await response.json();
            const jobs = (data.jobs || []).slice(0, limit);

            return jobs.map((j: any) => ({
                title: j.title || 'وظيفة بدون عنوان',
                company: j.company_name || 'شركة توظيف',
                description: j.description || '',
                url: j.url || '',
                location: j.candidate_required_location || 'عن بعد',
                salary: j.salary || '',
                category: j.category || 'برمجة وتقنية',
                job_type: j.job_type || 'Full-time',
                source_name: 'Remotive'
            }));
        } catch (error: any) {
            console.error('❌ [Remotive] خطأ أثناء الجلب:', error.message || error);
            return [];
        }
    }

    // 4. فحص الروابط الموجودة مسبقاً في قاعدة البيانات لمنع التكرار
    async filterDuplicates(rawJobs: RawJobInput[]): Promise<{ uniqueJobs: RawJobInput[]; duplicateCount: number }> {
        const supabase = getAdminSupabase();
        const urls = rawJobs.map(j => j.url).filter(Boolean);

        if (urls.length === 0) {
            return { uniqueJobs: rawJobs, duplicateCount: 0 };
        }

        const { data: existingJobs, error } = await supabase
            .from('jobs')
            .select('application_link')
            .in('application_link', urls);

        if (error) {
            console.warn('⚠️ تعذر فحص التكرار من Supabase، سيتم الاستمرار:', error.message);
            return { uniqueJobs: rawJobs, duplicateCount: 0 };
        }

        const existingSet = new Set<string>();
        (existingJobs || []).forEach((j: any) => {
            if (j.application_link) existingSet.add(j.application_link);
        });

        const seenInBatch = new Set<string>();
        const uniqueJobs: RawJobInput[] = [];
        let duplicateCount = 0;

        for (const job of rawJobs) {
            if (!job.url || existingSet.has(job.url) || seenInBatch.has(job.url)) {
                duplicateCount++;
            } else {
                seenInBatch.add(job.url);
                uniqueJobs.push(job);
            }
        }

        return { uniqueJobs, duplicateCount };
    }

    // 5. محرك المزامنة والمعالجة الشاملة
    async runSync(options: SyncOptions = {}): Promise<SyncReport> {
        const limitPerSource = options.limitPerSource || 10;
        const source = options.source || 'all';

        const report: SyncReport = {
            timestamp: new Date().toISOString(),
            totalFetched: 0,
            alreadyExisted: 0,
            newJobsProcessed: 0,
            successfullyInserted: 0,
            failed: 0,
            insertedJobs: [],
            errors: []
        };

        const rawJobsList: RawJobInput[] = [];

        // نشر وتثبيت وظائف المملكة العربية السعودية المنظمة في كافة المدن والأقسام
        if (source === 'all' || source === 'saudi') {
            console.log('🇸🇦 بدء مزامنة وظائف المملكة العربية السعودية...');
            const saudiRes = await saudiJobService.seedSaudiJobs();
            report.successfullyInserted += saudiRes.inserted;
        }

        // جمع الوظائف من المصادر الدولية الأخرى
        if (source === 'all' || source === 'jobicy') {
            const jobicyJobs = await this.fetchFromJobicy(limitPerSource);
            rawJobsList.push(...jobicyJobs);
        }
        if (source === 'all' || source === 'arbeitnow') {
            const arbeitnowJobs = await this.fetchFromArbeitnow(limitPerSource);
            rawJobsList.push(...arbeitnowJobs);
        }
        if (source === 'all' || source === 'remotive') {
            const remotiveJobs = await this.fetchFromRemotive(limitPerSource);
            rawJobsList.push(...remotiveJobs);
        }

        report.totalFetched = rawJobsList.length;


        // فلترة التكرار
        const { uniqueJobs, duplicateCount } = await this.filterDuplicates(rawJobsList);
        report.alreadyExisted = duplicateCount;
        report.newJobsProcessed = uniqueJobs.length;

        console.log(`📊 إجمالي الوظائف المسحوبة: ${report.totalFetched} | الوظائف المكررة: ${duplicateCount} | وظائف جديدة للمعالجة: ${uniqueJobs.length}`);

        const supabase = getAdminSupabase();

        // جلب معرف حساب المشرف لربط الوظائف به لضمان عدم انتهاك قيد user_id NOT NULL
        let defaultUserId: string = 'cf649393-bdd3-49e0-b1ca-e83452ce92fa';
        try {
            const { data: adminUser } = await supabase.from('profiles').select('id').eq('is_admin', true).limit(1).maybeSingle();
            if (adminUser?.id) {
                defaultUserId = adminUser.id;
            } else {
                const { data: anyUser } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
                if (anyUser?.id) defaultUserId = anyUser.id;
            }
        } catch (e) {
            console.warn('⚠️ تعذر جلب معرف المشرف، سيتم استخدام المعرف الافتراضي');
        }

        // معالجة الوظائف بالذكاء الاصطناعي وحفظها في قاعدة البيانات
        for (const rawJob of uniqueJobs) {
            try {
                console.log(`🤖 معالجة وظيفة بالذكاء الاصطناعي: ${rawJob.title} (${rawJob.company})...`);
                const processed = await processRealJobWithAI(rawJob);

                const payload = {
                    user_id: defaultUserId,
                    title: processed.title,
                    company_name: processed.company_name || processed.company,
                    category: processed.category,
                    city: processed.city || 'العمل عن بعد',
                    location: processed.location || 'عن بعد',
                    type: processed.job_type || 'Full-time',
                    job_type: processed.job_type || 'Full-time',
                    experience_level: processed.experience_level,
                    salary_min: processed.salary_min,
                    salary_max: processed.salary_max,
                    salary_range: processed.salary_range,
                    description: processed.description,
                    phone: processed.contact_phone || processed.phone_number || null,
                    phone_number: processed.contact_phone || processed.phone_number || null,
                    contact_phone: processed.contact_phone || null,
                    email: processed.contact_email || null,
                    contact_email: processed.contact_email || null,
                    application_link: processed.application_link,
                    is_active: true
                };

                const { data, error } = await supabase.from('jobs').insert(payload).select('id').single();

                if (error) {
                    throw error;
                }

                report.successfullyInserted++;
                report.insertedJobs.push({
                    title: processed.title,
                    company: processed.company_name,
                    category: processed.category,
                    url: processed.application_link
                });

                console.log(`✅ [${report.successfullyInserted}] تم إدراج الوظيفة بنجاح: ${processed.title} [${processed.category}]`);

                // فاصل زمني بسيط لتفادي قيود معدل الطلبات (Rate Limiting)
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (err: any) {
                console.error(`❌ فشل حفظ الوظيفة (${rawJob.title}):`, err?.message || err);
                report.failed++;
                report.errors.push(`خطأ في وظيفة "${rawJob.title}": ${err?.message || err}`);
            }
        }

        return report;
    }

    // 6. حذف الوظائف التجريبية
    async purgeMockJobs(): Promise<{ deletedCount: number; message: string }> {
        const supabase = getAdminSupabase();

        const { data: allJobs, error: fetchErr } = await supabase
            .from('jobs')
            .select('id, title, description, application_link');

        if (fetchErr) {
            throw new Error(`خطأ في قراءة الوظائف: ${fetchErr.message}`);
        }

        const mockIds = (allJobs || [])
            .filter((j: any) => {
                const titleLower = (j.title || '').toLowerCase();
                const descLower = (j.description || '').toLowerCase();
                const isMock = !j.application_link ||
                    titleLower.includes('mock') ||
                    titleLower.includes('test') ||
                    titleLower.includes('تجريب') ||
                    descLower.includes('mocked') ||
                    descLower.includes('syntax error fixed') ||
                    descLower.includes('test description');
                return isMock;
            })
            .map((j: any) => j.id);

        if (mockIds.length === 0) {
            return { deletedCount: 0, message: 'لا توجد وظائف تجريبية لحذفها' };
        }

        const { error: deleteErr } = await supabase
            .from('jobs')
            .delete()
            .in('id', mockIds);

        if (deleteErr) {
            throw new Error(`خطأ في حذف الوظائف التجريبية: ${deleteErr.message}`);
        }

        return {
            deletedCount: mockIds.length,
            message: `تم حذف ${mockIds.length} وظيفة تجريبية بنجاح!`
        };
    }

    // 7. حذف كافة الوظائف إذا رغب المدير في تنظيف كامل
    async purgeAllJobs(): Promise<{ deletedCount: number; message: string }> {
        const supabase = getAdminSupabase();
        const { data, error } = await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000').select('id');
        if (error) throw new Error(error.message);
        return {
            deletedCount: data?.length || 0,
            message: `تم تنظيف جدول الوظائف بالكامل (${data?.length || 0} وظيفة)`
        };
    }
}

export const jobAggregator = new JobAggregatorService();
