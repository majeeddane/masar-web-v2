import { FileText, Plus } from 'lucide-react';

export default function CVBuilderPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 animate-pulse">
                <FileText className="w-10 h-10" />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">باني السيرة الذاتية</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                    قم بإنشاء سيرة ذاتية احترافية باستخدام قوالب مصممة خصيصاً لسوق العمل السعودي.
                </p>
            </div>

            <button className="px-8 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 hover:scale-105">
                <Plus className="w-5 h-5" />
                <span>ابدأ بناء السيرة الذاتية</span>
            </button>
        </div>
    );
}
