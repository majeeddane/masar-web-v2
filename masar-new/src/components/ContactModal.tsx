"use client";
import React, { useState } from 'react';
import { Mail, Phone, X, Lock } from 'lucide-react';

interface ContactModalProps {
    email: string;
    phone: string;
    talentName: string; // تم إضافة هذا السطر لحل مشكلة TypeScript
}

export default function ContactModal({ email, phone, talentName }: ContactModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-[#0084db] text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 w-full md:w-auto"
            >
                <Lock className="w-5 h-5" />
                فتح الملف لعرض تفاصيل التواصل
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsOpen(false)} />
                    <div className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200" dir="rtl">
                        <button onClick={() => setIsOpen(false)} className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                        <h3 className="text-2xl font-black text-gray-900 mb-6">بيانات التواصل: {talentName}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <Mail className="w-6 h-6 text-blue-500" />
                                <span className="font-bold text-gray-700">{email}</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <Phone className="w-6 h-6 text-green-500" />
                                <span className="font-bold text-gray-700">{phone}</span>
                            </div>
                        </div>
                        <p className="mt-6 text-sm text-gray-400 text-center font-bold">يرجى استخدام هذه البيانات لأغراض التوظيف فقط.</p>
                    </div>
                </div>
            )}
        </>
    );
}