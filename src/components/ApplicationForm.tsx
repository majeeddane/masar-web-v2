'use client';

import { useState } from 'react';
import { Upload, CheckCircle, Loader2, Send } from 'lucide-react';
import { submitApplication } from '@/lib/applicationActions';

export default function ApplicationForm({ jobId }: { jobId: string }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        formData.append('jobId', jobId);

        try {
            const result = await submitApplication(formData);
            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.message || 'حدث خطأ أثناء الإرسال');
            }
        } catch (err) {
            setError('حدث خطأ غير متوقع. حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    if (success) {
        return (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك بنجاح!</h3>
                <p className="text-gray-600">شكراً لاهتمامك بالانضمام إلينا. سنقوم بمراجعة طلبك والتواصل معك قريباً.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl" id="application-form">
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">تقدم لهذه الوظيفة</h3>
                <p className="text-gray-500">أكمل النموذج أدناه لتقديم طلبك. الحقول المطلوبة مشار إليها بـ *</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full block"></span>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل *</label>
                    <input
                        name="name"
                        required
                        type="text"
                        placeholder="الاسم الثلاثي"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:bg-blue-50 outline-none transition-all font-medium"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني *</label>
                        <input
                            name="email"
                            required
                            type="email"
                            placeholder="example@mail.com"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:bg-blue-50 outline-none transition-all font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">رقم الجوال</label>
                        <input
                            name="phone"
                            type="tel"
                            placeholder="05xxxxxxxx"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:bg-blue-50 outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">السيرة الذاتية (CV) *</label>
                    <div className="relative group cursor-pointer">
                        <input
                            name="cv"
                            required
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center group-hover:border-blue-400 group-hover:bg-blue-50 transition-all">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                            <p className="font-bold text-gray-700 group-hover:text-blue-700 transition-colors">
                                {fileName ? fileName : 'اضغط لرفع ملف السيرة الذاتية'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">PDF, DOCX (Max 5MB)</p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0084db] hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري الإرسال...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            إرسال الطلب
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
