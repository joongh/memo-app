import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ubqhystbqcfwlhzjzbkd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicWh5c3RicWNmd2xoemp6YmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODU4NTQsImV4cCI6MjA2OTg2MTg1NH0.4ilm1QljqqhLwQT-F7d9_HDRTeQ10UHYnVtqs3u-3ls'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)