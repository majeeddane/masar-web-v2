'use client';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function UnreadBadge({ refreshKey }: { refreshKey?: number }) {
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }, []);

    const [count, setCount] = useState<number>(0);

    async function fetchUnread() {
        const { data, error } = await supabase.rpc('get_unread_total');
        if (error) {
            console.error('get_unread_total error:', error);
            return;
        }
        setCount(Number(data ?? 0));
    }

    useEffect(() => {
        fetchUnread();

        // 1. Polling (Cross-tab safety)
        const pollId = setInterval(fetchUnread, 15000);

        // 2. Custom Event (Immediate local update)
        const handleRefresh = () => fetchUnread();

        if (typeof window !== 'undefined') {
            window.addEventListener('masar:unread-refresh', handleRefresh);
        }

        return () => {
            clearInterval(pollId);
            if (typeof window !== 'undefined') {
                window.removeEventListener('masar:unread-refresh', handleRefresh);
            }
        };
    }, [supabase, refreshKey]);

    if (!count) return null;

    return (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center absolute -top-2 -right-2 border-2 border-white animate-in zoom-in duration-200">
            {count > 99 ? '99+' : count}
        </span>
    );
}
