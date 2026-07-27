import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

// Force dynamic execution for caching disabled
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds (max for Vercel Hobby)

// --- Configuration ---
const JOB_IMAGES = [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
    "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
];

const TARGET_DOMAINS = [
    'bayt.com',
    'jadarat.sa',
    'tanqeeb.com',
    'wazifa.mshatly.com',
    'shaghalni.com',
    'haraj.com.sa'
];

// Construct the Google RSS Search Query
const SEARCH_QUERY = `(${TARGET_DOMAINS.map(d => `site:${d}`).join(' OR ')}) "Saudi Arabia" job when:1d`;
const GOOGLE_RSS_URL = `https://news.google.com/rss/search?q=${encodeURIComponent(SEARCH_QUERY)}&hl=ar&gl=SA&ceid=SA:ar`;

// Helper: Extract valid Saudi phone number
const extractPhone = (text: string): string | null => {
    // Regex for Saudi mobile: start with 05 or 9665 followed by 8 digits
    const phoneRegex = /(05\d{8}|9665\d{8})/;
    const match = text.match(phoneRegex);
    return match ? match[0] : null;
};

// Helper: Extract Email
const extractEmail = (text: string): string | null => {
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/;
    const match = text.match(emailRegex);
    return match ? match[0] : null;
};

export async function GET(req: Request) {
    try {
        console.log('🤖 Free Smart Job Engine (Deep Scrape Mode) Started...');
        console.log(`🔍 Searching RSS: ${GOOGLE_RSS_URL}`);

        // 1. Fetch RSS Feed
        const { data: rssData } = await axios.get(GOOGLE_RSS_URL);
        const $ = cheerio.load(rssData, { xmlMode: true });
        const items: any[] = [];

        // Parse RSS items
        $('item').each((i, el) => {
            if (i >= 10) return; // Reduce limit to avoid timeouts since we are visiting pages now
            const title = $(el).find('title').text();
            items.push({
                title: title,
                link: $(el).find('link').text(),
                pubDate: $(el).find('pubDate').text()
            });
        });

        console.log(`✅ Found ${items.length} candidates. Starting Deep Analysis...`);

        let insertedCount = 0;
        const results = [];

        // 2. Loop through candidates
        for (const item of items) {
            try {
                // A. Check Duplicates First (Save time)
                const { data: existing } = await supabase
                    .from('news')
                    .select('id')
                    .eq('title', item.title)
                    .maybeSingle();

                if (existing) {
                    console.log(`⏭️  Skipping duplicate: ${item.title}`);
                    continue;
                }

                // B. Visit Valid URL
                // Google RSS links are redirects. We must follow them.
                const response = await axios.get(item.link, {
                    timeout: 10000, // 10s timeout
                    maxRedirects: 5,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                    }
                });

                const finalUrl = response.request.res.responseUrl || item.link;

                // C. Parse content
                const pageHtml = response.data;
                const $page = cheerio.load(pageHtml);

                // Clean up irrelevant tags to get core text
                $page('script, style, nav, footer, header, iframe, noscript, svg, img').remove();
                const cleanBody = $page('body').text().replace(/\s+/g, ' ').trim();

                // Limit description to avoid DB overflow
                const finalDescription = cleanBody.substring(0, 4000);

                // D. Smart Extraction (Regex)
                const extractedEmail = extractEmail(cleanBody);
                const extractedPhone = extractPhone(cleanBody);

                // E. Pick Image
                const randomImage = JOB_IMAGES[Math.floor(Math.random() * JOB_IMAGES.length)];

                // F. Insert to DB
                const { error } = await supabase.from('news').insert([{
                    title: item.title,
                    source_url: finalUrl,
                    published: item.pubDate,
                    description: finalDescription || "No description available",
                    location: 'السعودية',
                    original_text: 'Full Scrape + Regex Contact',
                    image_url: randomImage,
                    contact_email: extractedEmail,
                    contact_phone: extractedPhone
                }]);

                if (error) {
                    console.error(`❌ Insert Error for ${item.title}:`, error.message);
                } else {
                    console.log(`✨ Added: ${item.title} | 📧 ${extractedEmail || 'N/A'} | 📱 ${extractedPhone || 'N/A'}`);
                    insertedCount++;
                    results.push({ title: item.title, has_contact: !!(extractedEmail || extractedPhone) });
                }

            } catch (innerError: any) {
                console.error(`⚠️ Failed to process link for ${item.title}:`, innerError.message);
                // Continue to next item
            }
        }

        return NextResponse.json({
            success: true,
            message: `Deep Scrape Completed. Add ${insertedCount} new jobs.`,
            details: results
        });

    } catch (error: any) {
        console.error('SERVER ERROR:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
