/* ============================================================
   APP.JS — navigation, courses, dashboard, forum, live, chatbot
   ============================================================ */

const S = { courses: [], wishlist: new Set(), sortMode: 'newest', chatLang: 'en', chatWarnings: 0, liveTab: 'live' };

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadCourses();
  renderForum();
  renderLive('live');
  chatWelcome();
  document.addEventListener('click', e => {
    if (!e.target.closest('#notifPanel') && !e.target.closest('#notifBtn')) {
      document.getElementById('notifPanel')?.classList.remove('open');
    }
  });
});

/* ===================== THEME ===================== */
function loadTheme() {
  const saved = localStorage.getItem('ts_theme') || 'dark';
  document.documentElement.dataset.theme = saved;
  document.getElementById('themeIcon').className = saved === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('ts_theme', next);
  document.getElementById('themeIcon').className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

/* ===================== PAGE NAV ===================== */
function showPage(n) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + n)?.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === n));
  window.scrollTo(0, 0);

  if (n === 'dashboard') {
    if (!AUTH.session) { openAuth('login'); return; }
    switchDash(null, 'overview');
  }
  if (n === 'profile') {
    if (!AUTH.session) { openAuth('login'); return; }
    renderProfilePage();
  }
}
function toggleMob() { document.getElementById('mobMenu').classList.toggle('open'); document.getElementById('mobOverlay').classList.toggle('open'); }
function closeMob() { document.getElementById('mobMenu').classList.remove('open'); document.getElementById('mobOverlay').classList.remove('open'); }
function setMbn(el) { document.querySelectorAll('.mbnav-btn').forEach(b => b.classList.remove('active')); el.classList.add('active'); }
function handleOverlay(e, id) { if (e.target === e.currentTarget) closeModal(id); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function toggleNotif() {
  const p = document.getElementById('notifPanel');
  const open = p.classList.toggle('open');
  if (open && !p.dataset.loaded) {
    p.innerHTML = `<div class="ni-hdr">Notifications</div><div class="empty-notif">You're all caught up.</div>`;
    p.dataset.loaded = '1';
  }
}

/* ===================== COURSE CATEGORY → BANNER STYLE ===================== */
const CAT_THEME = {
  'Computer Science / IT': '#2563eb',
  'Embedded Systems & IoT': '#0891b2',
  'Electronics': '#059669',
  'Automotive': '#7c3aed',
  'Data Science & AI': '#e94560',
  'Web Development': '#0f3460',
  'Cloud & DevOps': '#0891b2',
  'Cybersecurity': '#dc2626',
};
function bannerLabel(course) {
  // e.g. "Data Science & AI" → "DATA SCIENCE & AI BY TS TECH PARK"
  return course.template_label || `${(course.category || course.title).toUpperCase()} BY TS TECH PARK`;
}

/* ===================== COURSES (live from Supabase) ===================== */
async function loadCourses() {
  try {
    const { data, error } = await supabaseClient
      .from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false });
    if (error) throw error;
    S.courses = data || [];
  } catch (err) {
    console.error('loadCourses error:', err);
    S.courses = [];
  }
  populateCategoryFilter();
  renderCourses(S.courses);
  document.getElementById('hsCourses') && (document.getElementById('hsCourses').textContent = S.courses.length);
  loadStudentCount();
}
async function loadStudentCount() {
  try {
    const { count } = await supabaseClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
    if (document.getElementById('hsStudents')) document.getElementById('hsStudents').textContent = (count || 0) + '+';
  } catch (_) {}
}
function populateCategoryFilter() {
  const sel = document.getElementById('catFilter');
  if (!sel) return;
  const cats = [...new Set(S.courses.map(c => c.category).filter(Boolean))];
  sel.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option>${c}</option>`).join('');
}
function renderCourses(data) {
  const grid = document.getElementById('coursesGrid');
  const res = document.getElementById('coursesRes');
  if (res) res.textContent = `Showing ${data.length} course${data.length !== 1 ? 's' : ''}`;
  if (!grid) return;
  if (!data.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-book"></i><p>No courses published yet. Check back soon, or sign up as an instructor to add the first one.</p></div>`;
    return;
  }
  grid.innerHTML = data.map(c => {
    const bg = CAT_THEME[c.category] || '#0891b2';
    return `<div class="cc" onclick="openCourseModal('${c.id}')">
      <div class="cc-thumb" style="background:linear-gradient(135deg,${bg},${bg}99)">
        <span class="cc-thumb-label">${bannerLabel(c)}</span>
        <button class="cc-wish ${S.wishlist.has(c.id) ? 'active' : ''}" onclick="event.stopPropagation();toggleWish('${c.id}',this)"><i class="fas fa-heart"></i></button>
      </div>
      <div class="cc-body">
        <div class="cc-cat">${c.category || ''}</div>
        <div class="cc-title">${c.title}</div>
        <div class="cc-desc">${(c.description || '').substring(0, 80)}${(c.description || '').length > 80 ? '…' : ''}</div>
        <div class="cc-meta"><span><i class="fas fa-clock"></i>${c.hours || 0}h</span><span><i class="fas fa-signal"></i>${c.level || ''}</span></div>
        <div class="cc-footer">
          <div class="cc-price">${c.price > 0 ? '₹' + Number(c.price).toLocaleString() : 'Free'}</div>
          <button class="btn-enroll" onclick="event.stopPropagation();openCourseModal('${c.id}')">View Course</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function filterCourses() {
  const q = (document.getElementById('courseSearch')?.value || '').toLowerCase();
  const cat = document.getElementById('catFilter')?.value || '';
  const level = document.getElementById('levelFilter')?.value || '';
  let data = S.courses.filter(c =>
    (!q || c.title.toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q)) &&
    (!cat || c.category === cat) && (!level || c.level === level));
  if (S.sortMode === 'price_asc') data.sort((a, b) => a.price - b.price);
  if (S.sortMode === 'price_desc') data.sort((a, b) => b.price - a.price);
  renderCourses(data);
}
function toggleSort() {
  const modes = ['newest', 'price_asc', 'price_desc'];
  const labels = ['Newest', 'Price ↑', 'Price ↓'];
  const idx = (modes.indexOf(S.sortMode) + 1) % modes.length;
  S.sortMode = modes[idx];
  document.getElementById('sortBtn').innerHTML = `<i class="fas fa-sort"></i> ${labels[idx]}`;
  filterCourses();
}
function toggleWish(id, btn) {
  if (S.wishlist.has(id)) { S.wishlist.delete(id); btn.classList.remove('active'); showToast('Removed from wishlist', 'info'); }
  else { S.wishlist.add(id); btn.classList.add('active'); showToast('Added to wishlist', 'success'); }
}

/* ===================== COURSE MODAL (curriculum / video / dummy payment) ===================== */
async function openCourseModal(id) {
  const c = S.courses.find(x => x.id === id);
  if (!c) return;
  const bg = CAT_THEME[c.category] || '#0891b2';

  let lessons = [];
  try {
    const { data } = await supabaseClient.from('lessons').select('*').eq('course_id', id).order('order_index');
    lessons = data || [];
  } catch (_) {}

  document.getElementById('courseModalBody').innerHTML = `
    <div class="cm-thumb" style="background:linear-gradient(135deg,${bg},${bg}99)">
      <span class="cc-thumb-label" style="font-size:18px">${bannerLabel(c)}</span>
      ${lessons[0]?.type === 'video' ? `<div class="cm-play" onclick="openVideoFromLesson('${lessons[0].content_url}','${lessons[0].title}')"><i class="fas fa-play"></i></div>` : ''}
    </div>
    <div class="cm-body">
      <div style="display:flex;gap:7px;margin-bottom:8px;flex-wrap:wrap"><span class="cc-cat" style="margin:0">${c.category || ''}</span><span style="background:${bg}22;color:${bg};padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700">${c.level || ''}</span></div>
      <div class="cm-title">${c.title}</div>
      <div class="cm-desc">${c.description || 'No description provided yet.'}</div>
      <div class="cm-tabs">
        <button class="cm-tab active" onclick="cmTab(this,'cmCur')">Curriculum</button>
        <button class="cm-tab" onclick="cmTab(this,'cmPay')">Enroll</button>
        <button class="cm-tab" onclick="cmTab(this,'cmInfo')">Info</button>
      </div>
      <div id="cmCur" class="cm-tab-body active">
        ${lessons.length ? lessons.map((l, i) => `<div class="cur-item" ${l.type === 'video' ? `onclick="openVideoFromLesson('${l.content_url}','${l.title}')"` : ''} style="cursor:${l.type === 'video' ? 'pointer' : 'default'}"><i class="fas fa-${l.type === 'video' ? 'play-circle' : l.type === 'pdf' ? 'file-pdf' : l.type === 'ppt' ? 'file-powerpoint' : 'tasks'}"></i><span>${l.title}</span></div>`).join('') : '<p style="color:var(--text2);font-size:12px">Curriculum is being prepared by the instructor.</p>'}
      </div>
      <div id="cmPay" class="cm-tab-body">
        <div class="dummy-tag"><i class="fas fa-flask"></i> Demo payment — no real money is charged</div>
        <div style="font-size:1.6rem;font-weight:800;color:var(--accent);margin-bottom:4px">${c.price > 0 ? '₹' + Number(c.price).toLocaleString() : 'Free'}</div>
        <div style="font-size:11px;color:var(--text2);margin-bottom:6px">Lifetime access · Certificate on completion</div>
        <div class="pay-opts" id="payOpts">
          <label class="pay-opt sel"><input type="radio" name="pm" value="upi" checked style="margin-right:4px">UPI</label>
          <label class="pay-opt"><input type="radio" name="pm" value="card" style="margin-right:4px">Card</label>
          <label class="pay-opt"><input type="radio" name="pm" value="netbanking" style="margin-right:4px">Net Banking</label>
          <label class="pay-opt"><input type="radio" name="pm" value="cash" style="margin-right:4px">Cash</label>
        </div>
        <button class="btn-full btn-accent" style="margin-top:8px" onclick="dummyCheckout('${c.id}',${c.price || 0})">
          ${c.price > 0 ? 'Pay (Demo) & Enroll — ₹' + Number(c.price).toLocaleString() : 'Enroll Free'}
        </button>
      </div>
      <div id="cmInfo" class="cm-tab-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px">
          <div><strong><i class="fas fa-clock" style="color:var(--accent)"></i> Duration</strong><div style="color:var(--text2);margin-top:2px">${c.hours || 0} hours</div></div>
          <div><strong><i class="fas fa-signal" style="color:var(--accent)"></i> Level</strong><div style="color:var(--text2);margin-top:2px">${c.level || '—'}</div></div>
          <div><strong><i class="fas fa-certificate" style="color:var(--accent)"></i> Certificate</strong><div style="color:var(--text2);margin-top:2px">Yes, QR-verified</div></div>
        </div>
      </div>
    </div>`;

  document.querySelectorAll('#payOpts .pay-opt').forEach(opt => {
    opt.addEventListener('click', () => { document.querySelectorAll('#payOpts .pay-opt').forEach(o => o.classList.remove('sel')); opt.classList.add('sel'); });
  });
  document.getElementById('courseModal').classList.add('active');
}
function cmTab(btn, id) {
  const b = btn.closest('.cm-body');
  b.querySelectorAll('.cm-tab').forEach(t => t.classList.remove('active'));
  b.querySelectorAll('.cm-tab-body').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(id).classList.add('active');
}
function openVideoFromLesson(url, title) {
  if (!url) return;
  const ytMatch = url.match(/(?:youtu\.be\/|v=)([\w-]+)/);
  const embed = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` : url;
  document.getElementById('videoModalBody').innerHTML = `<div class="vid-wrap"><iframe src="${embed}" allow="autoplay;encrypted-media;picture-in-picture" allowfullscreen></iframe></div><div class="vid-info"><h3>${title}</h3></div>`;
  document.getElementById('videoModal').classList.add('active');
}
function stopVideo() { document.getElementById('videoModalBody').innerHTML = ''; }

/* ===================== DUMMY CHECKOUT ===================== */
async function dummyCheckout(courseId, amount) {
  if (!AUTH.session) { closeModal('courseModal'); openAuth('login'); return; }
  const method = document.querySelector('#payOpts input[name="pm"]:checked')?.value || 'dummy';
  try {
    await apiFetch('/payments/checkout', { method: 'POST', body: JSON.stringify({ course_id: courseId, amount, method }) });
    closeModal('courseModal');
    showToast('Payment successful (demo) — course unlocked!', 'success');
  } catch (err) {
    showToast(err.message || 'Checkout failed', 'error');
  }
}

/* ===================== DASHBOARD ===================== */
function switchDash(btn, sec) {
  document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const fns = { overview: renderOverview, mycourses: renderMyCourses, quizzes: renderQuizzesStub,
    certificates: renderCertsStub, gamification: renderGamification, leaderboard: renderLeaderboardStub,
    payments: renderPayments, settings: renderSettings };
  (fns[sec] || renderOverview)();
}
async function renderOverview() {
  const main = document.getElementById('dashMain');
  main.innerHTML = `<div class="dash-hdr"><div><h2>Welcome back, ${AUTH.profile?.first_name || ''}!</h2><p>Here's where your learning stands today.</p></div></div><div id="ovBody"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i></div></div>`;

  const { data: enrollments } = await supabaseClient
    .from('enrollments').select('*, courses(*)').eq('student_id', AUTH.profile.id);
  const myCourses = (enrollments || []).map(e => e.courses).filter(Boolean);

  document.getElementById('ovBody').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card sc1"><div class="sc-val">${myCourses.length}</div><div class="sc-lbl">Enrolled Courses</div></div>
      <div class="stat-card sc2"><div class="sc-val">${(AUTH.profile.hours_learned || 0)}h</div><div class="sc-lbl">Hours Learned</div></div>
      <div class="stat-card sc3"><div class="sc-val">${AUTH.profile.xp || 0}</div><div class="sc-lbl">XP Points</div></div>
      <div class="stat-card sc4"><div class="sc-val">0</div><div class="sc-lbl">Certificates</div></div>
    </div>
    <div class="dash-card">
      <div class="dc-title">Continue Learning <a onclick="switchDash(null,'mycourses')" style="font-size:11px">View all</a></div>
      ${myCourses.length === 0 ? `<div class="empty-state" style="padding:1.5rem"><i class="fas fa-book"></i><p>No courses enrolled yet.</p><button class="btn-enroll" onclick="showPage('courses')">Browse Courses</button></div>` :
        (enrollments || []).map(e => `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
          <div style="flex:1;min-width:0"><div style="font-weight:600;font-size:12px">${e.courses.title}</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text2)"><div class="prog-bar" style="flex:1"><div class="prog-fill" style="width:${e.progress || 0}%"></div></div>${e.progress || 0}%</div></div>
          <button class="btn-enroll" onclick="openCourseModal('${e.course_id}')">Open</button></div>`).join('')}
    </div>`;
}
async function renderMyCourses() {
  const main = document.getElementById('dashMain');
  main.innerHTML = `<div class="dash-hdr"><div><h2>My Courses</h2></div><button class="btn-sm btn-primary" onclick="showPage('courses')"><i class="fas fa-plus"></i> Browse More</button></div><div id="mcBody"></div>`;
  const { data } = await supabaseClient.from('enrollments').select('*, courses(*)').eq('student_id', AUTH.profile.id);
  const list = (data || []).filter(e => e.courses);
  document.getElementById('mcBody').innerHTML = list.length === 0
    ? `<div class="empty-state"><i class="fas fa-book-open"></i><p>No courses yet. Browse and enroll!</p><button class="btn-enroll" onclick="showPage('courses')">Browse Courses</button></div>`
    : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:13px">${list.map(e => {
        const c = e.courses; const bg = CAT_THEME[c.category] || '#0891b2';
        return `<div class="cc" onclick="openCourseModal('${c.id}')"><div class="cc-thumb" style="background:linear-gradient(135deg,${bg},${bg}99);min-height:70px"><span class="cc-thumb-label" style="font-size:12px">${bannerLabel(c)}</span></div><div class="cc-body"><div class="cc-title">${c.title}</div><div class="prog-bar" style="margin:9px 0"><div class="prog-fill" style="width:${e.progress || 0}%"></div></div><button class="btn-enroll" style="width:100%">Resume</button></div></div>`;
      }).join('')}</div>`;
}
function renderQuizzesStub() {
  document.getElementById('dashMain').innerHTML = `<div class="dash-hdr"><div><h2>Quizzes</h2><p>Coming online once your instructor publishes a quiz.</p></div></div><div class="empty-state"><i class="fas fa-clipboard-check"></i><p>No quizzes available yet.</p></div>`;
}
function renderCertsStub() {
  document.getElementById('dashMain').innerHTML = `<div class="dash-hdr"><div><h2>Certificates</h2></div></div><div class="empty-state"><i class="fas fa-certificate"></i><p>Complete a course to earn your first certificate.</p></div>`;
}
function renderGamification() {
  document.getElementById('dashMain').innerHTML = `<div class="dash-hdr"><div><h2>Badges & XP</h2></div></div>
  <div class="dash-card" style="text-align:center;max-width:320px"><div style="font-size:2.2rem;font-weight:800;color:var(--gold);font-family:'Space Grotesk',sans-serif">${AUTH.profile.xp || 0}</div><div style="font-size:12px;color:var(--text2);margin-top:3px">Total XP</div></div>`;
}
function renderLeaderboardStub() {
  document.getElementById('dashMain').innerHTML = `<div class="dash-hdr"><div><h2>Leaderboard</h2></div></div><div class="empty-state"><i class="fas fa-ranking-star"></i><p>Leaderboard fills in as more students earn XP.</p></div>`;
}
async function renderPayments() {
  const main = document.getElementById('dashMain');
  main.innerHTML = `<div class="dash-hdr"><div><h2>Payment History</h2><p>All your enrollments and demo transactions</p></div></div><div id="payBody"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i></div></div>`;
  try {
    const rows = await apiFetch('/payments/history');
    document.getElementById('payBody').innerHTML = !rows.length
      ? `<div class="empty-state"><i class="fas fa-receipt"></i><p>No payments yet.</p></div>`
      : `<div class="dash-card" style="overflow-x:auto"><table class="pay-table"><thead><tr><th>Course</th><th>Amount</th><th>Method</th><th>Reference</th><th>Date & Time</th><th>Status</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td>${r.courses?.title || '—'}</td><td style="font-weight:700;color:var(--accent)">₹${Number(r.amount).toLocaleString()}</td><td style="text-transform:uppercase">${r.method}</td><td>${r.reference_id}</td><td>${new Date(r.paid_at).toLocaleString('en-IN')}</td><td><span class="s-pill sp-success">${r.status.toUpperCase()}</span></td></tr>`).join('')}
        </tbody></table></div>`;
  } catch (err) {
    document.getElementById('payBody').innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
  }
}
function renderSettings() {
  const u = AUTH.profile || {};
  document.getElementById('dashMain').innerHTML = `<div class="dash-hdr"><div><h2>Settings</h2></div></div>
  <div class="dash-card" style="max-width:480px">
    <div class="form-group"><label class="form-label">First Name</label><input class="form-input" id="sFname" value="${u.first_name || ''}"></div>
    <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" id="sLname" value="${u.last_name || ''}"></div>
    <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="sPhone" value="${u.phone || ''}"></div>
    <div class="form-group"><label class="form-label">City</label><input class="form-input" id="sCity" value="${u.city || ''}"></div>
    <button class="btn-enroll" onclick="saveSettings()">Save Changes</button>
  </div>`;
}
async function saveSettings() {
  const updates = {
    first_name: document.getElementById('sFname').value.trim(),
    last_name: document.getElementById('sLname').value.trim(),
    phone: document.getElementById('sPhone').value.trim(),
    city: document.getElementById('sCity').value.trim(),
  };
  const { error } = await supabaseClient.from('profiles').update(updates).eq('id', AUTH.profile.id);
  if (error) return showToast(error.message, 'error');
  AUTH.profile = { ...AUTH.profile, ...updates };
  applyLoggedInUI(AUTH.profile);
  showToast('Profile saved!', 'success');
}

/* ===================== PROFILE PAGE ===================== */
function renderProfilePage() {
  const u = AUTH.profile; if (!u) return;
  const init = ((u.first_name || '?')[0] + (u.last_name || '')[0]).toUpperCase();
  document.getElementById('profAv').textContent = init;
  document.getElementById('profName').textContent = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email;
  document.getElementById('profTagline').textContent = [u.role, u.city].filter(Boolean).join(' · ');
  document.getElementById('profEmail').innerHTML = `<i class="fas fa-envelope"></i> ${u.email}`;
  document.getElementById('profJoined').innerHTML = `<i class="fas fa-calendar"></i> Joined ${new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;
  document.getElementById('profStats').innerHTML = [
    { l: 'Hours', v: (u.hours_learned || 0) + 'h' }, { l: 'XP', v: u.xp || 0 }, { l: 'Streak', v: (u.streak || 1) + ' days' },
  ].map(s => `<div class="psl-item"><span>${s.l}</span><span class="psl-val">${s.v}</span></div>`).join('');
  document.getElementById('profCerts').innerHTML = `<div class="empty-state" style="padding:1rem"><i class="fas fa-certificate"></i><p style="font-size:11px">No certificates yet</p></div>`;
}

/* ===================== FORUM (live from Supabase) ===================== */
async function renderForum(filter = '') {
  const c = document.getElementById('forumPosts'); if (!c) return;
  try {
    const { data } = await supabaseClient.from('forum_posts').select('*, profiles(first_name,last_name)').order('created_at', { ascending: false }).limit(30);
    let posts = data || [];
    if (filter) posts = posts.filter(p => p.title.toLowerCase().includes(filter.toLowerCase()) || (p.content || '').toLowerCase().includes(filter.toLowerCase()));
    c.innerHTML = posts.length === 0 ? `<div class="empty-state"><i class="fas fa-comments"></i><p>No posts yet. Be the first to ask a question!</p></div>` :
      posts.map(p => {
        const name = [p.profiles?.first_name, p.profiles?.last_name].filter(Boolean).join(' ') || 'Member';
        const av = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        return `<div class="fp"><div class="fp-hdr"><div class="fp-av" style="background:var(--accent2)">${av}</div><div><div class="fp-name">${name}</div><div class="fp-time">${new Date(p.created_at).toLocaleDateString()}</div></div><span class="fp-cat" style="background:rgba(0,194,214,.12);color:var(--accent)">${p.category || 'General'}</span></div><div class="fp-title">${p.title}</div><div class="fp-text">${p.content || ''}</div><div><button class="fp-act"><i class="fas fa-heart"></i> ${p.likes || 0}</button></div></div>`;
      }).join('');
  } catch (err) {
    c.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}
function openNewPost() { if (!AUTH.session) { openAuth('login'); return; } document.getElementById('postModal').classList.add('active'); }
async function submitPost() {
  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const category = document.getElementById('postCat').value;
  if (!title || !content) return showToast('Fill title and content', 'error');
  const { error } = await supabaseClient.from('forum_posts').insert({ user_id: AUTH.profile.id, title, content, category });
  if (error) return showToast(error.message, 'error');
  closeModal('postModal');
  document.getElementById('postTitle').value = ''; document.getElementById('postContent').value = '';
  renderForum();
  showToast('Published!', 'success');
}

/* ===================== LIVE CLASSES (live from Supabase) ===================== */
async function renderLive(tab) {
  S.liveTab = tab;
  const c = document.getElementById('liveContent'); if (!c) return;
  try {
    const { data } = await supabaseClient.from('live_classes').select('*').eq('status', tab).order('scheduled_at', { ascending: true });
    const list = data || [];
    c.innerHTML = !list.length ? `<div class="empty-state"><i class="fas fa-video"></i><p>No sessions here right now.</p></div>` :
      list.map(lc => `<div class="lcc"><div class="lc-ico"><i class="fas fa-${tab === 'recorded' ? 'film' : 'broadcast-tower'}"></i></div><div style="flex:1">${tab === 'live' ? '<div class="lc-live"><div class="ldot"></div>LIVE NOW</div>' : ''}<div style="font-weight:700;font-size:13px">${lc.title}</div><div style="font-size:11px;color:var(--text2);margin-top:2px">${lc.scheduled_at ? new Date(lc.scheduled_at).toLocaleString('en-IN') : ''}</div></div><a class="btn-enroll" href="${lc.meeting_url}" target="_blank" rel="noopener">${tab === 'live' ? 'Join' : tab === 'recorded' ? 'Watch' : 'Details'}</a></div>`).join('');
  } catch (err) {
    c.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}
function setLiveTab(btn, tab) { document.querySelectorAll('.ltab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderLive(tab); }

/* ===================== CHATBOT — rule-based, multilingual ===================== */
const BAD_WORDS = ['stupid','idiot','fool','dumb','hate','kill','shutup','fuck','shit','bastard','bitch','die','suck','moron','crap','useless','ugly','racist'];

const CHAT_QA = {
  en: {
    welcome: "Hi! I'm <strong>TechBot</strong>, your AI assistant at TS Tech Park. Ask me about courses, fees, batches, or just say hello!",
    pairs: [
      [['hi','hello','hey'], "Hello! How can I help you today?"],
      [['how are you'], "I'm doing well. How are you?"],
      [['what is your name','who are you'], "I am an AI assistant here to help you."],
      [['good morning'], "Good morning! Hope you have a great day."],
      [['good night'], "Good night! Sleep well."],
      [['thank you','thanks'], "You're welcome!"],
      [['bye','goodbye'], "Goodbye! Have a nice day."],
      [['what can you do'], "I can answer questions, provide information, and assist with various tasks."],
      [['can you speak tamil'], "Yes, I can communicate in Tamil."],
      [['can you speak telugu'], "Yes, I can communicate in Telugu."],
      [['can you speak hindi'], "Yes, I can communicate in Hindi."],
      [['can you speak english'], "Yes, I can communicate in English."],
      [['tell me a joke'], "Why did the computer go to the doctor? Because it had a virus!"],
      [['i am bored'], "Would you like to hear a joke, take a quiz, or learn something new?"],
      [['i am sad'], "I'm sorry you're feeling sad. Would you like to talk about it?"],
      [['what is the time'], "Please check your device's clock for the current time."],
      [['what is today\'s date','what is the date'], "Please check your device calendar for the current date."],
      [['can bus'], "CAN (Controller Area Network) is a Bosch protocol for automotive ECU communication — multi-master, up to 8 Mbps with CAN FD, differential signaling."],
      [['rtos'], "RTOS (Real-Time Operating System) guarantees task execution within strict deadlines — used in FreeRTOS, Zephyr, VxWorks."],
      [['fee','fees','cost','price'], "Course fees vary by program — open any course card on the Courses page to see the exact price and demo payment options."],
      [['batch','batches'], "New batches open regularly — check the Live page for upcoming sessions, or the Courses page for enrollment."],
      [['certificate'], "TS Tech Park certificates are QR-verified and shareable to LinkedIn, issued after course completion."],
      [['career','placement','job'], "Our courses are built around real industry skills — check each course's curriculum tab to see what roles it prepares you for."],
      [['contact'], "Reach us at info@tstechpark.com — we typically respond within a day."],
    ],
    fallback: "Good question! Could you rephrase that, or ask me about courses, fees, batches, or certificates?",
    warn1: "⚠️ Please keep our conversation respectful and educational.",
    warn2: "⚠️ Second warning: please maintain a respectful tone.",
    warn3: "⚠️ Conversation flagged for inappropriate content. Please contact support.",
  },
  ta: {
    welcome: "வணக்கம்! நான் <strong>TechBot</strong>, TS Tech Park இன் AI உதவியாளர். கோர்ஸ், கட்டணம் பற்றி கேளுங்கள்!",
    pairs: [
      [['வணக்கம்'], "வணக்கம்! உங்களுக்கு எப்படி உதவலாம்?"],
      [['எப்படி இருக்கிறீர்கள்'], "நான் நன்றாக இருக்கிறேன். நீங்கள் எப்படி இருக்கிறீர்கள்?"],
      [['உங்கள் பெயர் என்ன'], "நான் ஒரு AI உதவியாளர்."],
      [['காலை வணக்கம்'], "காலை வணக்கம்! உங்கள் நாள் இனிதாக அமையட்டும்."],
      [['நன்றி'], "உங்களுக்கு வரவேற்பு!"],
      [['மீண்டும் சந்திப்போம்'], "சரி, மீண்டும் சந்திப்போம். நல்ல நாளாக இருக்கட்டும்."],
      [['நீங்கள் என்ன செய்ய முடியும்'], "கேள்விகளுக்கு பதில் அளிக்கவும், தகவல் வழங்கவும், பல்வேறு பணிகளில் உதவவும் முடியும்."],
    ],
    fallback: "அருமையான கேள்வி! கொஞ்சம் விரிவாக கேட்கலாமா?",
    warn1: "⚠️ மரியாதையான உரையாடலை பேணவும்.",
    warn2: "⚠️ இரண்டாம் எச்சரிக்கை.",
    warn3: "⚠️ தகாத உள்ளடக்கம். Support ஐ தொடர்பு கொள்ளவும்.",
  },
  te: {
    welcome: "నమస్కారం! నేను <strong>TechBot</strong>, TS Tech Park AI సహాయకుడు. కోర్సులు, ఫీజుల గురించి అడగండి!",
    pairs: [
      [['నమస్కారం'], "నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?"],
      [['మీరు ఎలా ఉన్నారు'], "నేను బాగున్నాను. మీరు ఎలా ఉన్నారు?"],
      [['మీ పేరు ఏమిటి'], "నేను ఒక AI సహాయకుడిని."],
      [['శుభోదయం'], "శుభోదయం! మీ రోజు ఆనందంగా ఉండాలి."],
      [['ధన్యవాదాలు'], "స్వాగతం!"],
      [['వీడ్కోలు'], "వీడ్కోలు! మీ రోజు శుభంగా గడవాలి."],
    ],
    fallback: "మంచి ప్రశ్న! మరింత నిర్దిష్టంగా అడగగలరా?",
    warn1: "⚠️ దయచేసి గౌరవప్రదమైన సంభాషణ నిర్వహించండి.",
    warn2: "⚠️ రెండవ హెచ్చరిక.",
    warn3: "⚠️ అనుచితమైన కంటెంట్. Support ను సంప్రదించండి.",
  },
  hi: {
    welcome: "नमस्ते! मैं <strong>TechBot</strong> हूं, TS Tech Park का AI सहायक। कोर्स, फीस के बारे में पूछें!",
    pairs: [
      [['नमस्ते'], "नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ?"],
      [['आप कैसे हैं'], "मैं ठीक हूँ। आप कैसे हैं?"],
      [['आपका नाम क्या है'], "मैं एक AI सहायक हूँ।"],
      [['धन्यवाद'], "आपका स्वागत है।"],
      [['अलविदा'], "अलविदा! आपका दिन शुभ हो।"],
    ],
    fallback: "अच्छा सवाल! थोड़ा विस्तार से बताएं?",
    warn1: "⚠️ कृपया सम्मानजनक बातचीत बनाए रखें।",
    warn2: "⚠️ दूसरी चेतावनी।",
    warn3: "⚠️ अनुचित सामग्री। Support से संपर्क करें।",
  },
};

function chatWelcome() { addBotMsg((CHAT_QA[S.chatLang] || CHAT_QA.en).welcome); }
function setChatLang(lang) { S.chatLang = lang; document.getElementById('chatMsgs').innerHTML = ''; S.chatWarnings = 0; chatWelcome(); }
function toggleChat() {
  const open = document.getElementById('chatPanel').classList.toggle('open');
  document.getElementById('chatIcon').className = open ? 'fas fa-times' : 'fas fa-robot';
  if (open) document.getElementById('chatInput').focus();
}
function clearChat() { document.getElementById('chatMsgs').innerHTML = ''; S.chatWarnings = 0; chatWelcome(); }
function autoResizeChat(el) { el.style.height = ''; el.style.height = Math.min(el.scrollHeight, 80) + 'px'; }
function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function scrollChat() { const m = document.getElementById('chatMsgs'); m.scrollTop = m.scrollHeight; }
function addBotMsg(html) {
  const m = document.getElementById('chatMsgs'); const d = document.createElement('div');
  d.className = 'cmr'; d.innerHTML = `<div class="msg-av-sm bot-av-sm"><i class="fas fa-robot" style="font-size:8px"></i></div><div class="msg-bubble bot-bub">${html}</div>`;
  m.appendChild(d); scrollChat();
}
function addUserMsg(text) {
  const m = document.getElementById('chatMsgs'); const d = document.createElement('div');
  d.className = 'cmr user'; d.innerHTML = `<div class="msg-bubble user-bub">${escHtml(text)}</div><div class="msg-av-sm user-av-sm">U</div>`;
  m.appendChild(d); scrollChat();
}
function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim(); if (!msg) return;
  input.value = ''; input.style.height = '';
  const lower = msg.toLowerCase();

  if (BAD_WORDS.some(w => lower.includes(w))) {
    S.chatWarnings++;
    addUserMsg(msg);
    const lang = CHAT_QA[S.chatLang] || CHAT_QA.en;
    const wm = S.chatWarnings === 1 ? lang.warn1 : S.chatWarnings === 2 ? lang.warn2 : lang.warn3;
    setTimeout(() => addBotMsg(`<div class="warn-msg"><i class="fas fa-exclamation-triangle"></i> ${wm}</div>`), 400);
    return;
  }
  addUserMsg(msg);
  setTimeout(() => addBotMsg(getBotReply(lower)), 450);
}
function sendSugg(text) { document.getElementById('chatInput').value = text; sendChat(); }
function getBotReply(lower) {
  const lang = CHAT_QA[S.chatLang] || CHAT_QA.en;
  for (const [keys, reply] of lang.pairs) {
    if (keys.some(k => lower.includes(k.toLowerCase()))) return reply;
  }
  // fall through to English domain pairs even when another language is selected
  if (S.chatLang !== 'en') {
    for (const [keys, reply] of CHAT_QA.en.pairs) {
      if (keys.some(k => lower.includes(k))) return reply;
    }
  }
  return lang.fallback;
}

/* ===================== TOASTS ===================== */
const TOAST_ICON = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
function showToast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${TOAST_ICON[type]}"></i>${msg}`;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 280); }, 3400);
}
