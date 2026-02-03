'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function UnreadBadge() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        async function fetchUnread() {
            const { data, error } = await supabase.rpc('get_unread_total');
            if (data !== null && !error) {
                setCount(Number(data));
            }
        }

        fetchUnread();

        // Realtime subscription for unread updates
        const channel = supabase
            .channel('unread_badge')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                () => {
                    fetchUnread();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    if (count === 0) return null;

    return (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center absolute -top-2 -right-2 border-2 border-white">
            {count > 99 ? '99+' : count}
        </span>
    );
}
