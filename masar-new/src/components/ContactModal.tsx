'use client';

import { useState } from 'react';
import { Lock, Mail, Phone, X, ShieldAlert } from 'lucide-react';

interface ContactModalProps {
    email: string;
    phone: string;
}

export default function ContactModal({ email, phone }: ContactModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#0084db] hover:bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
            >
                <Lock className="w-5 h-5" />
                <span>فتح الملف لعرض تفاصيل التواصل</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    {/* Modal */}
                    <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200 border border-white/20">

                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-1">بيانات التواصل</h3>
                            <p className="text-gray-500 text-sm">تم فتح بيانات التواصل بنجاح</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-right">
                                    <p className="text-xs text-gray-400 font-bold mb-0.5">البريد الإلكتروني</p>
                                    <p className="font-bold text-gray-800 font-mono text-sm sm:text-base select-all">{email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-right">
                                    <p className="text-xs text-gray-400 font-bold mb-0.5">رقم الجوال</p>
                                    <p className="font-bold text-gray-800 font-mono text-sm sm:text-base select-all" dir="ltr">{phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <div className="inline-flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-bold">
                                <ShieldAlert className="w-4 h-4" />
                                يرجى استخدام البيانات لغرض التوظيف فقط
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
