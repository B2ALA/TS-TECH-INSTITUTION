const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
 
// Service-role client: bypasses RLS. Used ONLY in trusted server routes
// (admin actions, OTP issuance, dummy payment recording, stats aggregation).
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
 
module.exports = supabaseAdmin;
