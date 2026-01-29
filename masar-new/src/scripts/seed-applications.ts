
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const dummyNames = [
    "Ahmed Al-Rashid", "Sara Khalid", "Mohammad Ali", "Noura Al-Saud",
    "Fahad Al-Otaibi", "Reem Abdullah", "Omar Hassan", "Layla Youssef",
    "Khalid Ibrahim", "Hind Al-Harbi", "Saad Al-Qahtani", "Maha Al-Zahrani"
];

async function seed() {
    console.log('Seeding dummy applicants...');

    // 1. Get existing jobs
    const { data: jobs } = await supabase.from('jobs').select('id, title').eq('is_active', true);

    if (!jobs || jobs.length === 0) {
        console.error('No jobs found. Run scraper first.');
        return;
    }

    // 2. Create Dummy Users & Applications
    for (const job of jobs) {
        console.log(`Seeding for job: ${job.title}...`);

        // Create 10 applicants per job
        for (let i = 0; i < 10; i++) {
            const name = dummyNames[i % dummyNames.length] + ` ${Math.floor(Math.random() * 1000)}`;
            const email = `applicant${Math.floor(Math.random() * 100000)}@test.com`;

            try {
                const { data: userAuth, error: authError } = await supabase.auth.admin.createUser({
                    email: email,
                    password: 'password123',
                    email_confirm: true,
                    user_metadata: { name: name }
                });

                if (authError) {
                    // Check if user already exists
                    // If so, get user ID? Need to query.
                    // For now, just continue.
                    // console.warn(`Skipping user creation ${email}:`, authError?.message);
                    if (!userAuth.user) continue;
                }

                const userId = userAuth.user?.id;
                if (!userId) continue;

                // Insert Application
                const score = Math.floor(Math.random() * (95 - 40 + 1)) + 40; // 40-95

                const { error: appError } = await supabase.from('applications').insert({
                    job_id: job.id,
                    user_id: userId,
                    match_score: score,
                    status: 'pending',
                    cover_letter: 'I am very interested in this position...'
                });

                if (appError) {
                    // Ignore duplicates if re-seeding
                    if (appError.code !== '23505') console.error('App insert error:', appError.message);
                }

            } catch (e) {
                console.error('Seed error:', e);
            }
        }
    }
    console.log('Seeding complete.');
}

seed();
