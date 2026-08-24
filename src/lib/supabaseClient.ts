import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.placeholder';

// Use implicit flow so that email-based auth (password reset, magic links)
// works across different browsers and devices without needing a stored code_verifier.
export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            flowType: 'implicit',
        },
    }
)

export function getSupabaseBrowserClient() {
    return createBrowserClient(supabaseUrl, supabaseKey, {
        auth: {
            flowType: 'implicit',
        },
    });
}