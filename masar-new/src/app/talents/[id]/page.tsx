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

// تم إصلاح تعريف المصفوفة هنا لضمان عمل البناء بنجاح
const talents = [
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
    }
];

// الرسم البياني (Radar Chart)
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
    params: Promise<{ id: string }>;
}

export default async function TalentProfilePage(props: PageProps) {
    const params = await props.params;
    const talent = talents.find(t => t.id === parseInt(params.id)) || talents[0];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20" dir="rtl">
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-white border-2 border-blue-100 shadow-lg">
                                <img src={talent.avatar} alt={talent.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 text-center md:text-right">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                <h1 className="text-3xl font-black text-gray-900">{talent.name}</h1>
                                <ShieldCheck className="w-6 h-6 text-green-500 fill-green-50" />
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">موثق الهوية</span>
                            </div>
                            <p className="text-xl text-gray-600 font-medium mb-2">{talent.role}</p>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-bold text-sm mb-6">
                                <MapPin className="w-4 h-4" /> {talent.location}
                                <span className="mx-2 text-gray-300">|</span>
                                <Globe className="w-4 h-4" /> الجنسية: سعودي
                            </div>
                            {/* تم تمرير talentName لحل مشكلة TypeScript */}
                            <ContactModal email={talent.email} phone={talent.phone} talentName={talent.name} />
                        </div>
                        <div className="hidden lg:block w-48 h-48">
                            <RadarChart />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"> نبذة عني</h2>
                            <p className="text-gray-600 leading-loose font-medium">{talent.about}</p>
                        </section>
                    </div>
                    {/* Sidebar components can go here */}
                </div>
            </div>
        </div>
    );
}