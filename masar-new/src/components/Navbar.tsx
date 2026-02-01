'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Briefcase,
    Clock,
    HandHelping,
    Building2,
    BookOpen,
    Globe,
    ChevronDown,
    Plus,
    Menu,
    X,
    UserPlus
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Note: useSearchParams requires wrapping in Suspense if used in Client Component, 
    // but Next.js 13+ App Router often handles this. 
    // SAFEST: Just use pathname for now to avoid hydration errors or verify query manually if needed.
    // For 'isActive', we can just use simple string matching if we had searchParams, but to keep it simple and robust:

    // Changing Add Job to /admin

    const navItems = [
        { name: 'الرئيسية', href: '/', icon: LayoutDashboard },
        { name: 'وظائف اليوم', href: '/?date=today', icon: Briefcase }, // Updated to Home with filter
        { name: 'وظائف الأمس', href: '/?date=yesterday', icon: Clock }, // Updated to Home with filter
        { name: 'المهتمين بالفرص الوظيفية', href: '/talents', icon: HandHelping },
        { name: 'الشركات وأصحاب العمل', href: '/dashboard/employer', icon: Building2 },
        { name: 'المدونة', href: '/blog', icon: BookOpen },
    ];

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path.includes('?')) return false; // Simple check, enhancing this involves useSearchParams which causes Suspense requirement.
        return pathname.startsWith(path) && path !== '/';
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 font-sans" dir="rtl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-200 shadow-lg group-hover:scale-105 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                </svg>
                            </div>
                            <span className="text-2xl font-black text-gray-900 tracking-tight">مسار</span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200
                                            ${isActive(item.href)
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" strokeWidth={1.5} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions & Mobile Toggle */}
                    <div className="flex items-center gap-4">

                        {/* Join Talent Button */}
                        <Link
                            href="/talents/join"
                            className="hidden sm:flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-5 py-3 rounded-xl font-bold transition-all border border-blue-100"
                        >
                            <UserPlus className="w-5 h-5" strokeWidth={1.5} />
                            <span>انضم ككفاءة</span>
                        </Link>

                        {/* Add Job Button */}
                        <Link
                            href="/admin"
                            className="hidden sm:flex items-center gap-2 text-white px-5 py-3 rounded-xl font-bold transition-transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                            style={{ backgroundColor: '#0084db' }}
                        >
                            <Plus className="w-5 h-5" strokeWidth={1.5} />
                            <span>أضف وظيفة الآن</span>
                        </Link>

                        {/* Language Selector */}
                        <button className="hidden sm:flex items-center gap-1 text-gray-500 hover:text-gray-900 font-bold text-sm px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                            <Globe className="w-5 h-5" strokeWidth={1.5} />
                            <span>العربية</span>
                            <ChevronDown className="w-3 h-3 mt-1" strokeWidth={1.5} />
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="lg:hidden border-t border-gray-100 bg-white absolute w-full left-0 shadow-lg">
                    <div className="p-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors
                                        ${isActive(item.href)
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                        <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                            <Link
                                href="/talents/join"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-5 py-3 rounded-xl font-bold w-full border border-blue-100"
                            >
                                <UserPlus className="w-5 h-5" strokeWidth={1.5} />
                                <span>انضم ككفاءة</span>
                            </Link>

                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 text-white px-5 py-3 rounded-xl font-bold w-full"
                                style={{ backgroundColor: '#0084db' }}
                            >
                                <Plus className="w-5 h-5" strokeWidth={1.5} />
                                <span>أضف وظيفة الآن</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
