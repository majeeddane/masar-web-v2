'use client';

import { X, Phone, Mail, MessageCircle, AlertCircle } from 'lucide-react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    phone?: string;
    email?: string;
    onChatClick?: () => void; // For future phase
}

export default function ContactModal({ isOpen, onClose, phone, email, onChatClick }: ContactModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-black text-gray-900">بيانات التواصل</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    {!phone && !email && (
                        <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>لم يقم المعلن بإضافة بيانات تواصل مباشرة.</p>
                        </div>
                    )}

                    {phone && (
                        <a href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 transition-all group">
                            <div className="bg-green-500 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-green-600 font-bold mb-0.5">تواصل عبر واتساب</p>
                                <p className="text-lg font-black text-gray-900" dir="ltr">{phone}</p>
                            </div>
                        </a>
                    )}

                    {phone && (
                        <a href={`tel:${phone}`} className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all group">
                            <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600 font-bold mb-0.5">اتصال هاتفي</p>
                                <p className="text-lg font-black text-gray-900" dir="ltr">{phone}</p>
                            </div>
                        </a>
                    )}

                    {email && (
                        <a href={`mailto:${email}`} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all group">
                            <div className="bg-gray-700 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-0.5">البريد الإلكتروني</p>
                                <p className="text-base font-bold text-gray-900 break-all">{email}</p>
                            </div>
                        </a>
                    )}

                    {/* Phase 2: Internal Chat */}
                    {onChatClick && (
                        <button onClick={onChatClick} className="w-full flex items-center justify-center gap-2 bg-[#0084db] text-white py-4 rounded-xl font-black mt-4 hover:shadow-lg transition-all">
                            <MessageCircle className="w-5 h-5" />
                            محادثة داخلية (قريباً)
                        </button>
                    )}
                </div>
                {/* Stub for now - or actual link if requested?
                        User said: "For now you can stub it: route to /messages?to=<owner_user_id>&job=<job_id>"
                        So I should probably make it a Link or handle navigation in onChatClick?
                        The modal receives `onChatClick`. I'll let the parent handle the routing or implementation.
                    */}

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">يرجى ذكر "منصة مسار" عند التواصل مع المعلن.</p>
                </div>
            </div>
        </div>
    );
}