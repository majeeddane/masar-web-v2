import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { MapPin, Calendar, Briefcase, ArrowLeft, ExternalLink } from 'lucide-react';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

interface NewsItem {
    id: number;
    title: string;
    description?: string;
    source_url: string;
    published: string;
    image_url?: string;
    location?: string;
}

// Format date to local Arabic format
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        return dateString;
    }
};

export default async function NewsPage() {
    // 1. Fetch Data
    const { data: news, error } = await supabase
        .from('news')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Error fetching news:', error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
                <div className="text-red-500 font-bold text-lg">حدث خطأ في تحميل الوظائف. يرجى المحاولة لاحقاً.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4">
                        📢 أحدث الوظائف الحكومية والشركات
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        تصفح أحدث الفرص الوظيفية التي تم تجميعها تلقائياً من مختلف المصادر الموثوقة في المملكة.
                    </p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news && news.length > 0 ? (
                        news.map((item: NewsItem) => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 group">

                                {/* Image Header */}
                                <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-400">
                                            <Briefcase className="w-12 h-12 opacity-20" />
                                        </div>
                                    )}

                                    {/* Location Badge */}
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                                        <span>{item.location || 'المملكة العربية السعودية'}</span>
                                    </div>

                                    {/* Date Badge (overlay bottom left) */}
                                    <div className="absolute bottom-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-tl-xl text-xs font-medium flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{formatDate(item.published)}</span>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                                        {item.title}
                                    </h2>

                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                                        {item.description || "لا يوجد وصف مختصر لهذه الوظيفة. يرجى زيارة الرابط للاطلاع على كافة التفاصيل."}
                                    </p>

                                    {/* Action Button */}
                                    <Link
                                        href={`/news/${item.id}`}
                                        className="w-full mt-auto bg-gray-50 hover:bg-blue-600 hover:text-white text-blue-600 font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover/btn"
                                    >
                                        <span>عرض التفاصيل</span>
                                        <ArrowLeft className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <div className="bg-white p-10 rounded-3xl shadow-sm inline-block max-w-md mx-auto">
                                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد وظائف حالياً</h3>
                                <p className="text-gray-500">جاري البحث عن وظائف جديدة، يرجى العودة قريباً.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
