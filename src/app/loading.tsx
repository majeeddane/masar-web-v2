import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-gray-100 border-t-[#115d9a] animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-2 w-2 bg-[#115d9a] rounded-full"></div>
                    </div>
                </div>
                <p className="text-[#115d9a] font-bold animate-pulse">جاري التحميل...</p>
            </div>
        </div>
    );
}
