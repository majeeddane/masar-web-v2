'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/auth/actions'; // استيراد الأكشن

export default function LogoutButton() {
    return (
        <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-bold text-sm w-full"
        >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
        </button>
    );
}
