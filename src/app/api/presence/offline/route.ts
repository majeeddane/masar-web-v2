import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const cookieStore = request.cookies

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    // No-op for read-only route handler or if we don't need to persist updates
                },
                remove(name: string, options: CookieOptions) {
                    // No-op
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        // Manually update presence to offline
        // Using admin-like privileges if needed, or ensuring RLS allows update of own profile
        await supabase.from('profiles').update({
            is_online: false,
            last_seen_at: new Date().toISOString()
        }).eq('id', user.id);
    }

    return NextResponse.json({ success: true });
}
