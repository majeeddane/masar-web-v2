import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

async function scrapeSaudiJobs() {
  try {
    console.log('🔄 Connecting to Google News (Saudi Jobs)...');

    // رابط أخبار جوجل للبحث عن "وظائف" في السعودية (آخر يومين)
    // هذا الرابط مفتوح دائماً ولا يتم حظره
    const url = "https://news.google.com/rss/search?q=وظائف+حكومية+السعودية+when:2d&hl=ar&gl=SA&ceid=SA:ar";

    const { data } = await axios.get(url);

    // تفعيل وضع XML
    const $ = cheerio.load(data, { xmlMode: true });
    const articles: any[] = [];

    $('item').each((i, el) => {
      const title = $(el).find('title').text();
      const link = $(el).find('link').text();
      const pubDate = $(el).find('pubDate').text();

      // تنظيف العنوان (إزالة اسم المصدر الذي يضيفه جوجل في النهاية)
      // مثال: "وظائف شاغرة - صحيفة سبق" -> يصبح -> "وظائف شاغرة"
      const cleanTitle = title.split(' - ')[0];

      if (title && link) {
        articles.push({
          title: cleanTitle,
          link: link,
          published: pubDate
        });
      }
    });

    console.log(`✅ Found ${articles.length} jobs from Google News.`);
    return articles;

  } catch (error) {
    console.error('❌ Error scraping:', error);
    return [];
  }
}

export async function GET(req: Request) {
  try {
    // 1. جلب الأخبار من المصدر المفتوح
    const articles = await scrapeSaudiJobs();
    let insertedCount = 0;

    // 2. التخزين في Supabase
    if (articles.length > 0) {
      for (const item of articles) {
        // فحص التكرار
        const { data: existing } = await supabase
          .from('news')
          .select('id')
          .eq('title', item.title)
          .maybeSingle();

        if (!existing) {
          const { error } = await supabase.from('news').insert([{
            title: item.title,
            source_url: item.link,
            published: item.published
          }]);

          if (!error) {
            insertedCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم بنجاح! تم سحب ${articles.length} وظيفة من أخبار جوجل، وإضافة ${insertedCount} وظيفة جديدة للجدول.`,
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}