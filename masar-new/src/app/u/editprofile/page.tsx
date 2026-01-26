'use client';

import { User, Mail, Phone, MapPin, Globe, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20" dir="rtl">
            {/* Simple Nav */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 mb-8">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="font-bold text-xl text-slate-800">تعديل الملف الشخصي</h1>
                    <Link href="/u" className="text-sm font-bold text-slate-500 hover:text-blue-600">إلغاء</Link>
                </div>
            </nav>

            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

                    <div className="p-8 border-b border-slate-100 flex items-center gap-6">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-300 relative group cursor-pointer overflow-hidden">
                            <User className="w-10 h-10 group-hover:opacity-50 transition-opacity" />
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white">تغيير</div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">الصورة الشخصية</h2>
                            <p className="text-slate-500 text-sm">صيغة JPG, GIF أو PNG. بحد أقصى 800KB</p>
                        </div>
                    </div>

                    <form className="p-8 space-y-8">

                        {/* Section 1: Basic Info */}
                        <section>
                            <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                البيانات الأساسية
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                                    <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" defaultValue="المستخدم" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">المسمى الوظيفي</label>
                                    <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" defaultValue="مطور برمجيات" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">نبذة عنك</label>
                                    <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="اكتب وصفاً مختصراً عن خبراتك..." />
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-100" />

                        {/* Section 2: Contact Info */}
                        <section>
                            <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                معلومات الاتصال
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                                    <input type="email" disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" defaultValue="user@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف</label>
                                    <input type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+966 5X XXX XXXX" dir="ltr" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">المدينة / الدولة</label>
                                    <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="الرياض، السعودية" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">رابط الموقع الشخصي / LinkedIn</label>
                                    <input type="url" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://" dir="ltr" />
                                </div>
                            </div>
                        </section>

                        <div className="pt-6">
                            <button type="button" className="w-full md:w-auto px-8 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 shadow-lg">
                                <Save className="w-5 h-5" />
                                حفظ التغييرات
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
