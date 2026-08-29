import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { jobAggregator } from '../services/jobAggregator.service';

async function main() {
    console.log('====================================================');
    console.log('🚀 بدء عملية سحب ومعالجة الوظائف الحقيقية بالذكاء الاصطناعي');
    console.log('====================================================');

    const startTime = Date.now();
    try {
        const report = await jobAggregator.runSync({
            limitPerSource: 15,
            source: 'all'
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log('\n================== تقرير المزامنة ==================');
        console.log(`⏱️ استغرقت العملية: ${duration} ثانية`);
        console.log(`📥 إجمالي الوظائف المسحوبة من الـ APIs: ${report.totalFetched}`);
        console.log(`⏩ وظائف مكررة تم تجاوزها: ${report.alreadyExisted}`);
        console.log(`🤖 وظائف جديدة عولجت بالـ AI: ${report.newJobsProcessed}`);
        console.log(`✅ وظائف أُضيفت بنجاح إلى قاعدة البيانات: ${report.successfullyInserted}`);
        console.log(`❌ وظائف فشل إدراجها: ${report.failed}`);

        if (report.insertedJobs.length > 0) {
            console.log('\n📋 عينة من الوظائف الحقيقية المضافة:');
            report.insertedJobs.slice(0, 5).forEach((j, i) => {
                console.log(`   ${i + 1}. [${j.category}] ${j.title} - ${j.company}`);
            });
        }

        if (report.errors.length > 0) {
            console.log('\n⚠️ الأخطاء المسجلة:');
            report.errors.forEach(e => console.log(`   - ${e}`));
        }

        console.log('====================================================\n');
        process.exit(0);
    } catch (err: any) {
        console.error('❌ حدث خطأ غير متوقع أثناء المزامنة:', err);
        process.exit(1);
    }
}

main();
