'use client';

import {
    LayoutGrid, Code2, Palette, Ruler, Calculator,
    Stethoscope, Megaphone, Plane, Scale, BookOpen,
    Cpu, ShieldCheck, Hammer, Car, Bike
} from 'lucide-react';

export const CATEGORIES = [
    { id: 'الكل', label: 'الكل', icon: LayoutGrid },
    { id: 'برمجة', label: 'برمجة', icon: Code2 },
    { id: 'تصميم', label: 'تصميم', icon: Palette },
    { id: 'هندسة', label: 'هندسة', icon: Ruler },
    { id: 'محاسبة', label: 'محاسبة', icon: Calculator },
    { id: 'طب', label: 'طب', icon: Stethoscope },
    { id: 'تسويق', label: 'تسويق', icon: Megaphone },
    { id: 'سياحة', label: 'سياحة', icon: Plane },
    { id: 'محاماة', label: 'محاماة', icon: Scale },
    { id: 'تعليم', label: 'تعليم', icon: BookOpen },
    { id: 'تقني', label: 'تقني', icon: Cpu },
    { id: 'أمن', label: 'أمن', icon: ShieldCheck },
    { id: 'حرفيين', label: 'حرفيين', icon: Hammer },
    { id: 'سائقين', label: 'سائقين', icon: Car },
    { id: 'دليفري', label: 'دليفري', icon: Bike },
];

// Helper for Dropdowns (excludes 'All')
export const CATEGORY_OPTIONS = CATEGORIES.filter(c => c.id !== 'الكل').map(c => c.label);

interface CategoryBarProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function CategoryBar({ selectedCategory, onSelectCategory }: CategoryBarProps) {
    return (
        <div className="w-full overflow-x-auto no-scrollbar pb-4 pt-2 mask-gradient-r" dir="rtl">
            <div className="flex gap-3 px-1 min-w-max">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.label;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.label)}
                            className={`
                                group flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 border
                                ${isActive
                                    ? 'bg-[#115d9a] text-white border-[#115d9a] shadow-lg shadow-blue-900/20 scale-105'
                                    : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md'
                                }
                            `}
                        >
                            <Icon
                                className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 text-gray-400 group-hover:text-[#115d9a]'}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={`text-sm font-bold whitespace-nowrap ${!isActive && 'group-hover:text-[#115d9a]'}`}>
                                {cat.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
