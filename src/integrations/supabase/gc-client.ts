/**
 * G-Connect Standalone Supabase Client
 * 
 * Bridges Houston design requests into the G-Connect instructions pipeline.
 * Uses the publishable anon key (safe for client code).
 */
import { createClient } from "@supabase/supabase-js";

const GC_URL = "https://ocufdcowvjfvvddcfazz.supabase.co";
const GC_KEY = "sb_publishable_05G-zqkOKCdB5Kmt3Me34A__nydhf0j";

export const gcSupabase = createClient(GC_URL, GC_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
