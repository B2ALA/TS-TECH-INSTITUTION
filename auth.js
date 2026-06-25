/* ============================================================
   AUTH.JS — Supabase Auth wiring
   Handles: signup, login, logout, forgot-password, session restore,
   role selection (student/instructor only — admin logs in separately
   via admin.html), and basic UI helpers used by the auth modal.
   ============================================================ */

const AUTH = { selectedRole: 'student', session: null, profile: null };

/* ---------- UI: open/close/switch auth modal ---------- */
function openAuth(tab) {
  document.getElementById('authModal').classList.add('active');
  switchAuth(tab);
  clearAuthMsg('loginMsg'); clearAuthMsg('signupMsg');
}
function switchAuth(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('signupTab').classList.toggle('active', tab === 'signup');
}
function setRole(btn) {
  btn.closest('.role-sel').querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  AUTH.selectedRole = btn.dataset.role;
}
function togglePw(id, btn) {
  const i = document.getElementById(id);
  const isPw = i.type === 'password';
  i.type = isPw ? 'text' : 'password';
  btn.innerHTML = isPw ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
}
function chkPw(v) {
  const el = document.getElementById('pwStr');
  if (!el) return;
  if (!v) { el.className = 'pw-str'; return; }
  if (v.length < 6) { el.className = 'pw-str weak'; return; }
  if (v.length < 10) { el.className = 'pw-str medium'; return; }
  el.className = 'pw-str strong';
}
function setAuthMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `auth-msg show ${type}`;
}
function clearAuthMsg(id) {
  const el = document.getElementById(id);
  if (el) { el.textContent = ''; el.className = 'auth-msg'; }
}

/* ---------- SIGN UP ---------- */
async function doSignup() {
  const fname = document.getElementById('regFname').value.trim();
  const lname = document.getElementById('regLname').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const city = document.getElementById('regCity').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const role = AUTH.selectedRole; // 'student' | 'instructor' — admin role can never be self-selected here

  if (!fname || !email || !pass) return setAuthMsg('signupMsg', 'Please fill all required fields.', 'err');
  if (pass !== pass2) return setAuthMsg('signupMsg', 'Passwords do not match.', 'err');
  if (pass.length < 6) return setAuthMsg('signupMsg', 'Password must be at least 6 characters.', 'err');

  const btn = document.getElementById('signupBtn');
  btn.disabled = true; btn.textContent = 'Creating account…';

  try {
    // Supabase sends the verification email automatically (Auth → Email Templates).
    const { data, error } = await supabaseClient.auth.signUp({
      email, password: pass,
      options: {
        data: { first_name: fname, last_name: lname, role },
        emailRedirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) throw error;

    // phone/city aren't part of auth metadata trigger — patch the profile row once created
    if (data?.user) {
      await supabaseClient.from('profiles').update({ phone, city }).eq('id', data.user.id);
    }

    const note = role === 'instructor'
      ? 'Account created! Check your email to verify your address. Instructor accounts also need admin approval before you can publish courses.'
      : 'Account created! Check your email to verify your address before logging in.';
    setAuthMsg('signupMsg', note, 'ok');
    document.getElementById('signupForm').querySelectorAll('input').forEach(i => i.value = '');
    showToast('Verification email sent ✉️', 'success');
  } catch (err) {
    setAuthMsg('signupMsg', err.message || 'Sign up failed.', 'err');
  } finally {
    btn.disabled = false; btn.textContent = 'Create Account';
  }
}

/* ---------- LOGIN ---------- */
async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  if (!email || !pass) return setAuthMsg('loginMsg', 'Enter email and password.', 'err');

  const btn = document.getElementById('loginBtn');
  btn.disabled = true; btn.textContent = 'Logging in…';

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;

    if (!data.user.email_confirmed_at && !data.user.confirmed_at) {
      await supabaseClient.auth.signOut();
      throw new Error('Please verify your email first. Check your inbox for the confirmation link.');
    }

    await loadProfileAndEnterApp();
    closeModal('authModal');
    showToast(`Welcome back, ${AUTH.profile?.first_name || 'there'}!`, 'success');
  } catch (err) {
    setAuthMsg('loginMsg', err.message || 'Login failed.', 'err');
  } finally {
    btn.disabled = false; btn.textContent = 'Login';
  }
}

async function doForgotPassword() {
  const email = document.getElementById('loginEmail').value.trim();
  if (!email) return setAuthMsg('loginMsg', 'Enter your email above first, then click "Forgot password?".', 'err');
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });
    if (error) throw error;
    setAuthMsg('loginMsg', 'Password reset link sent to your email.', 'ok');
  } catch (err) {
    setAuthMsg('loginMsg', err.message || 'Could not send reset link.', 'err');
  }
}

/* ---------- LOGOUT ---------- */
async function doLogout() {
  await supabaseClient.auth.signOut();
  AUTH.session = null; AUTH.profile = null;
  applyLoggedOutUI();
  showPage('home');
  showToast('Logged out', 'info');
}

/* ---------- SESSION RESTORE ---------- */
async function loadProfileAndEnterApp() {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  AUTH.session = sessionData?.session || null;
  if (!AUTH.session) return applyLoggedOutUI();

  const { data: profile, error } = await supabaseClient
    .from('profiles').select('*').eq('id', AUTH.session.user.id).single();
  if (error || !profile) return applyLoggedOutUI();
  if (profile.is_blocked) {
    await supabaseClient.auth.signOut();
    showToast('This account has been suspended. Contact support.', 'error');
    return applyLoggedOutUI();
  }

  AUTH.profile = profile;
  applyLoggedInUI(profile);
}

function applyLoggedInUI(profile) {
  const init = ((profile.first_name || '?')[0] + (profile.last_name || '')[0]).toUpperCase();
  document.getElementById('userAvBtn').style.display = 'flex';
  document.getElementById('userAvInit').textContent = init;
  document.getElementById('guestButtons').style.display = 'none';
  document.getElementById('sbAv').textContent = init;
  document.getElementById('sbName').textContent = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email;
  document.getElementById('sbRole').textContent = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
  const mobArea = document.getElementById('mobAuthArea');
  if (mobArea) mobArea.innerHTML = '<button class="btn-full" style="background:var(--accentr);color:#fff" onclick="doLogout();closeMob()">Logout</button>';
  if (typeof renderProfilePage === 'function') renderProfilePage();
}

function applyLoggedOutUI() {
  document.getElementById('userAvBtn').style.display = 'none';
  document.getElementById('guestButtons').style.display = 'flex';
  document.getElementById('sbAv').textContent = '?';
  document.getElementById('sbName').textContent = 'Guest';
  document.getElementById('sbRole').textContent = '';
  const mobArea = document.getElementById('mobAuthArea');
  if (mobArea) mobArea.innerHTML = '<button class="btn-full btn-accent" onclick="openAuth(\'login\');closeMob()">Login</button>';
}

/* Restore session on page load + react to auth state changes (e.g. password reset link clicked) */
supabaseClient.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') loadProfileAndEnterApp();
  if (event === 'SIGNED_OUT') applyLoggedOutUI();
});
document.addEventListener('DOMContentLoaded', loadProfileAndEnterApp);
