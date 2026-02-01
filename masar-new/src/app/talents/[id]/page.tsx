import {
    MapPin,
    ShieldCheck,
    Star,
    Briefcase,
    GraduationCap,
    Award,
    Globe,
    Lock,
    CheckCircle2,
    Mail,
    Phone
} from 'lucide-react';
import Link from 'next/link';
import ContactModal from '@/components/ContactModal';

export const dynamic = 'force-dynamic';

// Extended Mock Data
{
    id: 1,
        name: "زياد الخزاعي",
            role: "مهندس برمجيات",
                location: "الرياض، السعودية",
                    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
                        about: "مطور برمجيات شغوف لدي خبرة تزيد عن 5 سنوات في بناء تطبيقات الويب الحديثة. أتقن استخدام React و Next.js وأسعى دائماً لتقديم أفضل تجربة مستخدم.",
                            education: [
                                { degree: "بكالوريوس علوم الحاسب", university: "جامعة الملك سعود", year: "2018 - 2022" }
                            ],
                                experience: [
                                    { role: "مطور واجهات أمامية", company: "شركة تحكم التقنية", period: "2022 - الآن" },
                                    { role: "متدرب تطوير ويب", company: "مسك الخيرية", period: "2021" }
                                ],
                                    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"],
                                        stats: {
        completedProfile: 95,
            responseRate: "100%",
                quality: "ممتاز"
    },
    email: "ziad@masar.sa",
        phone: "+966 50 123 4567"
},
{
    id: 2,
        name: "م/ ناصر سليمان",
            role: "مدير مشاريع",
                location: "جدة، السعودية",
                    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop",
                        about: "مدير مشاريع معتمد (PMP) بخبرة واسعة في إدارة المشاريع التقنية والتحول الرقمي. ملتزم بتسليم المشاريع في الوقت المحدد وضمن الميزانية.",
                            education: [
                                { degree: "ماجستير إدارة أعمال", university: "جامعة الملك عبدالعزيز", year: "2019 - 2021" }
                            ],
                                experience: [
                                    { role: "مدير أول مشاريع", company: "الشركة الوطنية", period: "2020 - الآن" }
                                ],
                                    skills: ["PMP", "Agile", "Scrum", "JIRA", "Leadership", "Risk Management"],
                                        stats: {
        completedProfile: 88,
            responseRate: "90%",
                quality: "ممتاز"
    },
    email: "nasser@masar.sa",
        phone: "+966 54 987 6543"
},
{
    id: 3,
        name: "محمود عبد الحافظ",
            role: "مصمم جرافيك",
                location: "الدمام، السعودية",
                    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400&auto=format&fit=crop",
                        about: "مصمم مبدع متخصص في تصميم الهويات البصرية وواجهات المستخدم. أؤمن بأن التصميم هو الجسر بين التكنولوجيا والمستخدم.",
                            education: [
                                { degree: "دبلوم تصميم جرافيك", university: "المعهد التقني", year: "2020" }
                            ],
                                experience: [
                                    { role: "مصمم أول", company: "وكالة إبداع", period: "2021 - الآن" }
                                ],
                                    skills: ["Photoshop", "Illustrator", "Figma", "Branding", "UI/UX"],
                                        stats: {
        completedProfile: 92,
            responseRate: "98%",
                quality: "ممتاز"
    },
    email: "mahmoud@masar.sa",
        phone: "+966 56 111 2222"
}
];

