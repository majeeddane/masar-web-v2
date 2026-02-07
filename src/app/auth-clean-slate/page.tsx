'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCleanSlate() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<string>('');
    const [statusType, setStatusType] = useState<'info' | 'error' | 'success' | 'warning'>('info');

    const [isLogin, setIsLogin] = useState(false);

    const wipeData = () => {
        try {
            // Clear Storage
            localStorage.clear();
            sessionStorage.clear();

            // Attempt to clear cookies
            document.cookie.split(";").forEach((c) => {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            setStatus('✅ All Local Data (Storage & Cookies) Wiped Successfully!');
            setStatusType('success');

            // Force reload to apply changes
            setTimeout(() => window.location.reload(), 1000);
        } catch (e: any) {
            setStatus('Error wiping data: ' + e.message);
            setStatusType('error');
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(isLogin ? 'Logging in...' : 'Creating account...');
        setStatusType('info');

        try {
            let result;
            if (isLogin) {
                result = await supabase.auth.signInWithPassword({ email, password });
            } else {
                result = await supabase.auth.signUp({ email, password });
            }

            // Check specifically for "User already registered" error on Signup
            if (result.error && !isLogin && result.error.message.includes('User already registered')) {
                setStatus('⚠️ User already registered. Attempting auto-login...');
                setStatusType('warning');

                // Auto-Login attempt
                result = await supabase.auth.signInWithPassword({ email, password });

                if (result.error && result.error.message.includes('Invalid login credentials')) {
                    setStatus('⚠️ User already exists, but this PASSWORD is wrong.\n\n-> Switch to "Login" if you remember the old password.\n-> Or use Step 1.5 to DELETE this user and try again.');
                    setStatusType('error');
                    return; // Stop here
                }
            }

            if (result.error) throw result.error;

            const { data } = result;
            console.log('Auth Result:', data);

            if (data.user && !data.session) {
                setStatus('⚠️ ACCOUNT CREATED BUT BLOCKED!\n\nACTION REQUIRED: The "Confirm Email" setting is ON in Supabase.\n\n-> Go to Supabase Dashboard > Authentication > Providers > Email\n-> DISABLE "Confirm email"\n-> Or check your inbox to verify.');
                setStatusType('warning');
            } else if (data.session) {
                setStatus('✅ Success! Session active. Redirecting to Dashboard...');
                setStatusType('success');
                // Hard redirect as requested
                setTimeout(() => window.location.assign('/dashboard'), 1000);
            } else {
                setStatus('Strange State: No User and No Session returned.');
                setStatusType('error');
            }

        } catch (err: any) {
            setStatus('❌ Error: ' + err.message);
            setStatusType('error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans p-8 flex flex-col items-center justify-center" dir="ltr">
            <div className="max-w-2xl w-full space-y-8">

                {/* Header */}
                <div className="text-center border-b border-gray-700 pb-8">
                    <h1 className="text-4xl font-black text-red-500 mb-2">☢️ Nuclear Auth Reset ☢️</h1>
                    <p className="text-gray-400">Use this to completely wipe your local state and test a fresh signup.</p>
                </div>

                {/* Step 1: Wipe Data */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                        Wipe Local Data
                    </h2>
                    <p className="text-gray-400 mb-4 text-sm">
                        This will delete all LocalStorage, SessionStorage, and Cookies to ensure no old tokens are causing conflicts.
                    </p>
                    <button
                        onClick={wipeData}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
                    >
                        🗑️ WIPE EVERYTHING & RELOAD
                    </button>
                </div>

                {/* Step 2: Fresh Signup / Login */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                            {isLogin ? 'Test Login' : 'Test Clean Signup'}
                        </div>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
                        >
                            Switch to {isLogin ? 'Signup' : 'Login'}
                        </button>
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                placeholder={isLogin ? "existing@example.com" : "test@clean.com"}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                placeholder="password123"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-3 rounded-lg font-bold transition-colors ${isLogin ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isLogin ? '🔑 Login Now' : '🚀 Create New Account'}
                        </button>
                    </form>
                </div>

                {/* Status Box */}
                {status && (
                    <div className={`p-6 rounded-xl border-2 whitespace-pre-wrap font-mono text-sm
                        ${statusType === 'error' ? 'bg-red-900/50 border-red-500 text-red-200' : ''}
                        ${statusType === 'success' ? 'bg-green-900/50 border-green-500 text-green-200' : ''}
                        ${statusType === 'warning' ? 'bg-yellow-900/50 border-yellow-500 text-yellow-200 font-bold text-lg' : ''}
                        ${statusType === 'info' ? 'bg-blue-900/50 border-blue-500 text-blue-200' : ''}
                    `}>
                        {status}
                    </div>
                )}

                {/* Links */}
                <div className="flex gap-4 justify-center pt-8">
                    <a href="/dashboard" className="text-gray-400 hover:text-white underline">
                        Go to Dashboard (Bypassed)
                    </a>
                    <span className="text-gray-600">|</span>
                    <a href="/login" className="text-gray-400 hover:text-white underline">
                        Back to Normal Login
                    </a>
                </div>

            </div>
        </div>
    );
}
