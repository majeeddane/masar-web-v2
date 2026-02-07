'use client';

import { Moon, Sun, Languages } from 'lucide-react';
import { useState } from 'react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    // In a real app this would use a context provider
    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
        alert('تم تفعيل الوضع الليلي (تجريبي)');
    };

    const toggleLang = () => {
        const current = document.dir;
        document.dir = current === 'rtl' ? 'ltr' : 'rtl';
        // Mock language switch for now
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
            <button
                onClick={toggleTheme}
                className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                title="تغيير المظهر"
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
                onClick={toggleLang}
                className="w-12 h-12 bg-white text-slate-900 border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                title="Google Translate (Mock)"
            >
                <Languages className="w-5 h-5" />
            </button>
        </div>
    );
}
