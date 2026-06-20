/* ============================================================
   TS TECH PARK — APP LOGIC (student / instructor site)
   ============================================================ */
const CATEGORIES = ['Embedded Systems & IoT','Automotive','Electronics','Data Science & AI','Web Development','Cloud & DevOps','Cybersecurity','Computer Science / IT'];
const CAT_COLOR = {
  'Embedded Systems & IoT':'#1e4fd8','Automotive':'#a9740e','Electronics':'#0d8c84',
  'Data Science & AI':'#7c3aed','Web Development':'#2563eb','Cloud & DevOps':'#0d8c84',
  'Cybersecurity':'#c5304a','Computer Science / IT':'#0f1b33'
};
function catColor(c){ return CAT_COLOR[c] || '#1e4fd8'; }
function catCode(c){
  const map = {'Embedded Systems & IoT':'EMB','Automotive':'AUTO','Electronics':'ELEC','Data Science & AI':'DSCI','Web Development':'WEBD','Cloud & DevOps':'CLOUD','Cybersecurity':'CYBR','Computer Science / IT':'CS'};
  return map[c] || 'GEN';
}

const S = {
  user: null,
  loggedIn: false,
  sortMode: 'newest',
  chatOpen: false,
  chatLang: 'en',
  chatWarn: { count: 0 },
  liveTab: 'live',
  forumQuery: '',
  editingCourseId: null,
  courseModalId: null,
};

document.addEventListener('DOMContentLoaded', () => {
  populateCategoryFilter();
  renderCourses();
  renderForum();
  renderLive('live');
  renderHeroStats();
  chatWelcome();
  restoreSession();
});

/* ---------------- THEME ---------------- */
function toggleTheme(){
  const dark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'light' : 'dark';
  document.getElementById('themeIcon').className = dark ? 'fas fa-moon' : 'fas fa-sun';
}

/* ---------------- NAV / PAGES ---------------- */
function showPage(n){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg = document.getElementById('page-'+n); if(pg) pg.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.toggle('active', l.dataset.pg===n));
  window.scrollTo(0,0);
  if(n==='dashboard'){ if(!S.loggedIn){ openAuth('login'); return; } renderOverview(); }
  if(n==='profile'){ if(!S.loggedIn){ openAuth('login'); return; } renderProfilePage(); }
  if(n==='courses') renderCourses();
}
function toggleMob(){ document.getElementById('mobMenu').classList.toggle('open'); document.getElementById('mobOverlay').classList.toggle('open'); }
function closeMob(){ document.getElementById('mobMenu').classList.remove('open'); document.getElementById('mobOverlay').classList.remove('open'); }
function setMbn(el){ document.querySelectorAll('.mbnav-btn').forEach(b=>b.classList.remove('active')); el.classList.add('active'); }
function handleOverlay(e,id){ if(e.target===e.currentTarget) closeModal(id); }
function closeModal(id){ document.getElementById(id).classList.remove('active'); }

/* ---------------- TOASTS ---------------- */
const TOAST_ICON = { success:'fa-circle-check', error:'fa-circle-exclamation', info:'fa-circle-info', warning:'fa-triangle-exclamation' };
function showToast(msg, type='info'){
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${TOAST_ICON[type]}"></i><span>${msg}</span>`;
  c.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),280); }, 3600);
}

/* ============================================================
   AUTH
   ============================================================ */
