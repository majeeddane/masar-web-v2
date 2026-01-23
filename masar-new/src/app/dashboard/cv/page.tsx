'use client';

import { useState } from 'react';
import { Download, User, Briefcase, GraduationCap, Award, FileText, Plus, Trash2, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

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

    // Initial State
    const [cvData, setCvData] = useState({
        fullName: 'محمد أحمد',
        jobTitle: 'مهندس برمجيات',
        email: 'mohammed@example.com',
        phone: '+966 50 000 0000',
        location: 'الرياض، المملكة العربية السعودية',
        summary: 'مهندس برمجيات شغوف يتمتع بخبرة تزيد عن 5 سنوات في تطوير تطبيقات الويب باستخدام أحدث التقنيات. أبحث دائمًا عن تحديات جديدة تساهم في صقل مهاراتي.',
        experience: [
            {
                id: '1',
                role: 'مطوّر واجهة أمامية',
                company: 'شركة التقنية المتقدمة',
                duration: '2021 - الآن',
                description: 'تطوير وصيانة واجهات المستخدم لتطبيقات الشركة الرئيسية باستخدام React و Tailwind CSS.'
            }
        ] as Experience[],
        education: [
            {
                id: '1',
                degree: 'بكالوريوس علوم الحاسب',
                school: 'جامعة الملك سعود',
                year: '2020'
            }
        ] as Education[],
        skills: ['JavaScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'Git']
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
            // Dynamic import to avoid SSR issues
            const html2pdf = (await import('html2pdf.js')).default;

            const opt = {
                margin: 0,
                filename: 'My-CV.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
        <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">

            {/* LEFT SIDE: Editor */}
            <div className="w-full lg:w-1/2 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs Header */}
                <div className="flex overflow-x-auto border-b border-slate-100 p-2 gap-2 hide-scrollbar">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'bg-blue-900 text-white shadow-md'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">

                    {/* Personal Info Tab */}
                    {activeTab === 'personal' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">الاسم الكامل</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={cvData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label">المسمى الوظيفي</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={cvData.jobTitle}
                                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    className="input-field text-left"
                                    dir="ltr"
                                    value={cvData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">رقم الهاتف</label>
                                    <input
                                        type="text"
                                        className="input-field text-left"
                                        dir="ltr"
                                        value={cvData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label">الموقع / المدينة</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={cvData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Tab */}
                    {activeTab === 'summary' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <label className="label">نبذة مختصرة عنك</label>
                            <textarea
                                rows={6}
                                className="input-field text-right"
                                value={cvData.summary}
                                onChange={(e) => handleInputChange('summary', e.target.value)}
                                placeholder="اكتب نبذة مختصرة تبرز مهاراتك وخبراتك..."
                            />
                        </div>
                    )}

                    {/* Experience Tab */}
                    {activeTab === 'experience' && (
                        <div className="space-y-6 animate-fade-in-up">
                            {cvData.experience.map((exp, index) => (
                                <div key={exp.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                                    <button
                                        onClick={() => removeExperience(exp.id)}
                                        className="absolute top-2 left-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <input
                                            placeholder="المسمى الوظيفي"
                                            className="input-field bg-white"
                                            value={exp.role}
                                            onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                                        />
                                        <input
                                            placeholder="اسم الشركة"
                                            className="input-field bg-white"
                                            value={exp.company}
                                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            placeholder="الفترة (مثال: 2020 - 2022)"
                                            className="input-field bg-white"
                                            value={exp.duration}
                                            onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                                        />
                                    </div>
                                    <textarea
                                        placeholder="وصف المهام والإنجازات..."
                                        rows={3}
                                        className="input-field bg-white"
                                        value={exp.description}
                                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                    />
                                </div>
                            ))}
                            <button onClick={addExperience} className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5" />
                                <span>إضافة خبرة جديدة</span>
                            </button>
                        </div>
                    )}

                    {/* Education Tab */}
                    {activeTab === 'education' && (
                        <div className="space-y-6 animate-fade-in-up">
                            {cvData.education.map((edu) => (
                                <div key={edu.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                                    <button
                                        onClick={() => removeEducation(edu.id)}
                                        className="absolute top-2 left-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <input
                                            placeholder="الدرجة العلمية / التخصص"
                                            className="input-field bg-white"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                        />
                                        <input
                                            placeholder="الجامعة / الجهة التعليمية"
                                            className="input-field bg-white"
                                            value={edu.school}
                                            onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                        />
                                    </div>
                                    <input
                                        placeholder="سنة التخرج"
                                        className="input-field bg-white"
                                        value={edu.year}
                                        onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                                    />
                                </div>
                            ))}
                            <button onClick={addEducation} className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5" />
                                <span>إضافة مؤهل تعليمي</span>
                            </button>
                        </div>
                    )}

                    {/* Skills Tab */}
                    {activeTab === 'skills' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <label className="label">المهارات (افصل بينها بفاصلة)</label>
                            <textarea
                                rows={4}
                                className="input-field"
                                dir="ltr"
                                value={cvData.skills.join(', ')}
                                onChange={(e) => handleSkillsChange(e.target.value)}
                                placeholder="React, Leadership, Communication..."
                            />
                            <div className="flex flex-wrap gap-2 mt-4">
                                {cvData.skills.filter(s => s).map((skill, i) => (
                                    <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* RIGHT SIDE: Preview (A4 Paper) */}
            <div className="w-full lg:w-1/2 bg-slate-200/50 rounded-2xl flex flex-col overflow-hidden relative">
                {/* Toolbar */}
                <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-sm z-10">
                    <h3 className="font-bold text-slate-700">معاينة مباشرة</h3>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-2 bg-blue-900 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>جاري التحميل...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                <span>تحميل PDF</span>
                            </>
                        )}
                    </button>
                </div>

                {/* A4 Paper Scroll Area */}
                <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100">
                    {/* The A4 Page */}
                    <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-10 text-slate-900 origin-top text-sm leading-relaxed" id="cv-preview">

                        {/* CV Header */}
                        <div className="border-b-2 border-slate-900 pb-6 mb-6">
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">{cvData.fullName || 'الاسم الكريم'}</h1>
                            <p className="text-xl text-slate-600 font-medium mb-4">{cvData.jobTitle || 'المسمى الوظيفي'}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                {cvData.email && (
                                    <div className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        <span>{cvData.email}</span>
                                    </div>
                                )}
                                {cvData.phone && (
                                    <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        <span dir="ltr">{cvData.phone}</span>
                                    </div>
                                )}
                                {cvData.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{cvData.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        {cvData.summary && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold border-b border-slate-200 pb-1 mb-3 text-blue-900">النبذة المهنية</h2>
                                <p className="text-slate-700 text-justify">{cvData.summary}</p>
                            </div>
                        )}

                        {/* Experience */}
                        {cvData.experience.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold border-b border-slate-200 pb-1 mb-3 text-blue-900">الخبرات العملية</h2>
                                <div className="space-y-4">
                                    {cvData.experience.map(exp => (
                                        <div key={exp.id}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-bold text-slate-800">{exp.role}</h3>
                                                <span className="text-xs text-slate-500 font-mono">{exp.duration}</span>
                                            </div>
                                            <div className="text-sm font-semibold text-slate-600 mb-1">{exp.company}</div>
                                            <p className="text-slate-600 text-xs whitespace-pre-line">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {cvData.education.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold border-b border-slate-200 pb-1 mb-3 text-blue-900">التعليم</h2>
                                <div className="space-y-3">
                                    {cvData.education.map(edu => (
                                        <div key={edu.id} className="flex justify-between items-baseline">
                                            <div>
                                                <h3 className="font-bold text-slate-800">{edu.degree}</h3>
                                                <div className="text-sm text-slate-600">{edu.school}</div>
                                            </div>
                                            <span className="text-xs text-slate-500 font-mono">{edu.year}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {cvData.skills.length > 0 && cvData.skills[0] !== "" && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold border-b border-slate-200 pb-1 mb-3 text-blue-900">المهارات</h2>
                                <div className="flex flex-wrap gap-2">
                                    {cvData.skills.filter(s => s).map((skill, index) => (
                                        <span key={index} className="bg-slate-100 px-3 py-1 rounded text-xs font-semibold text-slate-700">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
