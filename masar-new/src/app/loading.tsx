export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            {/* Skeleton Header */}
            <header className="relative pt-32 pb-48 lg:min-h-[500px] bg-gray-900 overflow-hidden animate-pulse">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="h-12 bg-white/10 rounded-full w-2/3 mx-auto mb-6"></div>
                    <div className="h-6 bg-white/5 rounded-full w-1/2 mx-auto"></div>
                </div>
            </header>

            {/* Skeleton Content */}
            <div className="container mx-auto px-6 -mt-24 relative z-20">
                <div className="h-40 bg-white rounded-3xl shadow-xl border border-gray-100 mb-12 animate-pulse"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 h-64 animate-pulse">
                            <div className="flex gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="space-y-2 mt-8">
                                <div className="h-8 bg-gray-50 rounded w-full"></div>
                                <div className="h-8 bg-gray-50 rounded w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
