'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function QuickLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('Idle');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Logging in...');

        try {
            await supabase.auth.signOut();
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (data.session) {
                setStatus('Success! Redirecting...');
                window.location.href = '/dashboard';
            } else {
                setStatus('Success, but no session? Check email confirmation.');
            }
        } catch (err: any) {
            setStatus('Error: ' + err.message);
        }
    };

    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
            <h1>Quick Login (Emergency)</h1>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Email: </label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ padding: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ padding: '5px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Login</button>
            </form>
            <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
                Status: {status}
            </div>
            <hr />
            <a href="/dashboard">Go to Dashboard (Bypass Check)</a>
        </div>
    );
}
