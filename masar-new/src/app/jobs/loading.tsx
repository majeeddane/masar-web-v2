
export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
            <div className="h-20 bg-white border-b border-gray-100" />

            <div className="h-32 bg-gray-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 animate-pulse" />
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                            <div className="flex gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                </div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
