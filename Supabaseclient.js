/* ============================================================
   js/supabase-client.js
   Single Supabase client instance — every other module uses this.
   Include this FIRST, after the supabase-js CDN script, before
   auth.js / courses.js / dashboard.js / admin.js / etc.
   ============================================================ */

const SUPABASE_URL = 'YOUR_SUPABASE_URL';        // e.g. https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
