import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { saudiJobService } from '../services/saudiJobFetcher.service';

async function main() {
    console.log('====================================================');
    console.log('🇸🇦 بدء نشر وتوزيع الوظائف السعودية في كافة المدن والأقسام');
    console.log('====================================================');

    try {
        const res = await saudiJobService.seedSaudiJobs();
        console.log(`✅ ${res.message}`);
        console.log(`📥 وظائف جديدة أُضيفت: ${res.inserted}`);
        console.log(`🔄 وظائف تم تحديثها والتأكد منها: ${res.updated}`);
        console.log('====================================================\n');
        process.exit(0);
    } catch (e: any) {
        console.error('❌ خطأ:', e);
        process.exit(1);
    }
}

main();
