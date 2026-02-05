
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
    console.log('Checking job_applications table...');
    const { data: apps, error } = await supabase.from('job_applications').select('*').limit(1);

    if (error) {
        console.error('Error fetching job_applications:', error.message);
    } else {
        console.log('job_applications table exists.');
        if (apps.length > 0) {
            console.log('job_applications Columns:', Object.keys(apps[0]));
        }
    }

    console.log('Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').limit(1);

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError.message);
    } else {
        console.log('profiles table exists.');
        if (profiles.length > 0) {
            console.log('profiles Columns:', Object.keys(profiles[0]));
        } else {
            // If empty, insert a dummy to check? No, risky. 
            // Just rely on error if validation fails or assume I need to ADD the column.
            console.log('profiles table is empty.');
        }
    }

    console.log('Checking jobs table...');
    const { data: jobs, error: jobsError } = await supabase.from('jobs').select('*').limit(1);
    if (jobsError) console.error(jobsError);
    else if (jobs.length > 0) console.log('Jobs Columns:', Object.keys(jobs[0]));

}

checkSchema();
