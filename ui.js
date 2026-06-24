/* js/ui.js — small shared UI utilities used by every page module */

/* ---------- Toasts ---------- */
const TI = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
function showToast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${TI[type]}"></i>${msg}`;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 280); }, 4200);
}

/* ---------- Theme ---------- */
function toggleTheme() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
  showToast(isDark ? 'Light mode on' : 'Dark mode on', 'info');
}

/* ---------- Modals ---------- */
function handleOverlay(e, id) { if (e.target === e.currentTarget) closeModal(id); }
function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.remove('active'); }
function openModal(id) { const el = document.getElementById(id); if (el) el.classList.add('active'); }

/* ---------- Password field helpers ---------- */
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
  if (v.length < 10 || !/[0-9]/.test(v)) { el.className = 'pw-str medium'; return; }
  el.className = 'pw-str strong';
}

/* ---------- OTP input boxes (auto-advance) ---------- */
function otpNext(el) {
  el.value = el.value.replace(/[^0-9]/g, '').slice(0, 1);
  if (el.value && el.nextElementSibling && el.nextElementSibling.classList.contains('otp-box')) {
    el.nextElementSibling.focus();
  }
}
function readOtp(containerSelector) {
  return Array.from(document.querySelectorAll(`${containerSelector} .otp-box`)).map((b) => b.value).join('');
}
function clearOtp(containerSelector) {
  document.querySelectorAll(`${containerSelector} .otp-box`).forEach((b) => (b.value = ''));
  const first = document.querySelector(`${containerSelector} .otp-box`);
  if (first) first.focus();
}

/* ---------- Notifications panel ---------- */
async function renderNotifications() {
  const p = document.getElementById('notifPanel');
  if (!p) return;
  let items = [
    { icon: 'fa-robot', cls: 'ni-p', title: 'AI Quiz Ready', body: 'A new quiz has been generated for you', time: '2 min ago', unread: true },
    { icon: 'fa-certificate', cls: 'ni-g', title: 'Certificate System Live', body: 'Complete a course to earn your first certificate', time: '1 hr ago', unread: true },
    { icon: 'fa-video', cls: 'ni-b', title: 'Live Class Today', body: "Check the Live page for today's sessions", time: '25 min ago', unread: false },
    { icon: 'fa-trophy', cls: 'ni-y', title: 'Gamification Enabled', body: 'Earn XP and badges as you learn', time: '3 hr ago', unread: false },
  ];
  if (S.loggedIn) {
    try {
      const data = await TS.api('/notifications');
      if (data.notifications) items = data.notifications.map((n) => ({ ...n, cls: 'ni-b' }));
    } catch (_) { /* fall back to demo items */ }
  }
  p.innerHTML = `<div class="ni-hdr"><span style="font-weight:700;font-size:13px">Notifications</span><span style="font-size:11px;color:var(--accent);cursor:pointer" onclick="markAllRead()">Mark all read</span></div>
  ${items.map((n) => `<div class="notif-item ${n.unread ? 'unread' : ''}"><div class="ni-ico ${n.cls}"><i class="fas ${n.icon}"></i></div><div><div style="font-size:12px;font-weight:700">${n.title}</div><div style="font-size:11px;color:var(--text2)">${n.body}</div><div style="font-size:10px;color:var(--text2)">${n.time}</div></div></div>`).join('')}`;
}
function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach((i) => i.classList.remove('unread'));
  const badge = document.getElementById('notifBadge');
  if (badge) badge.style.display = 'none';
  showToast('All read', 'success');
}
function toggleNotif() {
  S.notifOpen = !S.notifOpen;
  document.getElementById('notifPanel').classList.toggle('open', S.notifOpen);
}
document.addEventListener('click', (e) => {
  if (S.notifOpen && !e.target.closest('#notifPanel') && !e.target.closest('#notifBtn')) {
    S.notifOpen = false;
    document.getElementById('notifPanel').classList.remove('open');
  }
});
