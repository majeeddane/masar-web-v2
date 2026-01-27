
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

// Helper to extract email
const extractEmails = (text: string) => {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  return text.match(emailRegex) || [];
};

// Helper to extract Saudi phone numbers (05xxxxxxxx)
const extractPhones = (text: string) => {
  const phoneRegex = /(?:\+966|0)?5\d{8}/g;
  return text.match(phoneRegex) || [];
};

// Clean HTML tags and "click here" text
const cleanText = (text: string) => {
  return text
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .replace(/click here/gi, '')
    .replace(/اضغط هنا/g, '')
    .trim();
};

const detectCity = (text: string) => {
  const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Medina', 'Khobar', 'Tabuk', 'Hail', 'Abha', 'Najran', 'Jizan', 'Qassim', 'Jubail', 'Yanbu', 'الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الخبر', 'تبوك', 'حائل', 'أبها', 'نجران', 'جازان', 'القصيم', 'الجبيل', 'ينبع'];
  for (const city of cities) {
    if (text.includes(city)) return city;
  }
  return null;
};

// Scraper for saudijobs24.com
// Note: This is a basic implementation. Real scraping might need more complex selectors or handling pagination.
async function scrapeSaudiJobs24() {
  try {
    const { data } = await axios.get('https://www.saudijobs24.com/', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    const $ = cheerio.load(data);
    const jobs: any[] = [];

    // Selectors need to be adjusted based on the actual website structure.
    // Assuming a standard blog layout where posts are listed.
    // Inspecting (hypothetically) the site structure.
    // Usually '.post-title' or similar.
    $('.blog-post, .post').each((i, el) => {
      const titleElement = $(el).find('.post-title a, h2 a, h3 a');
      const title = titleElement.text().trim();
      const link = titleElement.attr('href');
      const snippet = $(el).find('.post-body, .entry-content').text().trim();

      if (title && link) {
         jobs.push({
             title,
             link,
             snippet
         });
      }
    });

    // For better detail, we might need to visit each link. For now, let's just use the main page listings or whatever is available.
    // If we need fetching full content, we would loop through `jobs` and fetch `link`.

    const detailedJobs = [];
    for (const job of jobs.slice(0, 5)) { // Limit to 5 for test
        try {
            const { data: jobData } = await axios.get(job.link, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
             }
            });
            const $job = cheerio.load(jobData);
            const content = $job('.post-body, .entry-content').html() || '';
            const textContent = $job('.post-body, .entry-content').text() || '';

            const emails = extractEmails(textContent);
            const phones = extractPhones(textContent);
            const city = detectCity(textContent) || detectCity(job.title) || 'Unknown';

            detailedJobs.push({
                title: job.title,
                company_name: 'SaudiJobs24', // Often not explicitly separate
                city: city,
                description: cleanText(content), // Storing cleaned text or HTML? User asked for "full Description" and "Clean up".
                contact_info: JSON.stringify({ emails, phones }),
                location: city,
                source_url: job.link,
                source: 'saudijobs24.com'
            });

        } catch (e) {
            console.error(`Failed to scrape details for ${job.link}`, e);
        }
    }

    return detailedJobs;
  } catch (error) {
    console.error('Error scraping SaudiJobs24:', error);
    return [];
  }
}

// Scraper for wadhefa.com
async function scrapeWadhefa() {
    try {
        const { data } = await axios.get('https://www.wadhefa.com/news/', {
               headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
               }
        });
        const $ = cheerio.load(data);
        const jobs: any[] = [];

        // Adjust selectors for wadhefa
        $('.news_item, .post').each((i, el) => {
             const titleElement = $(el).find('h3 a, .title a');
             const title = titleElement.text().trim();
             const link = titleElement.attr('href');
             
             if(title && link) {
                 jobs.push({ title, link });
             }
        });

         const detailedJobs = [];
            for (const job of jobs.slice(0, 5)) {
                try {
                     // Handle relative URLs if necessary
                    const fullLink = job.link.startsWith('http') ? job.link : `https://www.wadhefa.com${job.link}`;

                    const { data: jobData } = await axios.get(fullLink, {
                         headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    const $job = cheerio.load(jobData);
                    const content = $job('.news_body, .content').html() || '';
                    const textContent = $job('.news_body, .content').text() || '';

                    const emails = extractEmails(textContent);
                    const phones = extractPhones(textContent);
                    const city = detectCity(textContent) || detectCity(job.title) || 'Unknown';

                    detailedJobs.push({
                        title: job.title,
                        company_name: 'Wadhefa',
                        city: city,
                        description: cleanText(content),
                        contact_info: JSON.stringify({ emails, phones }),
                        location: city,
                        source_url: fullLink,
                        source: 'wadhefa.com'
                    });

                } catch (e) {
                    console.error(`Failed to scrape details for ${job.link}`, e);
                }
            }

        return detailedJobs;

    } catch (error) {
        console.error('Error scraping Wadhefa:', error);
        return [];
    }
}

export async function POST(req: Request) {
  try {
    // 1. Scrape data
    const [jobs1, jobs2] = await Promise.all([
        scrapeSaudiJobs24(),
        scrapeWadhefa()
    ]);

    const allJobs = [...jobs1, ...jobs2];
    let insertedCount = 0;

    // 2. Insert into Supabase with duplicate check
    for (const job of allJobs) {
      // Check for existing job with same title created today
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from('jobs')
        .select('id')
        .eq('title', job.title)
        .gte('created_at', today) 
        .maybeSingle();

      if (!existing) {
        // Insert
        const { error } = await supabase.from('jobs').insert([{
            title: job.title,
            company_name: job.company_name,
            city: job.city,
            description: job.description,
            contact_info: job.contact_info,
            location: job.location,
            source_url: job.source_url,
            // source: job.source // If 'source' column exists, otherwise it might error. Safest to stick to confirmed columns or generic ones.
        }]);

        if (!error) {
            insertedCount++;
        } else {
            console.error('Error inserting job:', error);
        }
      }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Successfully added ${insertedCount} new jobs!`, 
        totalScraped: allJobs.length 
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
