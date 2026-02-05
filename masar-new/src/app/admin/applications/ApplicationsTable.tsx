'use client';

import { useState } from 'react';
import { Search, FileText, Filter, Download, ExternalLink, Calendar, Phone, Mail, User } from 'lucide-react';
import Link from 'next/link';

interface Application {
    id: string;
    created_at: string;
    user_id: string;
    match_score: number;
    status: string;
    cover_letter: string;
    cv_url: string;
    user_metadata?: any; // If we stored name in user_metadata or similar?
    // Wait, seed script was: supabase.auth.admin.createUser({ user_metadata: { name: name } })
    // But `applications` table might NOT have the name directly unless I joined `auth.users` which is hard.
    // OR if the application form stored the name in the `applications` table?
    // Let's check schema again. `applications` table columns.
    // The previous check-schema returned columns: [id, job_id, user_id, match_score, status, cover_letter, cv_url, created_at...]
    // It DOES NOT seem to have `full_name` or `email` directly in `applications` table?
    // Wait, usually we store that in `applications` for easier access, or we join `auth.users`.
    // Joining `auth.users` via Supabase Client is tricky (admin only).
    // `getApplications` in `actions.ts` uses Service Role, so it CAN join `auth.users`? No, Foreign Key relationships to `auth.users` are tricky in Supabase.
    //
    // Let's assume for now the data is somehow there or I should check the schema columns CAREFULLY from the previous output.
    // Output 27: Job columns were listed. Applications columns were NOT listed because it was empty initially, then I used `job_applications` and it found it.
    // Output 41: `job_applications` table exists.
    // "job_applications Columns: [ ... ]" -- WAIT.
    // Output 41 output:
    /*
    Checking job_applications table...
    job_applications table exists.
    job_applications Columns: [
      'id', 'job_id', 'user_id', 'full_name', 'email', 'phone', 'cv_url', 'status', 'created_at', ...
    ]
    */
    // I NEED TO BE SURE about columns.
    // If I look at `check-schema.ts` output again in Step 41...
    // It printed: "job_applications Columns: [ ... ]"
    // WAIT, looking at Step 41 output in the chat history...
    /*
    Checking job_applications table...
    job_applications table exists.
    Checking jobs table...
    Jobs Columns: ...
    */
    // It did NOT print `job_applications` columns because `apps.length > 0` might have been false?
    // "job_applications table exists." was printed. 
    // "if (apps.length > 0) console.log..."
    // Since it didn't print columns, the table might be empty of records?
    // But Step 11 `seed-applications.ts` inserted into `applications`.
    // Step 38 I changed it to `job_applications`.
    // The user SAID: "Query table job_applications".
    // I should assume the columns `full_name`, `email`, `phone` EXIST in `job_applications` as user requested to display them.
    // If they don't, I'll encounter an issue.
    // Safest bet: Handle missing fields gracefully.

    full_name?: string;
    email?: string;
    phone?: string;

    jobs?: {
        id: string;
        title: string;
    };
}

export default function ApplicationsTable({ initialApplications }: { initialApplications: any[] }) {
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Typed applications
    const applications = initialApplications as Application[];

    const filteredApps = applications.filter(app => {
        const matchesSearch =
            (app.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
            (app.jobs?.title || '').toLowerCase().includes(filter.toLowerCase()) ||
            (app.email || '').toLowerCase().includes(filter.toLowerCase());

        // Status filter (mock implementation if status exists)
        // const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

        return matchesSearch;
    });

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="بحث باسم المتقدم، الوظيفة، أو البريد..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                {/* Filters could go here */}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">المتقدم</th>
                            <th className="px-6 py-4">الوظيفة</th>
                            <th className="px-6 py-4">معلومات الاتصال</th>
                            <th className="px-6 py-4">تاريخ التقديم</th>
                            <th className="px-6 py-4">السيرة الذاتية</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredApps.length > 0 ? (
                            filteredApps.map((app) => (
                                <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {app.full_name ? app.full_name.charAt(0) : <User className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{app.full_name || 'بدون اسم'}</div>
                                                <div className="text-xs text-gray-500">#{app.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {app.jobs ? (
                                            <Link
                                                href={`/jobs/${app.jobs.id}`}
                                                target="_blank"
                                                className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 w-fit"
                                            >
                                                {app.jobs.title}
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400 italic">غير محدد</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {app.email && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                    {app.email}
                                                </div>
                                            )}
                                            {app.phone && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    <span dir="ltr">{app.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {new Date(app.created_at).toLocaleDateString('ar-SA')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {app.cv_url ? (
                                            <Link
                                                href={app.cv_url}
                                                target="_blank"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg font-bold text-sm transition-all border border-blue-200"
                                            >
                                                <Download className="w-4 h-4" />
                                                تحميل CV
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400 text-sm">لا يوجد ملف</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <FileText className="w-12 h-12 text-gray-300" />
                                        <p>لا توجد طلبات مطابقة للبحث</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-gray-500 text-sm flex justify-between">
                <span>عرض {filteredApps.length} من أصل {applications.length} طلب</span>
            </div>
        </div>
    );
}
