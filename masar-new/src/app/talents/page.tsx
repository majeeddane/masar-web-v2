import { MapPin, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata = {
    title: 'استكشاف الكفاءات | مسار',
    description: 'تصفح نخبة الكفاءات والخبرات في مختلف المجالات',
};

// Mock Data
const talents = [
    {
        id: 1,
        name: "زياد الخزاعي",
        role: "مهندس برمجيات",
        location: "الرياض، السعودية",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
        isOnline: true
    },
    {
        id: 2,
        name: "م/ ناصر سليمان",
        role: "مدير مشاريع",
        location: "جدة، السعودية",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
        isOnline: true
    },
    {
        id: 3,
        name: "محمود عبد الحافظ",
        role: "مصمم جرافيك",
        location: "الدمام، السعودية",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
        isOnline: true
    }
];

export default function TalentsPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 font-sans" dir="rtl">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-12 mb-8">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">استكشاف الكفاءات</h1>
                    <p className="text-gray-500">نخبة من المحترفين الجاهزين للعمل على مشاريعك</p>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {talents.map((talent) => (
                        <div key={talent.id} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-blue-100 group relative overflow-hidden">

                            {/* Decorative Background Blur */}
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50/50 to-transparent"></div>

                            <div className="relative z-10 flex flex-col items-center text-center">

                                {/* Avatar Wrapper */}
                                <div className="relative mb-4">
                                    <div className="w-24 h-24 rounded-full p-1 bg-white border border-gray-100 shadow-sm">
                                        <img
                                            src={talent.avatar}
                                            alt={talent.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    {talent.isOnline && (
                                        <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>

                                {/* Name & Verified */}
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-bold text-gray-900">{talent.name}</h3>
                                    <ShieldCheck className="w-5 h-5 text-green-500 fill-green-100" />
                                </div>

                                {/* Role */}
                                <p className="text-gray-500 font-medium mb-3">{talent.role}</p>

                                {/* Rating */}
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-gray-50 mb-6"></div>

                                {/* Location */}
                                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold mb-8">
                                    <MapPin className="w-4 h-4" />
                                    {talent.location}
                                </div>

                                {/* Button */}
                                <button className="w-full bg-[#0084db] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-blue-100 shadow-lg hover:shadow-xl group-hover:-translate-y-1">
                                    الملف الشخصي
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