function openAuth(tab){ document.getElementById('authModal').classList.add('active'); switchAuth(tab); }
function switchAuth(tab){
  document.getElementById('loginForm').style.display = tab==='login' ? 'block':'none';
  document.getElementById('signupForm').style.display = tab==='signup' ? 'block':'none';
  document.getElementById('loginTab').classList.toggle('active', tab==='login');
  document.getElementById('signupTab').classList.toggle('active', tab==='signup');
}
let regRole = 'Student';
function setRole(btn, role){
  btn.closest('.role-sel').querySelectorAll('.role-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); regRole = role;
  document.getElementById('signupNote').textContent = role==='Instructor'
    ? "We'll send a verification link, and your account will need admin approval before you can teach."
    : "We'll send a verification link to your email.";
}
function togglePw(id, btn){
  const i = document.getElementById(id); const isPw = i.type==='password';
  i.type = isPw ? 'text':'password';
  btn.innerHTML = isPw ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
}

async function doSignup(){
  const firstName = document.getElementById('regFname').value.trim();
  const lastName = document.getElementById('regLname').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pass = document.getElementById('regPass').value;
  if(!firstName || !email || !phone || !pass){ showToast('Please fill all required fields','error'); return; }
  if(pass.length < 6){ showToast('Password must be at least 6 characters','error'); return; }
  if(DB.findUserByEmail(email)){ showToast('An account with this email already exists','error'); return; }

  const user = {
    id: uid('usr'), firstName, lastName, email, phone, role: regRole,
    status: regRole==='Instructor' ? 'pending_approval' : 'active',
    emailVerified: false,
    joinedAt: new Date().toISOString(),
    pass, // NOTE: demo-only plaintext storage. Real deployments must rely on Supabase Auth's hashed storage — never store raw passwords yourself.
  };

  if (SUPABASE_CONFIGURED && supabaseClient) {
    const { error } = await supabaseClient.auth.signUp({
      email, password: pass,
      options: { data: { firstName, lastName, role: regRole } }
    });
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Verification email sent — check your inbox to confirm your address.', 'success');
  } else {
    showToast('Account created. Verification email sending is simulated (Supabase not configured) — verify from the banner after logging in.', 'warning');
  }

  DB.upsertUser(user);
  DB.logActivity({ type:'signup', label:`New ${regRole.toLowerCase()} signup: ${firstName} ${lastName}` });
  closeModal('authModal');
  finishLogin(user);
}

async function doLogin(){
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  if(!email || !pass){ showToast('Enter email and password','error'); return; }
  const user = DB.findUserByEmail(email);
  if(!user || user.pass !== pass){ showToast('Invalid email or password','error'); return; }
  if(user.status === 'pending_approval'){ showToast('Your instructor account is awaiting admin approval.','warning'); return; }
  if(user.status === 'suspended' || user.status === 'blocked'){ showToast('This account has been suspended. Contact support.','error'); return; }
  closeModal('authModal');
  finishLogin(user);
}

function finishLogin(user){
  S.user = user; S.loggedIn = true;
  localStorage.setItem(DB.KEYS.SESSION, JSON.stringify({ userId: user.id }));
  afterLogin();
  showPage('dashboard');
  showToast(`Welcome, ${user.firstName}!`, 'success');
}
function restoreSession(){
  const sess = DB._get(DB.KEYS.SESSION, null);
  if(!sess) return;
  const user = DB.getUsers().find(u=>u.id===sess.userId);
  if(user && user.status!=='suspended' && user.status!=='blocked'){ S.user=user; S.loggedIn=true; afterLogin(); }
}
function afterLogin(){
  const u = S.user;
  document.getElementById('userAvBtn').style.display = 'flex';
  document.getElementById('userAvInit').textContent = initials(u);
  document.getElementById('guestButtons').style.display = 'none';
  document.getElementById('sbAv').textContent = initials(u);
  document.getElementById('sbName').textContent = displayName(u);
  document.getElementById('sbRole').textContent = u.role;
  document.getElementById('instructorNav').style.display = (u.role==='Instructor' && u.status==='active') ? 'block':'none';
  document.getElementById('instAddCourseBtn').style.display = (u.role==='Instructor' && u.status==='active') ? 'inline-flex':'none';
  document.getElementById('enrolledBadge').textContent = DB.enrollmentsForUser(u.id).length;
  updateVerifyBanner();
}
function doLogout(){
  S.loggedIn = false; S.user = null;
  localStorage.removeItem(DB.KEYS.SESSION);
  document.getElementById('userAvBtn').style.display = 'none';
  document.getElementById('guestButtons').style.display = 'flex';
  document.getElementById('verifyBanner').style.display = 'none';
  showPage('home');
  showToast('Logged out','info');
}
function initials(u){ return ((u.firstName||'').charAt(0)+(u.lastName||'').charAt(0)).toUpperCase() || (u.email||'?').charAt(0).toUpperCase(); }
function displayName(u){ return [u.firstName,u.lastName].filter(Boolean).join(' ').trim() || u.email; }

function updateVerifyBanner(){
  const banner = document.getElementById('verifyBanner');
  if(S.loggedIn && S.user && !S.user.emailVerified){
    banner.style.display = 'flex';
    document.getElementById('verifyBannerText').textContent =
      `Please verify ${S.user.email} to unlock enrollment and certificates.`;
  } else {
    banner.style.display = 'none';
  }
}
function resendVerification(){
  if (SUPABASE_CONFIGURED && supabaseClient) {
    supabaseClient.auth.resend({ type:'signup', email: S.user.email });
    showToast('Verification email re-sent.', 'success');
  } else {
    // Local simulation: no real mail server without Supabase, so we mark verified directly
    // and tell the person clearly that this step is a stand-in until Supabase is configured.
    S.user.emailVerified = true;
    DB.upsertUser(S.user);
    updateVerifyBanner();
    showToast('Demo mode: email marked verified instantly (configure Supabase for real email delivery).', 'warning');
  }
}

/* ============================================================
   COURSES
   ============================================================ */
function populateCategoryFilter(){
  const sel = document.getElementById('catFilter');
  CATEGORIES.forEach(c=>{ const o=document.createElement('option'); o.textContent=c; sel.appendChild(o); });
}
function renderHeroStats(){
  const courses = DB.getCourses().filter(c=>c.published!==false);
  const students = DB.getUsers().filter(u=>u.role==='Student').length;
  document.getElementById('heroStats').innerHTML = `
    <div class="hstat"><b>${courses.length}</b><span>Courses</span></div>
    <div class="hstat"><b>${students}</b><span>Students</span></div>
    <div class="hstat"><b>4</b><span>Languages supported</span></div>`;
}
function renderCourses(){
  let data = DB.getCourses().filter(c=>c.published!==false);
  const q = (document.getElementById('courseSearch')?.value||'').toLowerCase();
  const cat = document.getElementById('catFilter')?.value||'';
  const level = document.getElementById('levelFilter')?.value||'';
  data = data.filter(c => (!q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) && (!cat||c.category===cat) && (!level||c.level===level));
  data.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));

  const res = document.getElementById('coursesRes');
  if(res) res.textContent = `Showing ${data.length} course${data.length!==1?'s':''}`;
  const grid = document.getElementById('coursesGrid');
  if(!grid) return;
  if(!data.length){
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
      <i class="fas fa-book-open"></i>
      <p>No courses published yet. ${S.user && S.user.role==='Instructor' && S.user.status==='active' ? 'Create the first one!' : 'Check back soon, or sign up as an instructor to publish one.'}</p>
      ${S.user && S.user.role==='Instructor' && S.user.status==='active' ? `<button class="btn btn-primary btn-sm" onclick="openCourseEditor()">New course</button>` : ''}
    </div>`;
    return;
  }
  grid.innerHTML = data.map(c=>{
    const color = catColor(c.category);
    const enrolledCount = DB.getEnrollments().filter(e=>e.courseId===c.id).length;
    return `<div class="cc" onclick="openCourseModal('${c.id}')">
      <div class="cc-banner">
        <div class="ledger-bar" style="background:${color};align-self:stretch"></div>
        <div class="cc-banner-body">
          <div class="cc-code">${catCode(c.category)}-${c.code}</div>
          <div class="cc-cat-name" style="color:${color}">${escapeHtml(c.title)}</div>
          <div class="cc-by">By TS Tech Park</div>
        </div>
      </div>
      <div class="cc-body">
        <div class="cc-title">${escapeHtml(c.category)} · ${c.level}</div>
        <div class="cc-desc">${escapeHtml((c.description||'').slice(0,100))}${(c.description||'').length>100?'…':''}</div>
        <div class="cc-meta"><span><i class="fas fa-clock"></i>${c.hours}h</span><span><i class="fas fa-user"></i>${enrolledCount} enrolled</span></div>
        <div class="cc-footer"><div class="cc-price">${fmtMoney(c.price)}</div><button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openCourseModal('${c.id}')">View course</button></div>
      </div>
    </div>`;
  }).join('');
}
function filterCourses(){ renderCourses(); }
function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ---- Course detail / enroll modal ---- */
function openCourseModal(id){
  const c = DB.getCourses().find(x=>x.id===id); if(!c) return;
  S.courseModalId = id;
  const color = catColor(c.category);
  const already = S.loggedIn && DB.enrollmentsForUser(S.user.id).some(e=>e.courseId===id);
  document.getElementById('courseModalBody').innerHTML = `
    <div class="cm-banner" style="background:${color}">
      <div class="cm-code">${catCode(c.category)}-${c.code} · ${escapeHtml(c.category)}</div>
      <div class="cm-cat-name">${escapeHtml(c.title)}</div>
      <div class="cm-by">By TS Tech Park</div>
    </div>
    <div style="padding:20px 24px">
      <div class="flex gap-2 mb-1" style="flex-wrap:wrap">
        <span class="pill pill-gray">${c.level}</span><span class="pill pill-gray">${c.hours}h</span>
        <span class="pill pill-gray">${DB.getEnrollments().filter(e=>e.courseId===id).length} enrolled</span>
      </div>
      <p class="text-soft" style="font-size:13px;line-height:1.7;margin-bottom:14px">${escapeHtml(c.description||'')}</p>
      <div class="cm-tabs">
        <button class="cm-tab active" onclick="cmTab(this,'cmCur')">Curriculum</button>
        <button class="cm-tab" onclick="cmTab(this,'cmVid')">Preview</button>
        <button class="cm-tab" onclick="cmTab(this,'cmPay')">${already?'Enrolled':'Enroll'}</button>
      </div>
      <div id="cmCur" class="cm-tab-body active">
        ${(c.curriculum||[]).map((item,i)=>`<div class="cur-item"><i class="fas fa-circle-dot"></i><span>${escapeHtml(item)}</span></div>`).join('') || '<p class="text-faint" style="font-size:12.5px">No curriculum added yet.</p>'}
      </div>
      <div id="cmVid" class="cm-tab-body">
        ${(c.videos||[]).length ? c.videos.map(v=>`<div class="cur-item" style="cursor:pointer" onclick="openVideoPlayer('${v.yt}','${escapeHtml(v.title)}')"><i class="fas fa-circle-play"></i><span>${escapeHtml(v.title)}</span></div>`).join('') : '<p class="text-faint" style="font-size:12.5px">No preview videos added yet.</p>'}
      </div>
      <div id="cmPay" class="cm-tab-body">
        ${already ? `<p style="font-size:13px"><i class="fas fa-circle-check" style="color:var(--teal)"></i> You're enrolled in this course. <a href="#" onclick="showPage('dashboard');closeModal('courseModal');switchDash(null,'mycourses');return false">Go to My Courses →</a></p>` : `
        <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;margin-bottom:4px">${fmtMoney(c.price)}</div>
        <div class="text-faint" style="font-size:11.5px;margin-bottom:10px">Lifetime access · Certificate on completion</div>
        <div class="pay-opts">
          <label class="pay-opt sel"><input type="radio" name="pm" value="UPI" checked onclick="selPay(this)"> <i class="fas fa-mobile-screen"></i> UPI</label>
          <label class="pay-opt"><input type="radio" name="pm" value="Card" onclick="selPay(this)"> <i class="fas fa-credit-card"></i> Card</label>
          <label class="pay-opt"><input type="radio" name="pm" value="Cash" onclick="selPay(this)"> <i class="fas fa-money-bill"></i> Cash</label>
        </div>
        <button class="btn btn-primary btn-block" onclick="enrollCourse('${c.id}')">Mark as paid &amp; enroll — ${fmtMoney(c.price)}</button>
        <p class="help-text" style="text-align:center;margin-top:8px">No real payment gateway is connected — this records a receipt in your payment history for demo purposes.</p>
        `}
      </div>
    </div>`;
  document.getElementById('courseModal').classList.add('active');
}
function selPay(input){ input.closest('.pay-opts').querySelectorAll('.pay-opt').forEach(o=>o.classList.remove('sel')); input.closest('.pay-opt').classList.add('sel'); }
function cmTab(btn, id){
  const wrap = btn.closest('div').parentElement;
  wrap.querySelectorAll('.cm-tab').forEach(t=>t.classList.remove('active'));
  wrap.querySelectorAll('.cm-tab-body').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active'); document.getElementById(id).classList.add('active');
}
function openVideoPlayer(ytId, title){
  document.getElementById('videoModalBody').innerHTML = `
    <div style="background:#000;position:relative;padding-bottom:56.25%;height:0">
      <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0" style="position:absolute;inset:0;width:100%;height:100%;border:none" allow="autoplay;encrypted-media;picture-in-picture" allowfullscreen></iframe>
    </div>
    <div style="padding:16px 20px"><h3 style="font-size:1rem">${escapeHtml(title)}</h3></div>`;
  document.getElementById('videoModal').classList.add('active');
}
function stopVideo(){ document.getElementById('videoModalBody').innerHTML=''; }

function enrollCourse(courseId){
  if(!S.loggedIn){ openAuth('login'); return; }
  if(!S.user.emailVerified){ showToast('Please verify your email before enrolling.','warning'); return; }
  const c = DB.getCourses().find(x=>x.id===courseId); if(!c) return;
  const method = document.querySelector('input[name="pm"]:checked')?.value || 'UPI';
  const txnId = 'TXN' + Date.now().toString(36).toUpperCase();
  DB.addPayment({ id: uid('pay'), txnId, userId:S.user.id, userName:displayName(S.user), userEmail:S.user.email, courseId:c.id, courseTitle:c.title, amount:c.price, method, status:'paid', time:new Date().toISOString() });
  DB.addEnrollment({ id: uid('enr'), userId:S.user.id, courseId:c.id, enrolledAt:new Date().toISOString(), completedLessons:[], completed:false });
  DB.logActivity({ type:'enrollment', label:`${displayName(S.user)} enrolled in ${c.title}` });
  document.getElementById('enrolledBadge').textContent = DB.enrollmentsForUser(S.user.id).length;
  closeModal('courseModal');
  showToast(`Enrolled in ${c.title}! Receipt saved to Payment history.`, 'success');
  renderCourses();
}

/* ---- Course editor (instructor / admin use) ---- */
function openCourseEditor(courseId){
  if(!S.loggedIn || !(S.user.role==='Instructor' && S.user.status==='active')){ showToast('Only approved instructors can create courses.','error'); return; }
  S.editingCourseId = courseId || null;
  const c = courseId ? DB.getCourses().find(x=>x.id===courseId) : null;
  document.getElementById('ceTitle').textContent = c ? 'Edit course' : 'New course';
  document.getElementById('courseEditorBody').innerHTML = `
    <div class="field"><label>Course title <span class="req">*</span></label><input class="input" id="ceTitleInput" value="${c?escapeHtml(c.title):''}" placeholder="e.g. Data Science"/></div>
    <div class="field-row">
      <div class="field"><label>Category <span class="req">*</span></label><select class="input" id="ceCat">${CATEGORIES.map(cat=>`<option ${c&&c.category===cat?'selected':''}>${cat}</option>`).join('')}</select></div>
      <div class="field"><label>Level</label><select class="input" id="ceLevel"><option ${c&&c.level==='Beginner'?'selected':''}>Beginner</option><option ${c&&c.level==='Intermediate'?'selected':''}>Intermediate</option><option ${c&&c.level==='Advanced'?'selected':''}>Advanced</option></select></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Price (₹) <span class="req">*</span></label><input class="input" type="number" id="cePrice" value="${c?c.price:''}"/></div>
      <div class="field"><label>Duration (hours)</label><input class="input" type="number" id="ceHours" value="${c?c.hours:''}"/></div>
    </div>
    <div class="field"><label>Description</label><textarea class="input" id="ceDesc" rows="3">${c?escapeHtml(c.description):''}</textarea></div>
    <div class="field"><label>Curriculum (one item per line)</label><textarea class="input" id="ceCurriculum" rows="4">${c?(c.curriculum||[]).join('\n'):''}</textarea></div>
    <div class="field"><label>Preview video — YouTube ID (optional)</label><input class="input" id="ceVideo" value="${c&&c.videos&&c.videos[0]?c.videos[0].yt:''}" placeholder="e.g. dQw4w9WgXcQ"/></div>
    <div class="flex items-center gap-2 mb-2"><input type="checkbox" id="cePublished" ${!c||c.published!==false?'checked':''}/> <label for="cePublished" style="margin:0;font-size:12.5px">Published (visible in catalog)</label></div>
    <div class="flex gap-2">
      <button class="btn btn-primary btn-block" onclick="saveCourse()">${c?'Save changes':'Create course'}</button>
      ${c?`<button class="btn btn-danger" onclick="removeCourse('${c.id}')"><i class="fas fa-trash"></i></button>`:''}
    </div>`;
  document.getElementById('courseEditorModal').classList.add('active');
}
function saveCourse(){
  const title = document.getElementById('ceTitleInput').value.trim();
  const category = document.getElementById('ceCat').value;
  const level = document.getElementById('ceLevel').value;
  const price = parseInt(document.getElementById('cePrice').value || '0', 10);
  const hours = parseInt(document.getElementById('ceHours').value || '0', 10);
  const description = document.getElementById('ceDesc').value.trim();
  const curriculum = document.getElementById('ceCurriculum').value.split('\n').map(s=>s.trim()).filter(Boolean);
  const ytId = document.getElementById('ceVideo').value.trim();
  const published = document.getElementById('cePublished').checked;
  if(!title || !price){ showToast('Title and price are required','error'); return; }

  const existing = S.editingCourseId ? DB.getCourses().find(x=>x.id===S.editingCourseId) : null;
  const course = existing || { id: uid('crs'), code: String(Math.floor(100+Math.random()*900)), createdAt: new Date().toISOString(), instructorId: S.user.id, instructorName: displayName(S.user) };
  Object.assign(course, { title, category, level, price, hours, description, curriculum, published, videos: ytId ? [{ title: title+' — Preview', yt: ytId }] : (course.videos||[]) });
  DB.upsertCourse(course);
  DB.logActivity({ type:'course', label:`${existing?'Updated':'Created'} course: ${title}` });
  closeModal('courseEditorModal');
  renderCourses();
  if(document.getElementById('page-dashboard').classList.contains('active')) renderTeaching();
  showToast(existing?'Course updated':'Course created', 'success');
}
function removeCourse(id){
  if(!confirm('Delete this course? This cannot be undone.')) return;
  DB.deleteCourse(id);
  closeModal('courseEditorModal');
  renderCourses();
  renderTeaching();
  showToast('Course deleted','info');
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function switchDash(btn, sec){
  document.querySelectorAll('.sb-link').forEach(l=>l.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const map = { overview:renderOverview, mycourses:renderMyCourses, certificates:renderCertificates, payments:renderPayments, teaching:renderTeaching, 'teach-live':renderTeachLive, settings:renderSettings };
  (map[sec]||renderOverview)();
}
function myEnrolledCourses(){
  return DB.enrollmentsForUser(S.user.id).map(e => ({ enrollment:e, course: DB.getCourses().find(c=>c.id===e.courseId) })).filter(x=>x.course);
}
function renderOverview(){
  if(!S.loggedIn){ openAuth('login'); return; }
  const u = S.user;
  const mine = myEnrolledCourses();
  const certs = mine.filter(x=>x.enrollment.completed);
  const payments = DB.getPayments().filter(p=>p.userId===u.id);
  const spend = payments.reduce((s,p)=>s+p.amount,0);
  const activity = DB.getActivity().filter(a=>a.label && a.label.includes(displayName(u))).slice(0,6);

  document.getElementById('dashMain').innerHTML = `
    <div class="dash-hdr"><div><h2>Welcome back, ${displayName(u)}</h2><p>Here's where your learning stands today.</p></div></div>
    <div class="stats-grid">
      <div class="stat-card"><i class="fas fa-book-open"></i><div class="stat-val">${mine.length}</div><div class="stat-lbl">Enrolled courses</div></div>
      <div class="stat-card"><i class="fas fa-certificate"></i><div class="stat-val">${certs.length}</div><div class="stat-lbl">Certificates</div></div>
      <div class="stat-card"><i class="fas fa-receipt"></i><div class="stat-val">${fmtMoney(spend)}</div><div class="stat-lbl">Total spent</div></div>
      <div class="stat-card"><i class="fas fa-clock"></i><div class="stat-val">${payments.length}</div><div class="stat-lbl">Transactions</div></div>
    </div>
    <div class="dash-g2">
      <div class="card card-pad">
        <div class="card-title">Continue learning <a href="#" onclick="switchDash(null,'mycourses');return false">View all</a></div>
        ${mine.length===0 ? `<div class="empty" style="padding:1.5rem"><i class="fas fa-book"></i><p>No courses yet.</p><button class="btn btn-primary btn-sm" onclick="showPage('courses')">Browse catalog</button></div>` :
          mine.slice(0,4).map(({enrollment,course})=>{
            const pct = course.curriculum && course.curriculum.length ? Math.round((enrollment.completedLessons||[]).length/course.curriculum.length*100) : 0;
            return `<div class="enr-item"><div class="enr-ledger" style="background:${catColor(course.category)}"></div><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:12.5px">${escapeHtml(course.title)}</div><div class="flex items-center gap-1" style="font-size:10.5px;color:var(--ink-faint)"><div class="prog-bar" style="flex:1"><div class="prog-fill" style="width:${pct}%"></div></div>${pct}%</div></div><button class="btn btn-ghost btn-sm" onclick="switchDash(null,'mycourses')">Open</button></div>`;
          }).join('')}
      </div>
      <div class="card card-pad">
        <div class="card-title">Recent activity</div>
        ${activity.length===0 ? `<p class="text-faint" style="font-size:12px">No activity yet.</p>` :
          activity.map(a=>`<div class="act-item"><div class="act-dot" style="background:var(--blue-tint);color:var(--blue-ink)"><i class="fas fa-circle-check" style="font-size:10px"></i></div><div><div style="font-size:12px;font-weight:600">${escapeHtml(a.label)}</div><div style="font-size:10px;color:var(--ink-faint)">${fmtDateTime(a.time)}</div></div></div>`).join('')}
      </div>
    </div>`;
}
function renderMyCourses(){
  const mine = myEnrolledCourses();
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-hdr"><div><h2>My courses</h2><p>${mine.length} enrolled</p></div><button class="btn btn-primary btn-sm" onclick="showPage('courses')"><i class="fas fa-plus"></i> Browse more</button></div>
    ${mine.length===0 ? `<div class="empty"><i class="fas fa-book-open"></i><p>You haven't enrolled in anything yet.</p><button class="btn btn-primary btn-sm" onclick="showPage('courses')">Browse catalog</button></div>` :
    mine.map(({enrollment,course})=>{
      const total = (course.curriculum||[]).length;
      const done = (enrollment.completedLessons||[]).length;
      const pct = total ? Math.round(done/total*100) : 0;
      return `<div class="card card-pad mb-2">
        <div class="flex justify-between items-center mb-1">
          <div><div class="cat-code">${catCode(course.category)}-${course.code}</div><div style="font-weight:700;font-size:14px">${escapeHtml(course.title)}</div></div>
          <span class="pill ${enrollment.completed?'pill-teal':'pill-blue'}">${enrollment.completed?'Completed':pct+'% done'}</span>
        </div>
        <div class="prog-bar mb-1"><div class="prog-fill" style="width:${pct}%"></div></div>
        ${total ? course.curriculum.map((item,i)=>`<label class="flex items-center gap-2" style="font-size:12px;padding:5px 0;cursor:pointer"><input type="checkbox" ${(enrollment.completedLessons||[]).includes(i)?'checked':''} onchange="toggleLesson('${enrollment.id}',${i})"> ${escapeHtml(item)}</label>`).join('') : `<p class="text-faint" style="font-size:12px">This course has no curriculum items yet.</p>`}
        <div class="flex gap-2 mt-2">
          ${course.videos && course.videos[0] ? `<button class="btn btn-outline btn-sm" onclick="openVideoPlayer('${course.videos[0].yt}','${escapeHtml(course.videos[0].title)}')"><i class="fas fa-play"></i> Watch preview</button>`:''}
          ${pct===100 && !enrollment.completed ? `<button class="btn btn-primary btn-sm" onclick="completeCourse('${enrollment.id}')"><i class="fas fa-certificate"></i> Generate certificate</button>` : ''}
        </div>
      </div>`;
    }).join('')}`;
}
function toggleLesson(enrollmentId, idx){
  const list = DB.getEnrollments();
  const e = list.find(x=>x.id===enrollmentId); if(!e) return;
  e.completedLessons = e.completedLessons || [];
  const pos = e.completedLessons.indexOf(idx);
  if(pos>=0) e.completedLessons.splice(pos,1); else e.completedLessons.push(idx);
  DB._set(DB.KEYS.ENROLLMENTS, list);
  renderMyCourses();
}
function completeCourse(enrollmentId){
  const list = DB.getEnrollments();
  const e = list.find(x=>x.id===enrollmentId); if(!e) return;
  e.completed = true; e.completedAt = new Date().toISOString();
  e.certCode = 'TSTP-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2,7).toUpperCase();
  DB._set(DB.KEYS.ENROLLMENTS, list);
  DB.logActivity({ type:'certificate', label:`${displayName(S.user)} earned a certificate` });
  showToast('Certificate generated! Check the Certificates tab.', 'success');
  renderMyCourses();
}
function renderCertificates(){
  const mine = myEnrolledCourses().filter(x=>x.enrollment.completed);
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-hdr"><div><h2>Certificates</h2><p>Ledger-coded credentials tied to your real course record.</p></div></div>
    ${mine.length===0 ? `<div class="empty"><i class="fas fa-certificate"></i><p>Complete every lesson in a course to generate a certificate.</p></div>` :
    `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:15px">
      ${mine.map(({enrollment,course})=>`
      <div class="cert-card">
        <div class="cert-org">TS TECH PARK</div>
        <div class="cert-sub">A Group of TS Institutions</div>
        <div class="cert-lbl">Certificate of Completion</div>
        <div class="cert-name">${escapeHtml(displayName(S.user))}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.55);margin-bottom:4px">has successfully completed</div>
        <div class="cert-course">${escapeHtml(course.title)} — by TS Tech Park</div>
        <div class="cert-date">Awarded ${fmtDateTime(enrollment.completedAt)} · ${enrollment.certCode}</div>
        <div class="cert-foot">
          <div class="qr-box"><i class="fas fa-qrcode" style="font-size:20px;color:var(--navy-950)"></i></div>
          <div><div style="font-size:10px;margin-bottom:2px">Scan to verify</div><div style="font-size:9px;opacity:.5" class="mono">${enrollment.certCode}</div></div>
        </div>
      </div>`).join('')}
    </div>`}`;
}
function renderPayments(){
  const list = DB.getPayments().filter(p=>p.userId===S.user.id);
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-hdr"><div><h2>Payment history</h2><p>${list.length} transaction${list.length!==1?'s':''}</p></div></div>
    <div class="card" style="overflow-x:auto">
      <table class="table"><thead><tr><th>Txn ID</th><th>Course</th><th>Amount</th><th>Method</th><th>Date &amp; time</th><th>Status</th></tr></thead>
      <tbody>${list.length===0?`<tr><td colspan="6" style="text-align:center;color:var(--ink-faint);padding:18px">No transactions yet.</td></tr>`:
      list.map(p=>`<tr><td class="mono" style="font-size:11px">${p.txnId}</td><td>${escapeHtml(p.courseTitle)}</td><td style="font-weight:700">${fmtMoney(p.amount)}</td><td>${p.method}</td><td style="font-size:11.5px">${fmtDateTime(p.time)}</td><td><span class="pill pill-teal">PAID</span></td></tr>`).join('')}</tbody></table>
    </div>`;
}
/* ---- Instructor: teaching view ---- */
function renderTeaching(){
  const mine = DB.getCourses().filter(c=>c.instructorId===S.user.id);
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-hdr"><div><h2>Courses you teach</h2><p>${mine.length} course${mine.length!==1?'s':''}</p></div><button class="btn btn-primary btn-sm" onclick="openCourseEditor()"><i class="fas fa-plus"></i> New course</button></div>
    ${mine.length===0 ? `<div class="empty"><i class="fas fa-chalkboard"></i><p>You haven't created any courses yet.</p><button class="btn btn-primary btn-sm" onclick="openCourseEditor()">Create your first course</button></div>` :
    mine.map(c=>{
      const enrolled = DB.getEnrollments().filter(e=>e.courseId===c.id).length;
      const revenue = DB.getPayments().filter(p=>p.courseId===c.id).reduce((s,p)=>s+p.amount,0);
      return `<div class="card card-pad mb-2">
        <div class="flex justify-between items-center">
          <div><div class="cat-code">${catCode(c.category)}-${c.code}</div><div style="font-weight:700;font-size:14px">${escapeHtml(c.title)}</div></div>
          <span class="pill ${c.published!==false?'pill-teal':'pill-gray'}">${c.published!==false?'Published':'Unpublished'}</span>
        </div>
        <div class="flex gap-3 mt-1" style="font-size:12px;color:var(--ink-soft)"><span><i class="fas fa-user"></i> ${enrolled} enrolled</span><span><i class="fas fa-receipt"></i> ${fmtMoney(revenue)} revenue</span></div>
        <div class="flex gap-2 mt-2">
          <button class="btn btn-outline btn-sm" onclick="openCourseEditor('${c.id}')"><i class="fas fa-pen"></i> Edit</button>
          <button class="btn btn-ghost btn-sm" onclick="togglePublish('${c.id}')">${c.published!==false?'Unpublish':'Publish'}</button>
        </div>
      </div>`;
    }).join('')}`;
}
function togglePublish(id){
  const c = DB.getCourses().find(x=>x.id===id); if(!c) return;
  c.published = c.published===false ? true : false;
  DB.upsertCourse(c); renderTeaching(); renderCourses();
}
function renderTeachLive(){
  const mine = DB.getLive().filter(l=>l.postedBy===S.user.id);
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-hdr"><div><h2>Live sessions you've posted</h2><p>${mine.length} session${mine.length!==1?'s':''}</p></div><button class="btn btn-primary btn-sm" onclick="openLiveEditor()"><i class="fas fa-plus"></i> Post session</button></div>
    ${mine.length===0?`<div class="empty"><i class="fas fa-tower-broadcast"></i><p>No sessions posted yet.</p></div>`:
    mine.map(l=>`<div class="card card-pad mb-2"><div class="flex justify-between items-center"><div><div style="font-weight:700">${escapeHtml(l.title)}</div><div class="text-soft" style="font-size:12px">${escapeHtml(l.time)} · <a href="${escapeHtml(l.link)}" target="_blank" rel="noopener">${escapeHtml(l.link)}</a></div></div><span class="pill ${l.status==='live'?'pill-red':'pill-blue'}">${l.status.toUpperCase()}</span></div></div>`).join('')}`;
}
function openLiveEditor(){
  document.getElementById('liveEditorBody').innerHTML = `
    <div class="field"><label>Session title <span class="req">*</span></label><input class="input" id="leTitle"/></div>
    <div class="field"><label>Streaming link (Zoom / Meet / YouTube) <span class="req">*</span></label><input class="input" id="leLink" placeholder="https://..."/></div>
    <div class="field"><label>Time / schedule label <span class="req">*</span></label><input class="input" id="leTime" placeholder="e.g. Tomorrow 10:00 AM"/></div>
    <div class="field"><label>Status</label><select class="input" id="leStatus"><option value="upcoming">Upcoming</option><option value="live">Live now</option></select></div>
    <button class="btn btn-primary btn-block" onclick="saveLive()">Post session</button>`;
  document.getElementById('liveEditorModal').classList.add('active');
}
function saveLive(){
  const title = document.getElementById('leTitle').value.trim();
  const link = document.getElementById('leLink').value.trim();
  const time = document.getElementById('leTime').value.trim();
  const status = document.getElementById('leStatus').value;
  if(!title||!link||!time){ showToast('Fill all fields','error'); return; }
  DB.addLive({ id: uid('live'), title, link, time, status, postedBy: S.user ? S.user.id : 'admin', postedByName: S.user?displayName(S.user):'Admin', createdAt: new Date().toISOString() });
  DB.logActivity({ type:'live', label:`Posted live session: ${title}` });
  closeModal('liveEditorModal');
  renderLive(S.liveTab);
  if(document.getElementById('page-dashboard').classList.contains('active')) renderTeachLive();
  showToast('Session posted','success');
}
function renderSettings(){
  const u = S.user;
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-hdr"><div><h2>Settings</h2><p>Account preferences</p></div></div>
    <div class="card card-pad" style="max-width:480px">
      <div class="card-title">Profile info</div>
      <div class="field"><label>First name</label><input class="input" id="sFn" value="${escapeHtml(u.firstName)}"/></div>
      <div class="field"><label>Last name</label><input class="input" id="sLn" value="${escapeHtml(u.lastName||'')}"/></div>
      <div class="field"><label>Phone</label><input class="input" id="sPh" value="${escapeHtml(u.phone||'')}"/></div>
      <button class="btn btn-primary btn-sm" onclick="saveSettings()">Save changes</button>
    </div>
    <div class="card card-pad mt-2" style="max-width:480px">
      <div class="card-title">Account</div>
      <p class="text-soft" style="font-size:12.5px;margin-bottom:10px">Status: <span class="pill ${u.emailVerified?'pill-teal':'pill-amber'}">${u.emailVerified?'Verified':'Unverified'}</span></p>
      <button class="btn btn-danger btn-sm" onclick="doLogout()"><i class="fas fa-arrow-right-from-bracket"></i> Log out</button>
    </div>`;
}
function saveSettings(){
  S.user.firstName = document.getElementById('sFn').value.trim();
  S.user.lastName = document.getElementById('sLn').value.trim();
  S.user.phone = document.getElementById('sPh').value.trim();
  DB.upsertUser(S.user);
  afterLogin();
  showToast('Saved','success');
}

/* ============================================================
   PROFILE
   ============================================================ */
function renderProfilePage(){
  const u = S.user;
  document.getElementById('profAv').textContent = initials(u);
  document.getElementById('profName').textContent = displayName(u);
  document.getElementById('profTagline').textContent = u.role + (u.role==='Instructor' ? (u.status==='active' ? ' · Approved':' · Pending approval') : '');
  document.getElementById('profMeta').innerHTML = `<span><i class="fas fa-envelope"></i> ${escapeHtml(u.email)}</span><span><i class="fas fa-phone"></i> ${escapeHtml(u.phone||'—')}</span><span><i class="fas fa-calendar"></i> Joined ${fmtDateTime(u.joinedAt).split(' · ')[0]}</span>`;
  const mine = myEnrolledCourses();
  const certs = mine.filter(x=>x.enrollment.completed);
  document.getElementById('profStats').innerHTML = [
    ['Enrolled', mine.length], ['Certificates', certs.length],
    ['Transactions', DB.getPayments().filter(p=>p.userId===u.id).length],
  ].map(([l,v])=>`<div class="psl-item"><span class="text-soft" style="font-size:11.5px">${l}</span><span class="psl-val">${v}</span></div>`).join('');
  document.getElementById('profCerts').innerHTML = certs.length===0 ? `<p class="text-faint" style="font-size:12px">No certificates yet.</p>` :
    certs.map(({course,enrollment})=>`<div class="flex items-center gap-2" style="padding:8px 0;border-bottom:1px solid var(--border)"><i class="fas fa-certificate" style="color:var(--brass)"></i><div style="flex:1"><div style="font-weight:700;font-size:12px">${escapeHtml(course.title)}</div><div class="text-faint mono" style="font-size:10px">${enrollment.certCode}</div></div></div>`).join('');
  const activity = DB.getActivity().filter(a=>a.label && a.label.includes(displayName(u))).slice(0,8);
  document.getElementById('profActivity').innerHTML = activity.length===0 ? `<p class="text-faint" style="font-size:12px">No activity yet.</p>` :
    activity.map(a=>`<div class="act-item"><div class="act-dot" style="background:var(--blue-tint);color:var(--blue-ink)"><i class="fas fa-circle-check" style="font-size:10px"></i></div><div><div style="font-size:12px;font-weight:600">${escapeHtml(a.label)}</div><div style="font-size:10px;color:var(--ink-faint)">${fmtDateTime(a.time)}</div></div></div>`).join('');
}
function openEditProfile(){
  const u = S.user;
  document.getElementById('editProfileBody').innerHTML = `
    <div class="field-row"><div class="field"><label>First name</label><input class="input" id="epFn" value="${escapeHtml(u.firstName)}"/></div><div class="field"><label>Last name</label><input class="input" id="epLn" value="${escapeHtml(u.lastName||'')}"/></div></div>
    <div class="field"><label>Phone</label><input class="input" id="epPh" value="${escapeHtml(u.phone||'')}"/></div>
    <button class="btn btn-primary btn-block" onclick="saveEP()">Save profile</button>`;
  document.getElementById('editProfileModal').classList.add('active');
}
function saveEP(){
  S.user.firstName = document.getElementById('epFn').value.trim();
  S.user.lastName = document.getElementById('epLn').value.trim();
  S.user.phone = document.getElementById('epPh').value.trim();
  DB.upsertUser(S.user);
  closeModal('editProfileModal'); afterLogin(); renderProfilePage();
  showToast('Profile updated','success');
}

/* ============================================================
   FORUM
   ============================================================ */
function renderForum(){
  const c = document.getElementById('forumPosts'); if(!c) return;
  let posts = DB.getForum();
  if(S.forumQuery) posts = posts.filter(p=>p.title.toLowerCase().includes(S.forumQuery)||p.text.toLowerCase().includes(S.forumQuery));
  posts = [...posts].sort((a,b)=> new Date(b.time)-new Date(a.time));
  c.innerHTML = posts.length===0 ? `<div class="empty"><i class="fas fa-comments"></i><p>No posts yet — be the first to ask a question or share a project.</p></div>` :
    posts.map(p=>`<div class="fp">
      <div class="fp-hdr"><div class="fp-av">${p.av}</div><div><div class="fp-name">${escapeHtml(p.user)}</div><div class="fp-time">${fmtDateTime(p.time)}</div></div><span class="pill pill-blue" style="margin-left:auto">${p.cat}</span></div>
      <div class="fp-title">${escapeHtml(p.title)}</div>
      <div class="fp-text">${escapeHtml(p.text)}</div>
      <div class="fp-tags">${(p.tags||[]).map(t=>`<span class="tag-pill">#${escapeHtml(t)}</span>`).join('')}</div>
      <div class="flex"><button class="fp-act" onclick="likePost('${p.id}',this)"><i class="fas fa-heart"></i> ${p.likes}</button></div>
    </div>`).join('');
}
function filterForum(val){ S.forumQuery = (val||'').toLowerCase(); renderForum(); }
function likePost(id, btn){
  const list = DB.getForum(); const p = list.find(x=>x.id===id); if(!p) return;
  p.likes++; DB.saveForum(list);
  btn.innerHTML = `<i class="fas fa-heart" style="color:var(--red)"></i> ${p.likes}`;
}
function openNewPost(){ if(!S.loggedIn){ openAuth('login'); return; } document.getElementById('postModal').classList.add('active'); }
function submitPost(){
  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const cat = document.getElementById('postCat').value;
  const tags = document.getElementById('postTags').value.split(',').map(t=>t.trim()).filter(Boolean);
  if(!title||!content){ showToast('Fill title and content','error'); return; }
  const list = DB.getForum();
  list.unshift({ id: uid('post'), user: displayName(S.user), av: initials(S.user), cat, title, text: content, tags, likes:0, time: new Date().toISOString() });
  DB.saveForum(list);
  closeModal('postModal'); renderForum();
  document.getElementById('postTitle').value=''; document.getElementById('postContent').value=''; document.getElementById('postTags').value='';
  showToast('Posted!','success');
}

/* ============================================================
   LIVE
   ============================================================ */
function renderLive(tab){
  S.liveTab = tab;
  const c = document.getElementById('liveContent'); if(!c) return;
  const list = DB.getLive().filter(l => tab==='past' ? l.status==='past' : l.status===tab);
  c.innerHTML = list.length===0 ? `<div class="empty"><i class="fas fa-video"></i><p>No sessions here yet.</p></div>` :
    list.map(l=>`<div class="lcc">
      <div style="flex:1">
        ${l.status==='live' ? `<div class="lc-live"><div class="ldot"></div>LIVE NOW</div>`:''}
        <div style="font-weight:700;font-size:13px">${escapeHtml(l.title)}</div>
        <div class="text-faint" style="font-size:11px;margin-top:2px"><i class="fas fa-user-tie"></i> ${escapeHtml(l.postedByName||'TS Tech Park')} · <i class="fas fa-clock"></i> ${escapeHtml(l.time)}</div>
      </div>
      <a class="btn btn-primary btn-sm" href="${escapeHtml(l.link)}" target="_blank" rel="noopener"><i class="fas fa-arrow-up-right-from-square"></i> ${l.status==='live'?'Join':'Open'}</a>
    </div>`).join('');
}
function setLiveTab(btn, tab){ document.querySelectorAll('.ltab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); renderLive(tab); }

/* ============================================================
   CHATBOT
   ============================================================ */
function chatWelcome(){
  const welcome = { en:"Hi! I'm TechBot. Ask me about courses, fees, batches — or just say hello!",
    ta:"வணக்கம்! நான் TechBot. பாடங்கள், கட்டணம் பற்றி கேளுங்கள்!",
    hi:"नमस्ते! मैं TechBot हूं। कोर्स, फीस के बारे में पूछें!",
    te:"నమస్కారం! నేను TechBot. కోర్సులు, ఫీజుల గురించి అడగండి!" };
  addBotMsg(welcome[S.chatLang] || welcome.en);
}
function setChatLang(lang){ S.chatLang = lang; document.getElementById('chatMsgs').innerHTML=''; S.chatWarn.count=0; chatWelcome(); }
function toggleChat(){
  S.chatOpen = !S.chatOpen;
  document.getElementById('chatPanel').classList.toggle('open', S.chatOpen);
  document.getElementById('chatIcon').className = S.chatOpen ? 'fas fa-times':'fas fa-robot';
  if(S.chatOpen) document.getElementById('chatInput').focus();
}
function clearChat(){ document.getElementById('chatMsgs').innerHTML=''; S.chatWarn.count=0; chatWelcome(); }
function sendSugg(text){ document.getElementById('chatInput').value = text; sendChat(); }
function sendChat(){
  const input = document.getElementById('chatInput');
  const msg = input.value.trim(); if(!msg) return;
  input.value='';
  addUserMsg(msg);
  setTimeout(()=>{
    const r = techbotReply(msg, S.chatLang, S.chatWarn);
    addBotMsg(r.type==='warning' ? `<div class="warn-msg"><i class="fas fa-triangle-exclamation"></i> ${r.text}</div>` : r.text);
  }, 350);
}
function addBotMsg(html){
  const m = document.getElementById('chatMsgs');
  const d = document.createElement('div'); d.className='cmr';
  d.innerHTML = `<div class="msg-av-sm bot-av-sm"><i class="fas fa-robot" style="font-size:8px"></i></div><div class="msg-bubble bot-bub">${html}</div>`;
  m.appendChild(d); m.scrollTop = m.scrollHeight;
}
function addUserMsg(text){
  const m = document.getElementById('chatMsgs');
  const d = document.createElement('div'); d.className='cmr user';
  d.innerHTML = `<div class="msg-bubble user-bub">${escapeHtml(text)}</div><div class="msg-av-sm user-av-sm">${S.user?initials(S.user):'U'}</div>`;
  m.appendChild(d); m.scrollTop = m.scrollHeight;
}
