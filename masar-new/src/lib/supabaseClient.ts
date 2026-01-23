import { createClient } from '@supabase/supabase-js'

// HARDCODED CREDENTIALS AS REQUESTED
// TODO: Revert to using environment variables properly in production
const supabaseUrl = 'https://avbvwmsjmsyamkuixitt.supabase.co'
const supabaseKey = 'eyJhbgCiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YnZ3bXNqbXN5YW1rdWl4aXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDY4NjUsImV4cCI6MjA1MzIyMjg2NX0.gb6SzKukNNOeSBzmiCHLxPw9P450vhYhw5klkxX_bEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
