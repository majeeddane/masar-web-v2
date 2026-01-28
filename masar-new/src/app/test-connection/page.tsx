'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ConnectionTestPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        async function testConnection() {
            try {
                // Check if keys are present in env (though client side usage relies on build time injection usually, 
                // debugging purposes we might check if supabase client is initialized)

                const start = performance.now();
                // Try fetching 1 row from 'jobs'
                const { data, error } = await supabase.from('jobs').select('*').limit(1);
                const end = performance.now();

                if (error) {
                    throw error;
                }

                setStatus('success');
                setMessage(`Success! Connected to Supabase in ${(end - start).toFixed(2)}ms`);
                setDetails(data);

            } catch (err: any) {
                console.error('Connection test failed:', err);
                setStatus('error');
                setMessage(err.message || 'Unknown error occurred');
                setDetails(err);
            }
        }

        testConnection();
    }, []);

    return (
        <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center font-sans text-center" dir="ltr">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>

            {status === 'loading' && <div className="text-blue-600 animate-pulse text-xl">Connecting...</div>}

            {status === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl">
                    <strong className="block text-lg mb-2">✅ Connected Successfully</strong>
                    <p>{message}</p>
                    <div className="mt-4 text-left bg-white p-3 rounded shadow-sm text-xs font-mono overflow-auto max-w-lg">
                        <pre>{JSON.stringify(details, null, 2)}</pre>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl max-w-md">
                    <strong className="block text-lg mb-2">❌ Connection Failed</strong>
                    <p className="font-bold">{message}</p>
                    <p className="text-sm mt-2">Check your .env.local keys and internet connection.</p>
                    <div className="mt-4 text-left bg-white p-3 rounded shadow-sm text-xs font-mono overflow-auto max-w-lg">
                        <pre>{JSON.stringify(details, null, 2)}</pre>
                    </div>
                </div>
            )}

            <div className="mt-8 text-gray-500 text-sm">
                <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Defined ✅' : 'Missing ❌'}</p>
                <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Defined ✅' : 'Missing ❌'}</p>
            </div>
        </div>
    );
}
