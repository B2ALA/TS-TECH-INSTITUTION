/* ============================================================
   TS TECH PARK LMS — auth.js
   Drop-in Supabase Auth module.

   SETUP:
   1. Add to your HTML <head>, before this script:
      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   2. Fill in SUPABASE_URL and SUPABASE_ANON_KEY below.
   3. Include this file after supabase-js and before your app code.
   4. Your app code can call window.Auth.* — see usage notes at bottom.
   ============================================================ */

const SUPABASE_URL = 'YOUR_SUPABASE_URL';        // e.g. https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/* ---------- SIGN UP ----------
   role: 'student' | 'instructor'  (admin accounts are never created
   this way — see admin_setup.sql notes)
   Supabase sends the verification email automatically because
   "Confirm email" is on by default in Auth settings.
*/
async function signUp({ firstName, lastName, email, phone, city, password, role = 'student' }) {
  const { data, error } = await _sb.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, phone, city, role },
      emailRedirectTo: window.location.origin + '/?verified=1',
    },
  });
  if (error) return { ok: false, error: error.message };

  if (role === 'instructor') {
    return {
      ok: true,
      data,
      notice: 'Account created. Please verify your email, then wait for admin approval before you can log in as an instructor.',
    };
  }
  return { ok: true, data, notice: 'Account created! Please check your email to verify your account.' };
}

/* ---------- LOG IN ---------- */
async function signIn({ email, password }) {
  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  if (!data.user.email_confirmed_at) {
    await _sb.auth.signOut();
    return { ok: false, error: 'Please verify your email before logging in. Check your inbox for the verification link.' };
  }

  const profile = await getProfile(data.user.id);
  if (!profile.ok) return profile;

  if (profile.data.role === 'instructor' && profile.data.status === 'pending') {
    await _sb.auth.signOut();
    return { ok: false, error: 'Your instructor account is awaiting admin approval.' };
  }
  if (profile.data.status === 'suspended') {
    await _sb.auth.signOut();
    return { ok: false, error: 'Your account has been suspended. Contact support.' };
  }

  return { ok: true, user: data.user, profile: profile.data };
}

/* ---------- LOG OUT ---------- */
async function signOut() {
  const { error } = await _sb.auth.signOut();
  return error ? { ok: false, error: error.message } : { ok: true };
}

/* ---------- CURRENT SESSION / PROFILE ---------- */
async function getSession() {
  const { data, error } = await _sb.auth.getSession();
  if (error || !data.session) return { ok: false };
  const profile = await getProfile(data.session.user.id);
  if (!profile.ok) return { ok: false };
  return { ok: true, user: data.session.user, profile: profile.data };
}

async function getProfile(userId) {
  const { data, error } = await _sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

/* ---------- PASSWORD RESET ---------- */
async function requestPasswordReset(email) {
  const { error } = await _sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/?reset=1',
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, notice: 'Password reset link sent to your email.' };
}

async function updatePassword(newPassword) {
  const { error } = await _sb.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/* ---------- REACT TO AUTH CHANGES (e.g. clicking the email link) ---------- */
function onAuthChange(callback) {
  _sb.auth.onAuthStateChange((event, session) => callback(event, session));
}

window.Auth = {
  client: _sb,
  signUp,
  signIn,
  signOut,
  getSession,
  getProfile,
  requestPasswordReset,
  updatePassword,
  onAuthChange,
};

/* ============================================================
   USAGE NOTES — wiring into your existing doSignup()/doLogin()

   async function doSignup() {
     const res = await Auth.signUp({
       firstName: document.getElementById('regFname').value.trim(),
       lastName: document.getElementById('regLname').value.trim(),
       email: document.getElementById('regEmail').value.trim(),
       phone: document.getElementById('regPhone').value.trim(),
       city: document.getElementById('regCity').value.trim(),
       password: document.getElementById('regPass').value,
       role: document.querySelector('#signupForm .role-btn.active')
              ?.textContent.trim().toLowerCase().includes('instructor')
              ? 'instructor' : 'student',
     });
     if (!res.ok) { showToast(res.error, 'error'); return; }
     closeModal('authModal');
     showToast(res.notice, 'success');
   }

   async function doLogin() {
     const res = await Auth.signIn({
       email: document.getElementById('loginEmail').value.trim(),
       password: document.getElementById('loginPass').value,
     });
     if (!res.ok) { showToast(res.error, 'error'); return; }
     S.user = res.profile;
     S.loggedIn = true;
     afterLogin();
     closeModal('authModal');
     showPage('dashboard');
   }

   On page load, replace loadStorage()'s localStorage check with:
     Auth.getSession().then(res => {
       if (res.ok) { S.user = res.profile; S.loggedIn = true; afterLogin(); }
     });
   ============================================================ */
