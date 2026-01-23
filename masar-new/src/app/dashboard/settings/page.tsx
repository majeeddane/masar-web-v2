export default function SettingsPage() {
    return (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-blue-950 mb-6">إعدادات الحساب</h2>

            <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الأول</label>
                        <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500" defaultValue="محمد" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الأخير</label>
                        <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500" defaultValue="أحمد" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                    <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-left" dir="ltr" defaultValue="mohammed@example.com" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور الحالية</label>
                    <input type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-left" dir="ltr" placeholder="••••••••" />
                </div>

                <div className="pt-4 flex justify-end">
                    <button className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition-all">
                        حفظ التغييرات
                    </button>
                </div>
            </form>
        </div>
    );
}
