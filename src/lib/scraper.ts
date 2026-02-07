
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
    console.log('🚫 Scraper is disabled by Phase 1 policy.');
    return [];
}
