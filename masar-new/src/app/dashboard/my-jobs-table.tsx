'use client'

import { useState } from 'react'
import { Trash2, ExternalLink, Calendar, AlertCircle, MessageCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import { deleteJob } from './actions'

interface Job {
    id: string
    title: string
    created_at: string
    status?: string // Optional status if available, fallback to 'Active'
    source_url?: string
    contact_info?: string | { phones: string[], emails: string[] } // Handle both JSON string or object
    phone?: string // Supporting explicit fields as requested
    contact_phone?: string
    email?: string
    company_name?: string
    company_logo?: string
}

export default function MyJobsTable({ jobs }: { jobs: Job[] }) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من رغبتك في حذف هذه الوظيفة؟')) return

        setIsDeleting(id)
        try {
            await deleteJob(id)
        } catch (error) {
            alert('حدث خطأ أثناء الحذف')
        } finally {
            setIsDeleting(null)
        }
    }

    const getContactMethod = (job: Job) => {
        let phone = job.contact_phone || job.phone;
        let email = job.email;

        // Try to parse contact_info if specific columns are empty
        if (!phone && !email && job.contact_info) {
            try {
                const info = typeof job.contact_info === 'string'
                    ? JSON.parse(job.contact_info)
                    : job.contact_info;

                if (info?.phones && info.phones.length > 0) phone = info.phones[0];
                if (info?.emails && info.emails.length > 0) email = info.emails[0];
            } catch (e) {
                // Ignore parse errors
            }
        }

        if (phone) {
            // Clean phone number for WhatsApp (remove spaces, ensure numeric)
            const cleanPhone = phone.replace(/[^\d+]/g, '');
            const message = encodeURIComponent(`مهتم بالوظيفة: ${job.title}`);
            return {
                type: 'whatsapp',
                url: `https://wa.me/${cleanPhone}?text=${message}`,
                label: 'تواصل الآن',
                icon: MessageCircle,
                color: 'bg-green-600 hover:bg-green-700 text-white'
            };
        }

        if (email) {
            return {
                type: 'email',
                url: `mailto:${email}`,
                label: 'تواصل بالإيميل',
                icon: Mail,
                color: 'bg-blue-600 hover:bg-blue-700 text-white'
            };
        }

        return null;
    };

    const getLogo = (job: Job) => {
        // Assuming job has a logo_url field or similar. 
        // If not, we use the placeholder.
        // We need to add company_name to the Job interface first.
        // For the sake of this task, I'll assume 'company_logo' might exist, or just use placeholder if missing.
        const logoUrl = job.company_logo;
        const companyName = job.company_name || 'Masar';

        if (logoUrl) {
            return (
                <img
                    src={logoUrl}
                    alt={companyName}
                    className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                />
            );
        }

        return (
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                <span className="text-blue-600 font-bold text-lg">
                    {companyName.charAt(0).toUpperCase()}
                </span>
            </div>
        );
    };

    if (jobs.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد وظائف معلنة</h3>
                <p className="text-gray-500 mb-6">لم تقم بإضافة أي وظائف حتى الآن.</p>
                <Link
                    href="/post/job"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                >
                    أضف وظيفة جديدة
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="py-4 px-6 font-bold text-gray-700">الوظيفة</th>
                            <th className="py-4 px-6 font-bold text-gray-700">تاريخ النشر</th>
                            <th className="py-4 px-6 font-bold text-gray-700">الحالة</th>
                            <th className="py-4 px-6 font-bold text-gray-700 text-left">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {jobs.map((job) => {
                            const contact = getContactMethod(job);

                            return (
                                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            {getLogo(job)}
                                            <div>
                                                <div className="font-bold text-gray-900">{job.title}</div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {job.company_name || 'شركة غير محددة'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span dir="ltr">
                                                {/* Fallback to Date.now if created_at is missing to prevent crash */}
                                                {new Date(job.created_at || Date.now()).toLocaleDateString('ar-SA')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'archived' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                            {job.status === 'archived' ? 'مؤرشف' : 'نشط'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end gap-3">

                                            {contact && (
                                                <a
                                                    href={contact.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md ${contact.color}`}
                                                >
                                                    <contact.icon className="w-3.5 h-3.5" />
                                                    {contact.label}
                                                </a>
                                            )}

                                            {job.source_url && (
                                                <a
                                                    href={job.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="عرض الوظيفة"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                disabled={isDeleting === job.id}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
