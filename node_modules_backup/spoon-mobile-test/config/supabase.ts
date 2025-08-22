import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vrwlaqfsvqwmcecyzelf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyd2xhcWZzdnF3bWNlY3l6ZWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mjk5MDQsImV4cCI6MjA3MTIwNTkwNH0.RiFKPquTEotWvOYL2Fg4sgGMheUmPQBK9CWsjrL4lnU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
