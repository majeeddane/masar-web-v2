import Link from 'next/link';
import { Home, MapPinOff } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans px-4 text-center" dir="rtl">
            <div>
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <MapPinOff className="h-10 w-10 text-[#115d9a]" />
                </div>

                <h1 className="text-6xl font-black text-[#115d9a] mb-4">404</h1>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">يبدو أنك ضللت المسار</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
                    الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها. لكن لا تقلق، يمكنك العودة واكتشاف مسارات جديدة.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-[#115d9a] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0d4b7e] transition-colors shadow-lg"
                >
                    <Home className="h-5 w-5" />
                    العودة للرئيسية
                </Link>
            </div>
        </div>
    );
}
