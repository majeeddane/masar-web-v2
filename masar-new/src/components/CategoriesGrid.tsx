import { createClient } from '@/lib/supabaseServer';
import { CategoryIcon } from '@/components/CategoryIcon';
import Link from 'next/link';

export default async function CategoriesGrid() {
    const supabase = await createClient();
    const { data: categories } = await supabase.from('categories').select('*').order('name_ar');

    if (!categories || categories.length === 0) {
        return <p className="col-span-full text-center text-gray-400 py-4">جاري تحميل التصنيفات...</p>;
    }

    return (
        <>
            {categories.map((cat) => (
                <Link
                    key={cat.id}
                    href={`/jobs?category=${cat.id}`}
                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:scale-105 transition-all group border border-transparent hover:border-blue-100"
                >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-500 group-hover:text-blue-600 shadow-sm group-hover:shadow-md transition-all">
                        <CategoryIcon name={cat.icon} className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700 text-center line-clamp-1">
                        {cat.name_ar}
                    </span>
                </Link>
            ))}
        </>
    );
}
