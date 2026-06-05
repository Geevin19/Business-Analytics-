import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service role client — bypasses RLS, use only server-side
export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
})
