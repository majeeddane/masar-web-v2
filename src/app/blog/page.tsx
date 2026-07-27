import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';

const BLOG_POSTS = [
    {
        slug: 'top-cv-tips-2026',
        title: 'كيف تكتب سيرة ذاتية احترافية في 2026؟',
        excerpt: 'الدليل الشامل لبناء سيرة ذاتية تجذب انتباه مسؤولي التوظيف في أقل من 7 ثوانٍ.',
        author: 'فريق مسار',
        date: '26 يناير 2026',
        category: 'نصائح مهنية',
        image: 'bg-blue-100'
    },
    {
        slug: 'remote-work-saudi',
        title: 'مستقبل العمل عن بعد في السعودية',
        excerpt: 'تحليل لسوق العمل السعودي والفرص المتزايدة في قطاع العمل المرن.',
        author: 'سارة محمد',
        date: '25 يناير 2026',
        category: 'سوق العمل',
        image: 'bg-teal-100'
    },
    {
        slug: 'interview-questions',
        title: 'أهم 10 أسئلة في المقابلات الشخصية',
        excerpt: 'كيف تجيب بذكاء وثقة على أصعب أسئلة المقابلات الوظيفية.',
        author: 'أحمد علي',
        date: '24 يناير 2026',
        category: 'مقابلات',
        image: 'bg-purple-100'
    }
];

export default function BlogIndex() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-20" dir="rtl">
            <div className="container mx-auto px-6">

                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-blue-950 mb-4">المدونة المهنية</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">نصائح يومية، تحليلات لسوق العمل، وإرشادات لتطوير مسارك المهني.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.slug} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
                            <div className={`h-48 ${post.image} w-full`}></div>
                            <div className="p-8">
                                <div className="flex items-center gap-4 text-xs font-bold text-blue-600 mb-4">
                                    <span className="bg-blue-50 px-3 py-1 rounded-full">{post.category}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{post.title}</h3>
                                <p className="text-slate-500 mb-6 text-sm leading-relaxed">{post.excerpt}</p>

                                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 pt-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        {post.author}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {post.date}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
}
