'use client';

import { useState } from 'react';
import { Download, User, Briefcase, GraduationCap, Award, FileText, Plus, Trash2, Mail, Phone, MapPin, Loader2, Wand2 } from 'lucide-react';

// Types for our CV Data
interface Experience {
    id: string;
    role: string;
    company: string;
    duration: string;
    description: string;
}

interface Education {
    id: string;
    degree: string;
    school: string;
    year: string;
}

export default function CVBuilderPage() {
    const [activeTab, setActiveTab] = useState('personal');
    const [isDownloading, setIsDownloading] = useState(false);

    // Initial State with Placeholder Data for Instant Gratification
    const [cvData, setCvData] = useState({
        fullName: 'محمد أحمد',
        jobTitle: 'مهندس برمجيات أول',
        email: 'mohammed@example.com',
        phone: '+966 50 123 4567',
        location: 'الرياض، المملكة العربية السعودية',
        summary: 'مهندس برمجيات شغوف ومبدع يتمتع بخبرة تزيد عن 5 سنوات في بناء تطبيقات ويب قابلة للتوسع. متخصص في React و Next.js مع اهتمام كبير بتجربة المستخدم والأداء.',
        experience: [
            {
                id: '1',
                role: 'مهندس واجهات أمامية أول',
                company: 'شركة التقنية المتقدمة',
                duration: '2021 - الآن',
                description: '• قيادة فريق مكون من 5 مطورين لبناء منصة الشركة الرئيسية.\n• تحسين أداء الموقع بنسبة 40% باستخدام تقنيات التحميل الحديثة.\n• تطبيق نظام تصميم موحد (Design System) لجميع منتجات الشركة.'
            },
            {
                id: '2',
                role: 'مطور ويب',
                company: 'استوديو الإبداع الرقمي',
                duration: '2019 - 2021',
                description: '• تطوير مواقع تفاعلية لعملاء في قطاعات متنوعة.\n• العمل بشكل وثيق مع المصممين لضمان دقة تنفيذ التصاميم.'
            }
        ] as Experience[],
        education: [
            {
                id: '1',
                degree: 'بكالوريوس علوم الحاسب',
                school: 'جامعة الملك سعود',
                year: '2019'
            }
        ] as Education[],
        skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Node.js', 'Git', 'UI/UX Design']
    });

    // Handlers
    const handleInputChange = (field: string, value: string) => {
        setCvData(prev => ({ ...prev, [field]: value }));
    };

    const addExperience = () => {
        setCvData(prev => ({
            ...prev,
            experience: [...prev.experience, { id: Date.now().toString(), role: '', company: '', duration: '', description: '' }]
        }));
    };

    const updateExperience = (id: string, field: keyof Experience, value: string) => {
        setCvData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
        }));
    };

    const removeExperience = (id: string) => {
        setCvData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
    };

    const addEducation = () => {
        setCvData(prev => ({
            ...prev,
            education: [...prev.education, { id: Date.now().toString(), degree: '', school: '', year: '' }]
        }));
    };

    const updateEducation = (id: string, field: keyof Education, value: string) => {
        setCvData(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
        }));
    };

    const removeEducation = (id: string) => {
        setCvData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
    };

    const handleSkillsChange = (value: string) => {
        setCvData(prev => ({ ...prev, skills: value.split(',').map(s => s.trim()) }));
    };

    // PDF DOWNLOAD FUNCTION
    const handleDownload = async () => {
        const element = document.getElementById('cv-preview');
        if (!element) return;

        setIsDownloading(true);
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const opt = {
                margin: 0,
                filename: `CV-${cvData.fullName.replace(/\s+/g, '-')}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('Download failed:', error);
            alert('حدث خطأ أثناء تحميل الملف. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsDownloading(false);
        }
    };


    const tabs = [
        { id: 'personal', label: 'المعلومات الشخصية', icon: User },
        { id: 'summary', label: 'النبذة المهنية', icon: FileText },
        { id: 'experience', label: 'الخبرات', icon: Briefcase },
        { id: 'education', label: 'التعليم', icon: GraduationCap },
        { id: 'skills', label: 'المهارات', icon: Award },
    ];

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-8 animate-fade-in-up">

            {/* LEFT SIDE: Editor Panel */}
            <div className="w-full lg:w-5/12 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden glass-panel">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-blue-950 flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-blue-600" />
                        محرر السيرة الذاتية
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">قم بتعبئة بياناتك وسنقوم بتنسيقها تلقائياً</p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex overflow-x-auto border-b border-slate-100 p-3 gap-2 hide-scrollbar bg-white">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Form Inputs Area */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

                    {/* Personal Info Tab */}
                    {activeTab === 'personal' && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="مثال: محمد أحمد"
                                        value={cvData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">المسمى الوظيفي</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="مثال: مهندس برمجيات"
                                        value={cvData.jobTitle}
                                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left"
                                        placeholder="name@example.com"
                                        dir="ltr"
                                        value={cvData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left"
                                            placeholder="+966 50 000 0000"
                                            dir="ltr"
                                            value={cvData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">الموقع</label>
                                    <div className="relative">
                                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 rtl:left-auto rtl:right-3" />
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="الرياض، السعودية"
                                            value={cvData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Tab */}
                    {activeTab === 'summary' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm mb-2">
                                💡 نصيحة: اكتب نبذة مختصرة وقوية (2-3 أسطر) تلخص خبرتك وأهدافك.
                            </div>
                            <textarea
                                rows={8}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all leading-relaxed"
                                value={cvData.summary}
                                onChange={(e) => handleInputChange('summary', e.target.value)}
                                placeholder="أنا مهندس برمجيات متخصص في..."
                            />
                        </div>
                    )}

                    {/* Experience Tab */}
                    {activeTab === 'experience' && (
                        <div className="space-y-6 animate-fade-in">
                            {cvData.experience.map((exp, index) => (
                                <div key={exp.id} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative group">
                                    <button
                                        onClick={() => removeExperience(exp.id)}
                                        className="absolute top-4 left-4 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all"
                                        title="حذف هذا العنصر"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500">المسمى الوظيفي</label>
                                            <input
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-all"
                                                value={exp.role}
                                                onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500">الشركة</label>
                                            <input
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-all"
                                                value={exp.company}
                                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4 space-y-1">
                                        <label className="text-xs font-bold text-slate-500">الفترة</label>
                                        <input
                                            placeholder="مثال: يناير 2020 - الآن"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-all"
                                            value={exp.duration}
                                            onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">الوصف والإنجازات</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-all resize-none"
                                            value={exp.description}
                                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addExperience}
                                className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-bold hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2 group"
                            >
                                <div className="p-1 bg-blue-100 rounded-full group-hover:scale-110 transition-transform"><Plus className="w-4 h-4" /></div>
                                <span>إضافة خبرة جديدة</span>
                            </button>
                        </div>
                    )}

                    {/* Education Tab */}
                    {activeTab === 'education' && (
                        <div className="space-y-6 animate-fade-in">
                            {cvData.education.map((edu) => (
                                <div key={edu.id} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative group">
                                    <button
                                        onClick={() => removeEducation(edu.id)}
                                        className="absolute top-4 left-4 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all"
                                        title="حذف هذا العنصر"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500">الدرجة / التخصص</label>
                                            <input
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-all"
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500">الجامعة</label>
                                            <input
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-all"
                                                value={edu.school}
                                                onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">سنة التخرج</label>
                                        <input
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-all"
                                            value={edu.year}
                                            onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={addEducation}
                                className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-bold hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2 group"
                            >
                                <div className="p-1 bg-blue-100 rounded-full group-hover:scale-110 transition-transform"><Plus className="w-4 h-4" /></div>
                                <span>إضافة مؤهل تعليمي</span>
                            </button>
                        </div>
                    )}

                    {/* Skills Tab */}
                    {activeTab === 'skills' && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                                اكتب مهاراتك وافصل بينها بفاصلة (،) أو (,)
                            </div>
                            <textarea
                                rows={5}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left font-mono text-sm"
                                dir="ltr"
                                value={cvData.skills.join(', ')}
                                onChange={(e) => handleSkillsChange(e.target.value)}
                                placeholder="React, Project Management, Team Leadership..."
                            />

                            {cvData.skills.length > 0 && cvData.skills[0] !== "" && (
                                <div className="flex flex-wrap gap-2 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    {cvData.skills.filter(s => s).map((skill, i) => (
                                        <span key={i} className="bg-white text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 text-sm font-bold shadow-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* RIGHT SIDE: Preview (Real-time A4) */}
            <div className="w-full lg:w-7/12 flex flex-col items-center bg-slate-100 rounded-3xl border border-slate-200/60 overflow-hidden relative shadow-inner">

                {/* Preview Toolbar */}
                <div className="w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between z-20 sticky top-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-slate-600">معاينة حية</span>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-2 bg-blue-900 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:bg-blue-800 hover:shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-70"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>جاري التصدير...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                <span>تصدير PDF</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Scrollable A4 Container */}
                <div className="flex-1 w-full overflow-y-auto p-8 flex justify-center scrollbar-thin scrollbar-thumb-slate-300">

                    {/* The A4 Sheet */}
                    <div
                        id="cv-preview"
                        className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[15mm] text-slate-900 relative"
                        style={{ fontFamily: 'var(--font-cairo), sans-serif' }}
                    >
                        {/* Elegant Header Background (Optional decoration) */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-900"></div>

                        {/* CV Header */}
                        <header className="border-b-2 border-slate-100 pb-8 mb-8 flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-black text-blue-950 mb-2 tracking-tight">{cvData.fullName || 'الاسم الكريم'}</h1>
                                <p className="text-xl text-blue-600 font-bold mb-6">{cvData.jobTitle || 'المسمى الوظيفي'}</p>

                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                                    {cvData.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-blue-400" />
                                            <span className="font-sans">{cvData.email}</span>
                                        </div>
                                    )}
                                    {cvData.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-blue-400" />
                                            <span dir="ltr" className="font-sans">{cvData.phone}</span>
                                        </div>
                                    )}
                                    {cvData.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-400" />
                                            <span>{cvData.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Optional: Initials Avatar or QRCode placeholder could go here */}
                            <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center font-black text-2xl border-4 border-white shadow-lg">
                                {cvData.fullName ? cvData.fullName.charAt(0) : '?'}
                            </div>
                        </header>

                        {/* Content Grid */}
                        <div className="space-y-8">

                            {/* Summary */}
                            {cvData.summary && (
                                <section>
                                    <h2 className="text-lg font-bold text-blue-950 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                        <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                                        النبذة المهنية
                                    </h2>
                                    <p className="text-slate-700 leading-relaxed text-justify opacity-90">
                                        {cvData.summary}
                                    </p>
                                </section>
                            )}

                            {/* Experience */}
                            {cvData.experience.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-bold text-blue-950 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                        <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                                        الخبرات العملية
                                    </h2>
                                    <div className="space-y-6">
                                        {cvData.experience.map(exp => (
                                            <div key={exp.id} className="relative pl-4 border-r-2 border-slate-100 pr-4 mr-1">
                                                {/* Timeline dot */}
                                                <div className="absolute top-1.5 -right-[9px] w-4 h-4 bg-white border-4 border-blue-200 rounded-full"></div>

                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className="text-lg font-bold text-slate-800">{exp.role}</h3>
                                                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded opacity-80 font-mono tracking-tighter">{exp.duration}</span>
                                                </div>
                                                <div className="text-base font-semibold text-slate-600 mb-2">{exp.company}</div>
                                                <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed opacity-90">
                                                    {exp.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <div className="grid grid-cols-12 gap-8">
                                {/* Education Column */}
                                <div className="col-span-7">
                                    {cvData.education.length > 0 && (
                                        <section>
                                            <h2 className="text-lg font-bold text-blue-950 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                                                التعليم
                                            </h2>
                                            <div className="space-y-4">
                                                {cvData.education.map(edu => (
                                                    <div key={edu.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                        <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                                                        <div className="text-sm text-slate-600 mt-1">{edu.school}</div>
                                                        <div className="text-xs font-bold text-blue-500 mt-2">{edu.year}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* Skills Column */}
                                <div className="col-span-5">
                                    {cvData.skills.length > 0 && cvData.skills[0] !== "" && (
                                        <section>
                                            <h2 className="text-lg font-bold text-blue-950 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                                                المهارات
                                            </h2>
                                            <div className="flex flex-wrap gap-2">
                                                {cvData.skills.filter(s => s).map((skill, index) => (
                                                    <span key={index} className="bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
