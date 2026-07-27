'use client';

import { useState } from 'react';
import { Search, MapPin, Trash2, Download, User, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function TalentsTable({ initialTalents }: { initialTalents: any[] }) {
    const [talents, setTalents] = useState(initialTalents);
    const [filter, setFilter] = useState('');

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الملف الشخصي؟ لا يمكن التراجع عن هذا الإجراء.')) return;

        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;

            setTalents(talents.filter(t => t.id !== id));
            alert('تم الحذف بنجاح');
        } catch (e: any) {
            alert('فشل الحذف: ' + e.message);
        }
    };

    const filteredTalents = talents.filter(t =>
        (t.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
        (t.job_title || '').toLowerCase().includes(filter.toLowerCase()) ||
        (t.email || '').toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="relative max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="بحث بالاسم، المسمى الوظيفي، أو البريد..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">الاسم</th>
                            <th className="px-6 py-4">المسمى الوظيفي</th>
                            <th className="px-6 py-4">الموقع</th>
                            <th className="px-6 py-4">التواصل</th>
                            <th className="px-6 py-4">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredTalents.map((talent) => (
                            <tr key={talent.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={talent.avatar_url || '/default-avatar.png'}
                                            alt={talent.full_name}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        />
                                        <div>
                                            <div className="font-bold text-gray-900">{talent.full_name}</div>
                                            {talent.cv_url && (
                                                <a href={talent.cv_url} target="_blank" className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                                                    <Download className="w-3 h-3" />
                                                    تحميل CV
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-700">{talent.job_title}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {talent.location}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div>{talent.email}</div>
                                    <div className="text-gray-400 text-xs" dir="ltr">{talent.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(talent.id)}
                                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                        title="حذف الملف"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredTalents.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    لا توجد نتائج مطابقة
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                إجمالي الكفاءات: {talents.length}
            </div>
        </div>
    );
}
