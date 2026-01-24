import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tluirjbfamklzjugtnek.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsdWlyamJmYW1rbHpqdWd0bmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODc5ODIsImV4cCI6MjA4NDc2Mzk4Mn0.GeAwox6wsq8MQBL7fvO5WUZPQiEO25QfeZ_sBc13yaU'

export const supabase = createClient(supabaseUrl, supabaseKey)