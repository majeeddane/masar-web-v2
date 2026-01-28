import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { MapPin, Calendar, Briefcase, ArrowLeft, ExternalLink, Building2, MessageCircle, Mail } from 'lucide-react';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

interface Job {
    id: string; // uuid
    title: string;
    description?: string;
    source_url?: string;
    created_at: string;
    company_name?: string;
    company_logo?: string;
    location?: string;
    city?: string;
    contact_info?: string;
    phone?: string;
    contact_phone?: string;
    email?: string;
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
    // 1. Fetch Data from 'jobs' table
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs:', error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
                <div className="text-red-500 font-bold text-lg">حدث خطأ في تحميل الوظائف. يرجى المحاولة لاحقاً.</div>
            </div>
        );
    }

    const getContactUrl = (job: Job) => {
        let phone = job.contact_phone || job.phone;
        let email = job.email;

        if (!phone && !email && job.contact_info) {
            try {
                const info = typeof job.contact_info === 'string' ? JSON.parse(job.contact_info) : job.contact_info;
                // @ts-ignore
                if (info?.phones && info.phones.length > 0) phone = info.phones[0];
                // @ts-ignore
                if (info?.emails && info.emails.length > 0) email = info.emails[0];
            } catch (e) { }
        }

        if (phone) {
            const cleanPhone = phone.replace(/[^\d+]/g, '');
            const message = encodeURIComponent(`مهتم بالوظيفة: ${job.title}`);
            return { url: `https://wa.me/${cleanPhone}?text=${message}`, type: 'whatsapp' };
        }
        if (email) return { url: `mailto:${email}`, type: 'email' };
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4">
                        📢 أحدث الوظائف الحكومية والشركات
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        تصفح أحدث الوظائف المتاحة في المملكة.
                    </p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs && jobs.length > 0 ? (
                        jobs.map((item: Job) => {
                            const contact = getContactUrl(item);
                            const companyName = item.company_name || 'جهة توظيف';

                            return (
                                <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 group">

                                    {/* Header with Circular Logo */}
                                    <div className="p-6 pb-0 flex items-start gap-4">
                                        {/* Logo or Placeholder */}
                                        <div className="shrink-0">
                                            {item.company_logo ? (
                                                <img
                                                    src={item.company_logo}
                                                    alt={companyName}
                                                    className="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm text-blue-600 font-bold text-xl">
                                                    {companyName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 pt-1">
                                            <h2 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                                                {item.title}
                                            </h2>
                                            <p className="text-gray-500 text-sm mt-1 truncate">{companyName}</p>
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="px-6 py-4 flex flex-wrap gap-3 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span>{item.city || item.location || 'السعودية'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>{formatDate(item.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Content Body */}
                                    <div className="px-6 pb-6 flex-1 flex flex-col">
                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                                            {item.description || "انقر لعرض تفاصيل الوظيفة."}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="mt-auto flex gap-3">
                                            {contact ? (
                                                <a
                                                    href={contact.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex-1 ${contact.type === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg`}
                                                >
                                                    {contact.type === 'whatsapp' ? <MessageCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                                                    <span>تواصل الآن</span>
                                                </a>
                                            ) : (
                                                <Link
                                                    href={`/news/${item.id}`} // Or update to jobs route
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                                                >
                                                    <span>التفاصيل</span>
                                                </Link>
                                            )}

                                            {item.source_url && (
                                                <a
                                                    href={item.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-3 rounded-xl transition-all"
                                                    title="المصدر الأصلي"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
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
