'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabaseClient' // This is the CLIENT creation, might need adjustment if using SSR package everywhere
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()
    // NOTE: Using the standard client-side supabase for signOut is easiest from a client component
    // But since we are using cookies, we need to make sure the Server knows.
    // However, supabase.auth.signOut() usually clears local storage and hits the endpoint.
    // Ideally we use a server action or route handler to clear cookies too.
    // For now, let's use the browser client which coordinates with the server if configured correctly.
    // If we only have `createClient` from `@supabase/ssr` in `lib/supabaseClient.ts`, we need to check how it's defined.
    // If it's the `createBrowserClient`, it works.

    // Let's check imports in `src/lib/supabaseClient.ts`.
    // It imports from `@supabase/supabase-js`, not `@supabase/ssr`. This is the old/simple client.
    // It might NOT clear server cookies if we use `@supabase/ssr` server-side.
    // So we definitely need a Server Action or Route Handler for robust Logout.

    // Let's implement a quick Server Action for logout to be safe?
    // Or just simple client signout for now as requested.

    const handleLogout = async () => {
        // Try simple client signout first
        const { supabase } = await import('@/lib/supabaseClient')
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh() // Refresh to update server components
    }

    return (
        <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-all"
        >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
        </button>
    )
}
