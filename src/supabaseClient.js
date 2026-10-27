import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Replace these with your actual Supabase Project URL and Anon Key
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE'

let supabase = null;

try {
  if (supabaseUrl !== 'YOUR_SUPABASE_URL_HERE') {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    console.warn("Supabase keys are not set. Authentication will not work until keys are provided in src/supabaseClient.js");
  }
} catch(e) {
  console.error("Failed to initialize Supabase:", e);
}

export { supabase }
