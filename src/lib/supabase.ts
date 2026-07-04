import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pakoostpjlkznpxnjsel.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBha29vc3Rwamxrem5weG5qc2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMzU5OTksImV4cCI6MjA5ODcxMTk5OX0.kobzMilPPSSUQ0Oi1NVuwwocDfN2EJ2yZ0z7tAxgOLY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
