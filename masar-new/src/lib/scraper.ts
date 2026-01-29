import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedJob {
    title: string;
    company: string;
    location: string;
    category: string;
    source_url?: string;
    description?: string;
    posted_at?: string;
}

export async function scrapeJobs(): Promise<ScrapedJob[]> {
    console.log('🕷️ Starting Live Scraper (Quality Mode)...');
    const jobs: ScrapedJob[] = [];

    const queries = [
        { q: 'وظائف مصمم جرافيك السعودية', cat: 'Design' },
        { q: 'Graphic Designer Job Saudi Arabia', cat: 'Design' },
        { q: 'وظائف عقارات السعودية', cat: 'Real Estate' },
        { q: 'Real Estate Job Riyadh', cat: 'Real Estate' }
    ];

    try {
        for (const query of queries) {
            const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query.q + ' when:7d')}&hl=ar&gl=SA&ceid=SA:ar`;
            console.log(`Searching: ${query.q}...`);

            const { data } = await axios.get(rssUrl);
            const $ = cheerio.load(data, { xmlMode: true });

            $('item').each((_, el) => {
                const titleFull = $(el).find('title').text();
                const link = $(el).find('link').text();
                const pubDate = $(el).find('pubDate').text();

                // --- Clean Description ---
                let rawDescription = $(el).find('description').text();
                // Remove HTML tags
                let cleanDescription = rawDescription.replace(/<[^>]*>?/gm, "").trim();

                // --- Quality Filter ---
                if (!cleanDescription || cleanDescription.length < 50) {
                    // Skip empty or too short descriptions
                    return;
                }

                // If the description is just "..." or "click here", skip it
                if (cleanDescription.includes('click here to read') || cleanDescription.length < 80) {
                    // Try to enhance or skip. For now, strict skip to ensure "Premium" feel.
                    // A real premium scraper would visit the 'link' and parse the full page body.
                    // For this stage, we simply filter out the noise.
                    return;
                }

                // --- Parse Metadata ---
                // Example: "Graphic Designer - Riyadh - Company Name"
                let title = titleFull;
                let company = 'Unknown Company';
                let location = 'Saudi Arabia';

                const parts = titleFull.split('-');
                if (parts.length >= 2) {
                    title = parts[0].trim();
                    company = parts[parts.length - 1].trim();
                }

                if (titleFull.includes('الرياض') || titleFull.includes('Riyadh')) location = 'Riyadh';
                if (titleFull.includes('جدة') || titleFull.includes('Jeddah')) location = 'Jeddah';
                if (titleFull.includes('الدمام') || titleFull.includes('Dammam')) location = 'Dammam';

                // Basic Deduplication
                const exists = jobs.find(j => j.source_url === link);
                if (!exists) {
                    jobs.push({
                        title: title,
                        company: company,
                        location: location,
                        category: query.cat,
                        source_url: link,
                        description: cleanDescription,
                        posted_at: new Date(pubDate).toISOString()
                    });
                }
            });
        }

        console.log(`✅ Scraped ${jobs.length} high-quality jobs successfully.`);

    } catch (error) {
        console.error('❌ Scraper failed:', error);
    }

    return jobs;
}
