import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#0f172a] text-gray-300 py-16 font-sans border-t border-white/5" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                {/* Brand Column */}
                <div>
                    <Link href="/" className="flex items-center gap-2 mb-6 group">
                        <span className="text-3xl font-black text-white tracking-tighter group-hover:text-[#115d9a] transition-colors">
                            مسار<span className="text-[#115d9a] group-hover:text-white transition-colors">.</span>
                        </span>
                    </Link>
                    <p className="text-sm leading-relaxed text-gray-400 mb-6">
                        منصة التوظيف السعودية الأولى التي تربط بين الكفاءات الوطنية وأفضل الفرص الوظيفية في المملكة، مدعومة برؤية 2030.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-[#115d9a] hover:text-white transition-colors"><Twitter className="h-4 w-4" /></a>
                        <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-[#115d9a] hover:text-white transition-colors"><Linkedin className="h-4 w-4" /></a>
                        <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-[#115d9a] hover:text-white transition-colors"><Instagram className="h-4 w-4" /></a>
                    </div>
                </div>

                {/* Company Links */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                        الشركة
                        <span className="h-1 w-8 bg-[#115d9a] rounded-full inline-block"></span>
                    </h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/" className="hover:text-white hover:translate-x-[-4px] transition-all inline-block">الرئيسية</Link></li>
                        <li><Link href="/about" className="hover:text-white hover:translate-x-[-4px] transition-all inline-block">عن مسار</Link></li>
                        <li><Link href="/news" className="hover:text-white hover:translate-x-[-4px] transition-all inline-block">مركز المعرفة (المدونة)</Link></li>
                        <li><Link href="/contact" className="hover:text-white hover:translate-x-[-4px] transition-all inline-block">اتصل بنا</Link></li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                        روابط سريعة
                        <span className="h-1 w-8 bg-[#115d9a] rounded-full inline-block"></span>
                    </h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/jobs" className="hover:text-white hover:translate-x-[-4px] transition-all inline-block">تصفح الوظائف</Link></li>
                        <li><Link href="/talents" className="hover:text-white hover:translate-x-[-4px] transition-all inline-block">استكشف الكفاءات</Link></li>
                        <li><Link href="/jobs/new" className="hover:text-white hover:translate-x-[-4px] transition-all inline-block">أعلن عن وظيفة</Link></li>
                        <li><Link href="/dashboard" className="hover:text-white hover:translate-x-[-4px] transition-all inline-block">لوحة التحكم</Link></li>
                    </ul>
                </div>

                {/* Contact & Legal */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                        تواصل معنا
                        <span className="h-1 w-8 bg-[#115d9a] rounded-full inline-block"></span>
                    </h3>
                    <ul className="space-y-4 text-sm mb-8">
                        <li className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-[#115d9a]" />
                            <span>support@masar.sa</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-[#115d9a]" />
                            <span>الرياض، المملكة العربية السعودية</span>
                        </li>
                    </ul>
                    <div className="pt-8 border-t border-gray-800 flex flex-col gap-2 text-xs text-gray-500">
                        <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">شروط الاستخدام</Link>
                    </div>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-600">
                <p>&copy; {new Date().getFullYear()} منصة مسار للتوظيف. جميع الحقوق محفوظة.</p>
            </div>
        </footer>
    );
}
