import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = 'https://hrdpnyfkffoiuesemvdp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZHBueWZrZmZvaXVlc2VtdmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTk2ODcsImV4cCI6MjA2ODQ5NTY4N30.jxWVSopZtQ9HAKBTXHU1cTff38vVINR-s5a0IOflqu4'

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey)

export type { User } from '@supabase/supabase-js' 