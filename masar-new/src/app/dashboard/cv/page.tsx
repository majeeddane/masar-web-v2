
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Upload, FileText, Check, Cpu } from 'lucide-react';
import { CVPdfTemplate } from '@/components/cv/CVPdfTemplate';

export default function CVBuilderPage() {
    const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // State for PDF preview
    const [formData, setFormData] = useState({
        fullName: '',
        title: '',
        phone: '',
        summary: '',
        skills: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
            <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/dashboard/seeker" className="flex items-center gap-2 text-slate-500 hover:text-blue-700 font-bold transition-colors">
                        <ArrowRight className="w-5 h-5" />
                        <span>العودة للوحة التحكم</span>
                    </Link>
                    <span className="text-xl font-black text-blue-900">بناء السيرة الذاتية</span>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-10">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-slate-900 mb-3">حسّن فرص قبولك الوظيفي</h1>
                        <p className="text-slate-500 text-lg">قم برفع سيرتك الذاتية أو انشئ واحدة جديدة ليقوم الذكاء الاصطناعي بتحليلها ومطابقتها مع الوظائف.</p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white p-1 rounded-2xl border border-gray-200 inline-flex shadow-sm mb-8 w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Upload className="w-4 h-4" />
                            رفع ملف (PDF)
                        </button>
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'manual' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <FileText className="w-4 h-4" />
                            بناء يدوي
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8 md:p-12">

                        {activeTab === 'upload' && (
                            <div className="text-center py-10">
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                                        <h3 className="text-xl font-bold text-slate-800 animate-pulse">جاري تحليل السيرة الذاتية...</h3>
                                        <p className="text-slate-500 mt-2">يقوم الذكاء الاصطناعي باستخراج مهاراتك الآن</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                                            <Upload className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">رفع السيرة الذاتية</h3>
                                        <p className="text-slate-400 mb-8 max-w-md mx-auto">ارفع ملف PDF لنقوم استخراج المهارات والخبرات تلقائياً باستخدام AI.</p>

                                        <label className="block border-2 border-dashed border-gray-200 rounded-3xl p-10 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group relative">
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                accept=".pdf"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    setIsAnalyzing(true);
                                                    const formData = new FormData();
                                                    formData.append('file', file);

                                                    try {
                                                        const res = await fetch('/api/cv/upload', {
                                                            method: 'POST',
                                                            body: formData
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            alert('تم التحليل بنجاح! المهارات المستخرجة: ' + data.skills.join(', '));
                                                            window.location.href = '/dashboard/seeker';
                                                        } else {
                                                            alert('حدث خطأ: ' + data.error);
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('فشل الاتصال بالخادم');
                                                    } finally {
                                                        setIsAnalyzing(false);
                                                    }
                                                }}
                                            />
                                            <p className="text-slate-500 font-bold group-hover:text-blue-600">اضغط للرفع أو اسحب الملف هنا</p>
                                            <p className="text-xs text-slate-400 mt-2">PDF (Max 5MB)</p>
                                        </label>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'manual' && (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setIsAnalyzing(true);
                                const cvData = {
                                    fullName: formData.fullName,
                                    title: formData.title,
                                    skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                                    summary: formData.summary,
                                    phone: formData.phone
                                };

                                try {
                                    const res = await fetch('/api/cv/create', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(cvData)
                                    });
                                    if (res.ok) {
                                        if (confirm('تم حفظ السيرة الذاتية! هل تريد تحميل نسخة PDF؟')) {
                                            const html2pdf = (await import('html2pdf.js')).default;
                                            const element = document.getElementById('cv-pdf-template');
                                            const opt = {
                                                margin: 0,
                                                filename: `masar-cv-${cvData.fullName}.pdf`,
                                                image: { type: 'jpeg', quality: 0.98 },
                                                html2canvas: { scale: 2 },
                                                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                                            };
                                            await html2pdf().set(opt).from(element).save();
                                        }
                                        window.location.href = '/dashboard/seeker';
                                    } else {
                                        alert('حدث خطأ أثناء الحفظ');
                                    }
                                } catch (err) {
                                    alert('فشل الاتصال');
                                } finally {
                                    setIsAnalyzing(false);
                                }
                            }} className="space-y-6">
                                <div className="flex items-center gap-3 p-4 bg-purple-50 text-purple-800 rounded-2xl border border-purple-100">
                                    <Cpu className="w-6 h-6" />
                                    <div>
                                        <p className="font-bold text-sm">ميزة الذكاء الاصطناعي</p>
                                        <p className="text-xs opacity-80">سنقوم باقتراح المهارات وصياغة الملخص المهني لك.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                                        <input name="fullName" value={formData.fullName} onChange={handleInputChange} required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="مثال: أحمد محمد" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">المسمى الوظيفي</label>
                                        <input name="title" value={formData.title} onChange={handleInputChange} required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="مثال: مطور واجهات أمامية" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">رقم الجوال</label>
                                        <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="05xxxxxxxx" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                                        <input disabled value="سيتم استخدام بريدك المسجل" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">نبذة مهنية (Summary)</label>
                                        <textarea name="summary" value={formData.summary} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all h-24" placeholder="أنا خبير في..."></textarea>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">المهارات التقنية</label>
                                        <textarea name="skills" value={formData.skills} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all h-24" placeholder="React, Node.js, Photoshop..."></textarea>
                                        <p className="text-xs text-slate-400 mt-2">افصل بين المهارات بفاصلة</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button type="submit" disabled={isAnalyzing} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200/50 disabled:opacity-50">
                                        {isAnalyzing ? 'جاري الحفظ...' : 'حفظ ومتابعة'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Template for PDF Generation */}
            <div className="fixed top-0 left-[-9999px] invisible">
                <CVPdfTemplate data={{
                    fullName: formData.fullName || 'الأسم',
                    title: formData.title || 'المسمى الوظيفي',
                    phone: formData.phone,
                    summary: formData.summary,
                    skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
                }} />
            </div>
        </div>
    );
}
