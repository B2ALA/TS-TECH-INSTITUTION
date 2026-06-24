/* js/auth.js — all authentication flows.
   Two-step verification implemented here:
   1) USER SIGNUP: create account -> email OTP sent -> verify-signup-otp -> token issued
   2) ADMIN LOGIN: username+password -> email OTP sent -> verify-otp -> admin token issued
*/

/* ---------------- Auth modal open/close/tabs ---------------- */
function openAuth(tab) {
  openModal('authModal');
  document.getElementById('authMainView').style.display = 'block';
  document.getElementById('authVerifyView').style.display = 'none';
  switchAuth(tab);
}
function switchAuth(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('signupTab').classList.toggle('active', tab === 'signup');
}
function setRole(btn) {
  btn.closest('.role-sel').querySelectorAll('.role-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ---------------- Login ---------------- */
async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  if (!email || !password) return showToast('Please fill all fields', 'error');

  try {
    const data = await TS.api('/auth/login', { method: 'POST', body: { email, password } });
    finishLogin(data.token, data.user);
  } catch (e) {
    // If the account exists but isn't verified yet, the backend tells us so
    // and re-sends an OTP — route the user straight into step 2.
    if (e.needsVerification) { /* not reachable: error is a plain Error */ }
    showToast(e.message, e.message.includes('verify') ? 'warning' : 'error');
    if (e.message.toLowerCase().includes('verify')) {
      S.pendingSignupEmail = email;
      enterOtpStep(email);
    }
  }
}

/* ---------------- Signup (step 1) ---------------- */
async function doSignup() {
  const firstName = document.getElementById('regFname').value.trim();
  const lastName = document.getElementById('regLname').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const city = document.getElementById('regCity').value.trim();
  const password = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const role = document.querySelector('#signupForm .role-btn.active')?.dataset.role || 'Student';

  if (!firstName || !email || !phone || !password) return showToast('Fill all required fields', 'error');
  if (!/^\S+@\S+\.\S+$/.test(email)) return showToast('Enter a valid email address', 'error');
  if (password !== pass2) return showToast('Passwords do not match', 'error');
  if (password.length < 6) return showToast('Password must be at least 6 characters', 'error');

  try {
    const data = await TS.api('/auth/signup', {
      method: 'POST',
      body: { firstName, lastName, email, phone, city, password, role },
    });
    S.pendingSignupEmail = email;
    enterOtpStep(email, data.devOtp);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

/* ---------------- Signup / login OTP (step 2) ---------------- */
function enterOtpStep(email, devOtp) {
  document.getElementById('authMainView').style.display = 'none';
  document.getElementById('authVerifyView').style.display = 'block';
  document.getElementById('verifyEmailLbl').textContent = email;
  clearOtp('#authVerifyView');
  showToast(
    devOtp ? `Verification code sent to ${email}: ${devOtp} (dev mode — no SMTP configured)` : `Verification code sent to ${email}`,
    'info'
  );
}
async function verifySignupOtp() {
  const code = readOtp('#authVerifyView');
  if (code.length < 6) return showToast('Enter the full 6-digit code', 'error');
  try {
    const data = await TS.api('/auth/verify-signup-otp', { method: 'POST', body: { email: S.pendingSignupEmail, code } });
    if (data.pendingApproval) {
      closeModal('authModal');
      showToast(data.message, 'warning');
      return;
    }
    closeModal('authModal');
    showToast('Email verified! Account created successfully.', 'success');
    finishLogin(data.token, data.user);
  } catch (e) {
    showToast(e.message, 'error');
  }
}
async function resendSignupOtp() {
  if (!S.pendingSignupEmail) return;
  try {
    const data = await TS.api('/auth/resend-otp', { method: 'POST', body: { email: S.pendingSignupEmail, purpose: 'signup' } });
    showToast(data.devOtp ? `New code: ${data.devOtp} (dev mode)` : 'New code sent', 'info');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

/* ---------------- Forgot password ---------------- */
async function requestPasswordReset(email) {
  try {
    const data = await TS.api('/auth/forgot-password', { method: 'POST', body: { email } });
    showToast(data.devOtp ? `Reset code: ${data.devOtp} (dev mode)` : 'Password reset link/code sent to your email', 'success');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

/* ---------------- Session bootstrap / logout ---------------- */
function finishLogin(token, user) {
  TS.setToken(token);
  S.user = user;
  S.loggedIn = true;
  S.enrolledCourses = user.enrolledCourses || [];
  closeModal('authModal');
  afterLogin();
  showPage('dashboard');
  showToast(`Welcome, ${user.firstName}!`, 'success');
}
function afterLogin() {
  const u = S.user;
  const init = getInit(u);
  document.getElementById('userAvBtn').style.display = 'flex';
  document.getElementById('userAvInit').textContent = init;
  document.getElementById('guestButtons').style.display = 'none';
  document.getElementById('sbAv').textContent = init;
  document.getElementById('sbName').textContent = getDisplayName(u);
  document.getElementById('sbRoleLbl').textContent = u.role || 'Student';
  document.getElementById('enrolledBadge').textContent = (S.enrolledCourses || []).length;
}
async function restoreSession() {
  if (!TS.getToken()) return;
  try {
    const data = await TS.api('/auth/me');
    S.user = data.user;
    S.loggedIn = true;
    S.enrolledCourses = data.user.enrolledCourses || [];
    afterLogin();
  } catch (_) {
    TS.setToken('');
  }
}
function doLogout() {
  S.loggedIn = false;
  S.user = null;
  S.enrolledCourses = [];
  TS.setToken('');
  document.getElementById('userAvBtn').style.display = 'none';
  document.getElementById('guestButtons').style.display = 'flex';
  document.getElementById('sbAv').textContent = '?';
  document.getElementById('sbName').textContent = 'Guest';
  document.getElementById('sbRoleLbl').textContent = 'Student';
  showPage('home');
  showToast('Logged out', 'info');
}
function getInit(u) {
  if (!u) return '?';
  return ((u.firstName || '').charAt(0) + (u.lastName || '').charAt(0)).toUpperCase() || (u.email || '?').charAt(0).toUpperCase();
}
function getDisplayName(u) {
  if (!u) return 'Guest';
  return [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email || 'User';
}

/* ================================================================
   ADMIN — 2-step login (username+password, then a separate OTP)
   ================================================================ */
async function adminRequestOtp() {
  const username = document.getElementById('adminUser').value.trim();
  const password = document.getElementById('adminPass').value;
  try {
    const data = await TS.api('/admin/request-otp', { method: 'POST', body: { username, password } });
    document.getElementById('adminLoginStep').style.display = 'none';
    document.getElementById('adminOtpStep').style.display = 'block';
    clearOtp('#adminOtpStep');
    showToast(data.devOtp ? `Admin OTP (dev mode): ${data.devOtp}` : 'OTP sent to the admin group email', 'info');
  } catch (e) {
    showToast(e.message, 'error');
  }
}
function adminBackToLogin() {
  document.getElementById('adminLoginStep').style.display = 'block';
  document.getElementById('adminOtpStep').style.display = 'none';
}
async function adminVerifyOtp() {
  const code = readOtp('#adminOtpStep');
  try {
    const data = await TS.api('/admin/verify-otp', { method: 'POST', body: { code } });
    TS.setAdminToken(data.token);
    S.adminAuthed = true;
    document.getElementById('adminGateView').style.display = 'none';
    document.getElementById('adminDashView').style.display = 'block';
    renderAdminDashboard();
    showToast('Admin verified — welcome!', 'success');
  } catch (e) {
    showToast(e.message, 'error');
  }
}
function adminLogout() {
  S.adminAuthed = false;
  TS.setAdminToken('');
  goAdmin();
  showToast('Exited admin dashboard', 'info');
}
