'use client'

import { useState } from 'react'
import { Trash2, ExternalLink, Calendar, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { deleteJob } from './actions'

interface Job {
    id: string
    title: string
    published: string
    status?: string // Optional status if available, fallback to 'Active'
    source_url?: string
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
                            <th className="py-4 px-6 font-bold text-gray-700">عنوان الوظيفة</th>
                            <th className="py-4 px-6 font-bold text-gray-700">تاريخ النشر</th>
                            <th className="py-4 px-6 font-bold text-gray-700">الحالة</th>
                            <th className="py-4 px-6 font-bold text-gray-700 text-left">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="font-bold text-gray-900">{job.title}</div>
                                    <div className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                        #{job.id.slice(0, 8)}
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span dir="ltr">
                                            {new Date(job.published).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        نشط
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center justify-end gap-3">
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
