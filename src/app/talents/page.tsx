'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
    Search, User, Briefcase, MessageCircle, ArrowRight, Loader2,
    MapPin, Award, ChevronDown, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import CategoryBar from '@/components/CategoryBar';
import { SAUDI_CITIES } from '@/lib/constants';

export default function TalentsPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [talents, setTalents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('الكل');
    const [selectedCity, setSelectedCity] = useState('الكل'); // Added City filter

    useEffect(() => {
        fetchTalents();
    }, []);

    const fetchTalents = async () => {
        setLoading(true);
        try {
            // Fetch profiles who have a job title (not null)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .not('job_title', 'is', null)
                .neq('job_title', '');

            if (error) throw error;
            setTalents(data || []);
        } catch (error) {
            console.error('Error fetching talents:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter talents: STRICTLY show only those looking for work
    const filteredTalents = talents.filter(talent => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            talent.full_name?.toLowerCase().includes(query) ||
            talent.job_title?.toLowerCase().includes(query) ||
            talent.bio?.toLowerCase().includes(query)
        );

        // STRICT FILTER: Only show active seekers
        const matchesActive = talent.is_looking_for_work === true;

        const matchesCategory = selectedCategory === 'الكل' || talent.category === selectedCategory;
        const matchesCity = selectedCity === 'الكل' || (talent.location && talent.location.includes(selectedCity));

        return matchesSearch && matchesActive && matchesCategory && matchesCity;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">

            {/* Header & Search Section */}
            <div className="bg-[#115d9a] pt-12 pb-32 px-4 text-center text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">منشورات الباحثين عن عمل</h1>
                    <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                        تصفح ملفات الكفاءات التي تبحث بنشاط عن فرص وظيفية جديدة وتواصل معهم فوراً
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* Search Input */}
                        <div className="relative flex-grow group">
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#115d9a] transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="ابحث بالاسم، المسمى الوظيفي، أو المهارات..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pr-12 pl-6 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-[#115d9a] outline-none transition-all text-gray-900"
                            />
                        </div>

                        {/* City Filter */}
                        <div className="relative w-full md:w-64 group">
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-10">
                                <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-[#115d9a] transition-colors" />
                            </div>
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full h-14 pr-12 pl-10 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-[#115d9a] outline-none transition-all text-gray-900 appearance-none font-bold cursor-pointer"
                            >
                                {SAUDI_CITIES.map((city) => (
                                    <option key={city} value={city}>{city === 'الكل' ? 'جميع المدن' : city}</option>
                                ))}
                            </select>
                            {/* Custom Arrow */}
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories & Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-16 relative z-20">

                <div className="bg-white rounded-3xl p-4 shadow-xl border border-gray-100 mb-10">
                    <CategoryBar
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center pt-20">
                        <Loader2 className="h-10 w-10 text-[#115d9a] animate-spin" />
                    </div>
                ) : (
                    <>
                        {filteredTalents.length > 0 && (
                            <div className="mb-6 text-gray-600 font-bold flex items-center gap-2 px-2">
                                <User className="h-5 w-5 text-[#115d9a]" />
                                <span>{filteredTalents.length} كفاءة متاحة</span>
                            </div>
                        )}

                        {filteredTalents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredTalents.map((talent) => (
                                    <div key={talent.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col relative group">

                                        {/* Status Badges - Always active here */}
                                        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
                                            <div className="bg-teal-50/90 backdrop-blur-sm text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-teal-100 flex items-center gap-1 shadow-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                                                متاح للعمل
                                            </div>
                                        </div>

                                        {/* Category Badge (Left) */}
                                        {talent.category && (
                                            <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-gray-500 text-[10px] px-2.5 py-1 rounded-full border border-gray-200 shadow-sm font-medium">
                                                {talent.category}
                                            </div>
                                        )}

                                        {/* Card Body */}
                                        <div className="p-6 flex flex-col items-center text-center flex-grow pt-12">
                                            <div className="w-24 h-24 rounded-full bg-gray-50 mb-5 overflow-hidden border-4 border-white shadow-md group-hover:shadow-lg transition-all relative">
                                                {talent.avatar_url ? (
                                                    <img src={talent.avatar_url} alt={talent.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
                                                        <User className="w-10 h-10 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-[#115d9a] transition-colors flex items-center gap-1">
                                                {talent.full_name || 'مستخدم بدون اسم'}
                                                {talent.is_verified && (
                                                    <ShieldCheck className="h-5 w-5 text-[#115d9a] fill-blue-50" />
                                                )}
                                            </h3>

                                            <div className="flex items-center gap-1.5 text-[#115d9a] text-sm font-semibold mb-4 bg-blue-50 px-3 py-1 rounded-lg">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                <span className="line-clamp-1">{talent.job_title}</span>
                                            </div>

                                            <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed w-full min-h-[4.5em]">
                                                {talent.bio || 'لا يوجد نبذة شخصية متاحة حالياً.'}
                                            </p>

                                            {/* Location Badge */}
                                            {talent.location && (
                                                <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                                                    <MapPin className="h-3 w-3" />
                                                    {talent.location}
                                                </div>
                                            )}

                                            {/* Skills Tags */}
                                            {talent.skills && typeof talent.skills === 'string' && (
                                                <div className="flex flex-wrap gap-1.5 justify-center mb-2">
                                                    {talent.skills.split(',').filter(Boolean).slice(0, 3).map((skill: string, idx: number) => (
                                                        <span key={idx} className="text-[10px] bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-200 font-medium">
                                                            {skill.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer (Actions) */}
                                        <div className="px-5 py-5 bg-gray-50/50 border-t border-gray-100 grid grid-cols-2 gap-3 mt-auto">
                                            <Link
                                                href={`/messages?user_id=${talent.id}`}
                                                className="flex items-center justify-center gap-2 bg-[#115d9a] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#0e4d82] hover:shadow-lg hover:shadow-blue-900/20 transition-all"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                تواصل
                                            </Link>
                                            <Link
                                                href={`/profile/${talent.id}`}
                                                className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                                            >
                                                <User className="h-4 w-4" />
                                                الملف
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm animate-in zoom-in-95 duration-300">
                                <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                                    <Search className="h-10 w-10 text-[#115d9a] opacity-60" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد نتائج مطابقة</h3>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                    {selectedCategory !== 'الكل' || selectedCity !== 'الكل'
                                        ? `لا يوجد كفاءات تطابق الفلاتر المختارة حالياً.`
                                        : 'جرب البحث بكلمات مختلفة.'}
                                </p>
                                <button
                                    onClick={() => { setSelectedCategory('الكل'); setSelectedCity('الكل'); setSearchQuery(''); }}
                                    className="text-[#115d9a] font-bold hover:underline bg-blue-50 px-6 py-3 rounded-xl transition-colors"
                                >
                                    إعادة تعيين الفلاتر
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}