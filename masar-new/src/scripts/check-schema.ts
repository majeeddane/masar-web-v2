
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking applications table...');
    const { data: apps, error } = await supabase.from('applications').select('*').limit(1);

    if (error) {
        console.error('Error fetching applications:', error);
    } else {
        if (apps.length > 0) {
            console.log('Applications Columns:', Object.keys(apps[0]));
        } else {
            console.log('Applications table is empty, creating a dummy one to check keys? No, just listing empty.');
            // Insert one to see? No, might violate constraints.
        }
    }

    console.log('Checking jobs table...');
    const { data: jobs, error: jobsError } = await supabase.from('jobs').select('*').limit(1);
    if (jobsError) console.error(jobsError);
    else if (jobs.length > 0) console.log('Jobs Columns:', Object.keys(jobs[0]));

}

checkSchema();
