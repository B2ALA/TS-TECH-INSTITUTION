const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.https://porocrkvnloirgmixaqk.supabase.co;
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcm9jcmt2bmxvaXJnbWl4YXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTU1MDYsImV4cCI6MjA5NTk5MTUwNn0.JEXmYn1n7a9zxNexA25IwNhDTIxwWEZWT2u6GjHAL_8;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL ERROR: Supabase environmental connection targets are missing inside configuration properties.");
    process.exit(1);
}

// Instantiate database engine abstraction instance layer
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

console.log("Supabase infrastructure connection pooling verified successfully.");

module.exports = supabase;
