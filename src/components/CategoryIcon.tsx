'use client';

import {
    Code, Palette, Calculator, Utensils, TrendingUp,
    Stethoscope, HardHat, MoreHorizontal, LayoutGrid
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, any> = {
    'Code': Code,
    'Palette': Palette,
    'Calculator': Calculator,
    'Utensils': Utensils,
    'TrendingUp': TrendingUp,
    'Stethoscope': Stethoscope,
    'HardHat': HardHat,
    'MoreHorizontal': MoreHorizontal
};

export function CategoryIcon({ name, className }: { name?: string, className?: string }) {
    const Icon = CATEGORY_ICONS[name || 'MoreHorizontal'] || MoreHorizontal;
    return <Icon className={className} />;
}
