'use client';

import { useState } from 'react';
import { Mail, Phone, Lock } from 'lucide-react';

export default function ContactSection({ email, phone }: { email: string, phone: string }) {
    const [isOpen, setIsOpen] = useState(false);

    if (isOpen) {
        return (
            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <Mail className="w-5 h-5 text-[#0084db]" />
                    <span className="font-bold text-gray-700">{email || 'لا يوجد بريد'}</span>
                </div>
                <div className="flex items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-100">
                    <Phone className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-gray-700" dir="ltr">{phone || 'لا يوجد رقم'}</span>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsOpen(true)}
            className="mt-8 bg-[#0084db] text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all flex items-center gap-2 mx-auto md:mx-0 shadow-lg shadow-blue-100"
        >
            <Lock className="w-5 h-5" />
            فتح الملف لعرض تفاصيل التواصل
        </button>
    );
}
