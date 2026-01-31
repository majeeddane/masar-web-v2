'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use Service Role for Admin delete/update if RLS is on
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Helper: Get Admin Client
const getAdminClient = () => createClient(supabaseUrl, serviceRoleKey);

// 1. Login Action
export async function verifyAdminPassword(password: string) {
    if (password === ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        // Set a simple cookie for "session" (Not production grade, but fits "quick solution")
        // In a real app, use JWT or proper Auth.
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

// 5. Trigger Scraper
export async function triggerScraper() {
    // This is better called from Client via fetch to reuse the API logic, 
    // but can be direct here. Let's return the API URL and Key for client to call 
    // OR call it directly here.
    // Given the prompt asks to "Call the API /api/scrape", let's do it from Client 
    // to utilize the existing route logic (and show progress).

    // We'll just provide the secret to the client safely? No, that exposes it.
    // Better: The Client calls this action, and this action calls the API locally or executes logic.
    // Actually, user explicitly asked: "Button ... calls my API /api/scrape ... send Bearer Token".
    // I should probably do this client-side for the visual feedback, but I need the token.
    // I'll create a Server Action proxy that calls the API so the token stays server-side.

    try {
        const secret = process.env.CRON_SECRET;
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/scrape`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secret}`
            }
        });
        const data = await response.json();
        return { success: true, data };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
