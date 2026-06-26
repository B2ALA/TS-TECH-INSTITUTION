/* ============================================================
   js/main.js — load LAST, after all other modules.
   Boot sequence: check maintenance -> restore session -> route.
   ============================================================ */

const S = { user: null, profile: null, loggedIn: false, currentPage: 'home' };

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Restore session if one exists
  const session = await Auth.getSession();
  if (session.ok) {
    S.user = session.user;
    S.profile = session.profile;
    S.loggedIn = true;
    afterLogin();
  }

  // 2. Maintenance check (admins bypass)
  const isAdmin = S.loggedIn && S.profile.role === 'admin';
  await Maintenance.applyMaintenanceState(isAdmin);
  Maintenance.subscribeMaintenance(isAdmin);

  // 3. React to login/logout elsewhere (e.g. email link confirmation)
  Auth.onAuthChange(async (event) => {
    if (event === 'SIGNED_OUT') {
      S.loggedIn = false; S.user = null; S.profile = null;
      showPage('home');
    }
  });

  // 4. Initial page render
  renderCoursesGrid();
});

function afterLogin() {
  const init = ((S.profile.first_name || '?')[0] + (S.profile.last_name || '')[0]).toUpperCase();
  document.getElementById('userAvBtn').style.display = 'flex';
  document.getElementById('userAvInit').textContent = init;
  document.getElementById('guestButtons').style.display = 'none';
  document.getElementById('sbAv').textContent = init;
  document.getElementById('sbName').textContent = [S.profile.first_name, S.profile.last_name].filter(Boolean).join(' ');
}

async function doLogin() {
  const res = await Auth.signIn({
    email: document.getElementById('loginEmail').value.trim(),
    password: document.getElementById('loginPass').value,
  });
  if (!res.ok) { showToast(res.error, 'error'); return; }
  S.user = res.user; S.profile = res.profile; S.loggedIn = true;
  afterLogin();
  closeModal('authModal');
  showPage('dashboard');
}

async function doSignup() {
  const roleBtn = document.querySelector('#signupForm .role-btn.active');
  const role = roleBtn && roleBtn.textContent.toLowerCase().includes('instructor') ? 'instructor' : 'student';
  const res = await Auth.signUp({
    firstName: document.getElementById('regFname').value.trim(),
    lastName: document.getElementById('regLname').value.trim(),
    email: document.getElementById('regEmail').value.trim(),
    phone: document.getElementById('regPhone').value.trim(),
    city: document.getElementById('regCity').value.trim(),
    password: document.getElementById('regPass').value,
    role,
  });
  if (!res.ok) { showToast(res.error, 'error'); return; }
  closeModal('authModal');
  showToast(res.notice, 'success');
}

async function doLogout() {
  await Auth.signOut();
  S.loggedIn = false; S.user = null; S.profile = null;
  document.getElementById('userAvBtn').style.display = 'none';
  document.getElementById('guestButtons').style.display = 'flex';
  showPage('home');
  showToast('Logged out', 'info');
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + name);
  if (pg) pg.classList.add('active');
  S.currentPage = name;
  window.scrollTo(0, 0);

  if (name === 'dashboard') {
    if (!S.loggedIn) { openAuth('login'); return; }
    Dashboard.renderOverview(S.user, S.profile);
  }
  if (name === 'admin') {
    AdminAPI.requireAdmin().then(p => { if (p) renderAdminPage(p); });
  }
}

function openAuth(tab) { document.getElementById('authModal').classList.add('active'); switchAuth(tab); }
function switchAuth(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
}
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

const TI = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
function showToast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${TI[type]}"></i>${msg}`;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 280); }, 3400);
}
