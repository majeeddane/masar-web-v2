import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Check Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'يجب عليك تسجيل الدخول أولاً لنشر وظيفة.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            company,
            category,
            city,
            job_type,
            experience_level,
            salary_min,
            salary_max,
            description,
            phone_number,
            contact_email,
            application_link
        } = body;

        if (!title?.trim() || !company?.trim() || !category || !city || !description?.trim()) {
            return NextResponse.json(
                { success: false, error: 'يرجى ملء جميع الحقول المطلوبة (مسمى الوظيفة، اسم الشركة، القسم، المدينة، والوصف).' },
                { status: 400 }
            );
        }

        const cleanTitle = title.trim();
        const cleanCompany = company.trim();
        const cleanCategory = category.trim();
        const cleanCity = city.trim();
        const cleanDescription = description.trim();
        const cleanPhone = phone_number?.trim() || null;
        const cleanEmail = contact_email?.trim() || null;
        const cleanLink = application_link?.trim() || null;
        const numSalaryMin = salary_min ? Number(salary_min) : null;
        const numSalaryMax = salary_max ? Number(salary_max) : null;
        const salaryRange = numSalaryMin && numSalaryMax ? `${numSalaryMin} - ${numSalaryMax}` : (numSalaryMin ? `${numSalaryMin}` : null);

        // Tier 1: Standard Comprehensive Payload
        const tier1Payload: Record<string, any> = {
            title: cleanTitle,
            company: cleanCompany,
            company_name: cleanCompany,
            category: cleanCategory,
            city: cleanCity,
            location: cleanCity,
            description: cleanDescription,
            job_type: job_type || 'Full-time',
            type: job_type || 'Full-time',
            experience_level: experience_level || 'Entry Level',
            salary_min: numSalaryMin,
            salary_max: numSalaryMax,
            salary_range: salaryRange,
            phone_number: cleanPhone,
            phone: cleanPhone,
            contact_phone: cleanPhone,
            contact_email: cleanEmail,
            email: cleanEmail,
            application_link: cleanLink,
            source_url: cleanLink,
            is_active: true,
            user_id: user.id,
            created_by: user.id
        };

        // Attempt Tier 1 Insert
        let { data, error } = await supabase.from('jobs').insert(tier1Payload).select().single();

        // Tier 2: Standard Schema (in case extra alias columns don't exist)
        if (error) {
            console.warn('Tier 1 insert failed, trying Tier 2 standard schema:', error.message);
            const tier2Payload: Record<string, any> = {
                title: cleanTitle,
                company: cleanCompany,
                category: cleanCategory,
                city: cleanCity,
                location: cleanCity,
                description: cleanDescription,
                job_type: job_type || 'Full-time',
                experience_level: experience_level || 'Entry Level',
                salary_min: numSalaryMin,
                salary_max: numSalaryMax,
                phone_number: cleanPhone,
                contact_email: cleanEmail,
                application_link: cleanLink,
                is_active: true,
                user_id: user.id
            };
            const res2 = await supabase.from('jobs').insert(tier2Payload).select().single();
            data = res2.data;
            error = res2.error;
        }

        // Tier 3: Core Minimal Schema (compatible with legacy minimal table)
        if (error) {
            console.warn('Tier 2 insert failed, trying Tier 3 core minimal schema:', error.message);
            const tier3Payload: Record<string, any> = {
                title: cleanTitle,
                company: cleanCompany,
                category: cleanCategory,
                location: cleanCity,
                description: cleanDescription,
                phone_number: cleanPhone,
                contact_email: cleanEmail,
                application_link: cleanLink,
                is_active: true,
                user_id: user.id
            };
            const res3 = await supabase.from('jobs').insert(tier3Payload).select().single();
            data = res3.data;
            error = res3.error;
        }

        // Tier 4: Legacy Alternative Column Names (company_name, type, phone, email)
        if (error) {
            console.warn('Tier 3 insert failed, trying Tier 4 legacy aliases schema:', error.message);
            const tier4Payload: Record<string, any> = {
                title: cleanTitle,
                company_name: cleanCompany,
                location: cleanCity,
                description: cleanDescription,
                type: job_type || 'Full-time',
                phone: cleanPhone,
                email: cleanEmail,
                is_active: true,
                user_id: user.id
            };
            const res4 = await supabase.from('jobs').insert(tier4Payload).select().single();
            data = res4.data;
            error = res4.error;
        }

        if (error) {
            console.error('All job insert tiers failed:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: `فشل حفظ الوظيفة في قاعدة البيانات: ${error.message}`
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            job: data
        });

    } catch (err: any) {
        console.error('Unexpected error in /api/jobs/create:', err);
        return NextResponse.json(
            { success: false, error: err.message || 'حدث خطأ غير متوقع أثناء نشر الوظيفة.' },
            { status: 500 }
        );
    }
}
