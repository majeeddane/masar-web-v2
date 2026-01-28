'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminFixPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Default to user, though Supabase might handle roles differently
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            setMessage(`✅ User created! ID: ${data.user?.id}. Check your email for confirmation if required, or try logging in.`);
        } catch (err: any) {
            setMessage(`❌ Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-gray-100 text-gray-800 font-sans" dir="ltr">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">Admin User Creator</h1>

                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="newadmin@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="password123"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-6 p-4 rounded ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}
            </div>
            <p className="mt-8 text-sm text-gray-500">Use this to create a fresh account if login is stuck.</p>
        </div>
    );
}