// Simple Radar Chart Component (SVG)
const RadarChart = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <polygon points="50,10 90,40 75,85 25,85 10,40" className="fill-blue-50 stroke-blue-200 stroke-[0.5]" />
        <polygon points="50,25 80,45 70,75 30,75 20,45" className="fill-blue-500/20 stroke-blue-500 stroke-1" />
        <circle cx="50" cy="10" r="1" className="fill-blue-400" />
        <circle cx="90" cy="40" r="1" className="fill-blue-400" />
        <circle cx="75" cy="85" r="1" className="fill-blue-400" />
        <circle cx="25" cy="85" r="1" className="fill-blue-400" />
        <circle cx="10" cy="40" r="1" className="fill-blue-400" />
        <text x="50" y="8" textAnchor="middle" className="text-[4px] fill-gray-500 font-bold">التواجد</text>
        <text x="95" y="40" textAnchor="start" className="text-[4px] fill-gray-500 font-bold">الخبرة</text>
        <text x="80" y="90" textAnchor="middle" className="text-[4px] fill-gray-500 font-bold">التعليم</text>
        <text x="20" y="90" textAnchor="middle" className="text-[4px] fill-gray-500 font-bold">المهارات</text>
        <text x="5" y="40" textAnchor="end" className="text-[4px] fill-gray-500 font-bold">الجودة</text>
    </svg>
);

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function TalentProfilePage(props: PageProps) {
    const params = await props.params;
    const talent = talents.find(t => t.id === parseInt(params.id)) || talents[0];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20" dir="rtl">

            {/* Header / Hero */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-white border-2 border-blue-100 shadow-lg">
                                <img
                                    src={talent.avatar}
                                    alt={talent.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-right">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                <h1 className="text-3xl font-black text-gray-900">{talent.name}</h1>
                                <ShieldCheck className="w-6 h-6 text-green-500 fill-green-50" />
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                                    موثق الهوية
                                </span>
                            </div>

                            <p className="text-xl text-gray-600 font-medium mb-2">{talent.role}</p>

                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-bold text-sm mb-6">
                                <MapPin className="w-4 h-4" />
                                {talent.location}
                                <span className="mx-2 text-gray-300">|</span>
                                <Globe className="w-4 h-4" />
                                الجنسية: سعودي
                            </div>

                            {/* Action Button */}
                            <ContactModal email={talent.email} phone={talent.phone} />
                        </div>

                        {/* Chart (Desktop Only) */}
                        <div className="hidden lg:block w-48 h-48">
                            <RadarChart />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* About */}
                        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full block"></span>
                                نبذة عني
                            </h2>
                            <p className="text-gray-600 leading-loose font-medium">
                                {talent.about}
                            </p>
                        </section>

                        {/* Education */}
                        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full block"></span>
                                التعليم
                            </h2>
                            <div className="space-y-4">
                                {talent.education.map((edu, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                                        <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{edu.degree}</h3>
                                            <p className="text-gray-500">{edu.university}</p>
                                            <p className="text-gray-400 text-sm mt-1">{edu.year}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Experience */}
                        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full block"></span>
                                الخبرات العملية
                            </h2>
                            <div className="space-y-4">
                                {talent.experience.map((exp, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{exp.role}</h3>
                                            <p className="text-gray-500">{exp.company}</p>
                                            <p className="text-gray-400 text-sm mt-1">{exp.period}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Skills */}
                        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full block"></span>
                                المهارات
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {talent.skills.map((skill, i) => (
                                    <span key={i} className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>

                    </div>


                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Radar Chart (Mobile Only) */}
                        <div className="lg:hidden bg-white p-6 rounded-2xl border border-gray-100 flex justify-center">
                            <div className="w-48 h-48">
                                <RadarChart />
                            </div>
                        </div>

                        {/* Profile Completeness */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900">اكتمال الملف</h3>
                                <span className="font-bold text-green-600">{talent.stats.completedProfile}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${talent.stats.completedProfile}%` }}></div>
                            </div>
                        </div>

                        {/* Verifications */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">حالة التوثيق</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                                        <Mail className="w-4 h-4" /> البريد الإلكتروني
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                                        <Phone className="w-4 h-4" /> رقم الجوال
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">إحصائيات</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <span className="block text-xl font-bold text-blue-600">{talent.stats.responseRate}</span>
                                    <span className="text-xs text-gray-500 font-bold">سرعة الرد</span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <span className="block text-xl font-bold text-blue-600">{talent.stats.quality}</span>
                                    <span className="text-xs text-gray-500 font-bold">جودة العمل</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}
