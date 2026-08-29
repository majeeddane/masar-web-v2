import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { jobAggregator } from '../services/jobAggregator.service';

async function main() {
    console.log('====================================================');
    console.log('🧹 بدء عملية تصفية وحذف الوظائف التجريبية من مسار');
    console.log('====================================================');

    try {
        const result = await jobAggregator.purgeMockJobs();
        console.log(`✅ ${result.message}`);
        console.log('====================================================\n');
        process.exit(0);
    } catch (err: any) {
        console.error('❌ خطأ أثناء حذف الوظائف التجريبية:', err);
        process.exit(1);
    }
}

main();
