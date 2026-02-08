'use client';
import { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Contact Form Data:', formData);
        setSuccess(true);
        setLoading(false);
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });

        // Hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900" dir="rtl">

            {/* Header */}
            <div className="bg-[#115d9a] text-white py-16 text-center">
                <h1 className="text-4xl font-black mb-2">اتصل بنا</h1>
                <p className="text-blue-100 text-lg">نحن هنا للإجابة على استفساراتك ومساعدتك.</p>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12 -mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Contact Info (Left Sidebar) */}
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 lg:col-span-1 h-fit">
                        <h3 className="text-xl font-bold mb-6">معلومات التواصل</h3>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-[#115d9a] rounded-xl shrink-0">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">البريد الإلكتروني</p>
                                    <p className="text-gray-500 text-sm mt-1">support@masar.sa</p>
                                    <p className="text-gray-500 text-sm">sales@masar.sa</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-[#115d9a] rounded-xl shrink-0">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">الموقع</p>
                                    <p className="text-gray-500 text-sm mt-1">شارع التحلية، الرياض</p>
                                    <p className="text-gray-500 text-sm">المملكة العربية السعودية</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-[#115d9a] rounded-xl shrink-0">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">الهاتف</p>
                                    <p className="text-gray-500 text-sm mt-1">+966 11 123 4567</p>
                                    <p className="text-xs text-gray-400 mt-1">(أوقات العمل: 9 ص - 5 م)</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100 lg:col-span-2 relative overflow-hidden">
                        {success && (
                            <div className="absolute top-0 left-0 w-full h-full bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">تم الإرسال بنجاح!</h3>
                                <p className="text-gray-500 max-w-md">شكراً لتواصلك معنا. استلمنا رسالتك وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن.</p>
                                <button onClick={() => setSuccess(false)} className="mt-8 text-[#115d9a] font-bold hover:underline">
                                    إرسال رسالة أخرى
                                </button>
                            </div>
                        )}

                        <h3 className="text-2xl font-black mb-6">أرسل لنا رسالة</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#115d9a] focus:ring-1 focus:ring-[#115d9a] outline-none transition-all"
                                        placeholder="محمد عبدالله"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#115d9a] focus:ring-1 focus:ring-[#115d9a] outline-none transition-all"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">الموضوع</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#115d9a] focus:ring-1 focus:ring-[#115d9a] outline-none transition-all"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option value="General Inquiry">استفسار عام</option>
                                    <option value="Support">دعم فني</option>
                                    <option value="Partnership">شراكة أعمال</option>
                                    <option value="Feedback">اقتراحات</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">الرسالة</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#115d9a] focus:ring-1 focus:ring-[#115d9a] outline-none transition-all resize-none"
                                    placeholder="كيف يمكننا مساعدتك؟"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#115d9a] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0d4b7e] transition-colors shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                إرسال الرسالة
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
