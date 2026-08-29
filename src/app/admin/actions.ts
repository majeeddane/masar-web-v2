'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { jobAggregator } from '@/services/jobAggregator.service';

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyz.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// Helper: Get Admin Client
const getAdminClient = () => createClient(supabaseUrl, serviceRoleKey);

// 1. Login Action
export async function verifyAdminPassword(password: string) {
    if (password === ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'authenticated', { httpOnly: true, secure: true });
        return { success: true };
    }
    return { success: false, error: 'كلمة المرور غير صحيحة' };
}

// 2. Check Session (For initial load)
export async function checkAdminSession() {
    const cookieStore = await cookies();
    return cookieStore.get('admin_session')?.value === 'authenticated';
}

// 3. Delete Job
export async function deleteJob(id: string) {
    const supabase = getAdminClient();
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// 4. Update Job
export async function updateJob(id: string, updates: any) {
    const supabase = getAdminClient();
    const { error } = await supabase.from('jobs').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// 5. Trigger Real Job Sync with AI
export async function triggerJobSync(limitPerSource: number = 10, source: 'all' | 'saudi' | 'jobicy' | 'arbeitnow' | 'remotive' = 'all') {
    try {
        console.log(`⚡ [Admin Action] تشغيل مزامنة الوظائف (المصدر: ${source}, الحد: ${limitPerSource})...`);
        const report = await jobAggregator.runSync({ limitPerSource, source });
        return { success: true, report };
    } catch (e: any) {
        console.error('❌ خطأ في تشغيل المزامنة:', e);
        return { success: false, error: e.message || 'فشلت المزامنة' };
    }
}

// 6. Purge Mock / Test Jobs
export async function purgeMockJobs() {
    try {
        console.log('🧹 [Admin Action] تنظيف الوظائف التجريبية...');
        const result = await jobAggregator.purgeMockJobs();
        return { success: true, result };
    } catch (e: any) {
        console.error('❌ خطأ في تنظيف الوظائف التجريبية:', e);
        return { success: false, error: e.message || 'فشل التنظيف' };
    }
}

// 7. Purge All Jobs (Clean Slate)
export async function purgeAllJobs() {
    try {
        console.log('🗑️ [Admin Action] تنظيف جدول الوظائف بالكامل...');
        const result = await jobAggregator.purgeAllJobs();
        return { success: true, result };
    } catch (e: any) {
        console.error('❌ خطأ في مسح الوظائف:', e);
        return { success: false, error: e.message || 'فشل المسح' };
    }
}

// 8. Get Applications
export async function getApplications() {
    const supabase = getAdminClient();

    const { data, error } = await supabase
        .from('applications')
        .select(`
            *,
            jobs (
                title
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return { success: true, data };
}

