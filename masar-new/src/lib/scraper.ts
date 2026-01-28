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
    console.log('🕷️ Starting Live Scraper...');
    const jobs: ScrapedJob[] = [];

    // Strategies:
    // 1. Google News RSS for "Jobs in Saudi Arabia" (Reliable, high availability, "Real Time")
    // We will search for specific queries mapping to the user request.

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
                const titleFull = $(el).find('title').text(); // Often "Job Title - Source" or "Company - Job Title"
                const link = $(el).find('link').text();
                const pubDate = $(el).find('pubDate').text();
                const description = $(el).find('description').text();

                // Clean Title Logic
                // Example: "Graphic Designer - Riyadh - Company Name"
                // We'll try to split by hyphen to guess company/title
                let title = titleFull;
                let company = 'Unknown Company';
                let location = 'Saudi Arabia';

                const parts = titleFull.split('-');
                if (parts.length >= 2) {
                    title = parts[0].trim();
                    // Assumption: last part is source/company often in Google News
                    company = parts[parts.length - 1].trim();
                }

                // Detect City in title
                if (titleFull.includes('الرياض') || titleFull.includes('Riyadh')) location = 'Riyadh';
                if (titleFull.includes('جدة') || titleFull.includes('Jeddah')) location = 'Jeddah';
                if (titleFull.includes('الدمام') || titleFull.includes('Dammam')) location = 'Dammam';

                // Basic Deduplication check (in memory for this batch)
                const exists = jobs.find(j => j.source_url === link);
                if (!exists) {
                    jobs.push({
                        title: title,
                        company: company,
                        location: location,
                        category: query.cat,
                        source_url: link,
                        description: `Found via Google News. Source: ${company}. \n\n${description.replace(/<[^>]*>?/gm, "")}`, // Remove HTML tags
                        posted_at: new Date(pubDate).toISOString()
                    });
                }
            });
        }

        console.log(`✅ Scraped ${jobs.length} real jobs successfully.`);

    } catch (error) {
        console.error('❌ Scraper failed:', error);
        // Fallback checks could go here, but Google News is highly reliable.
    }

    return jobs;
}
