/* js/courses.js — course catalog + enrollment.
   The catalog list/desc/videos stay client-side static data (cheap to render),
   but enrolling and paying always hits the backend so price + records are trustworthy.
*/
const BANNER_COLORS = ['#0e7490', '#4338ca', '#0f766e', '#b91c1c', '#7c2d92', '#15803d', '#9a3412', '#1d4ed8'];
function bannerColor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return BANNER_COLORS[h % BANNER_COLORS.length];
}

const COURSES = [
  { id: 1, title: 'Programming in Java', cat: 'Computer Science / IT', price: 18000, hrs: 60, level: 'Beginner', desc: 'OOP, collections, generics, multithreading, JDBC and Spring Boot for backend development.', rating: 4.8, students: 2100, badge: 'hot', videos: [{ title: 'Java Basics & JVM', yt: 'hBh_CC5y8-s' }, { title: 'OOP Concepts', yt: 'pTB0EiLXUC8' }], curriculum: ['Java Syntax & JVM', 'OOP Principles', 'Data Structures', 'Exception Handling', 'Spring Boot', 'Project: REST API'] },
  { id: 2, title: 'Data Structures & Algorithms', cat: 'Computer Science / IT', price: 15000, hrs: 50, level: 'Intermediate', desc: 'Arrays, linked lists, trees, graphs, sorting and problem-solving for interviews.', rating: 4.9, students: 3200, badge: '', videos: [{ title: 'Arrays & Complexity', yt: 'CBYHwZcbD-s' }], curriculum: ['Big O Notation', 'Arrays & Strings', 'Trees & Heaps', 'Graphs BFS/DFS', 'Dynamic Programming'] },
  { id: 11, title: 'Embedded C Programming', cat: 'Embedded Systems & IoT', price: 22000, hrs: 55, level: 'Beginner', desc: 'Memory-mapped I/O, bit manipulation, pointers, interrupt handling and bare-metal C.', rating: 4.9, students: 1800, badge: 'hot', videos: [{ title: 'Embedded C Intro', yt: 'vDlzmFTxBCk' }], curriculum: ['C Refresher', 'Memory Layout', 'Bit Operations', 'Interrupt Handling', 'Project: Digital Clock'] },
  { id: 14, title: 'RTOS', cat: 'Embedded Systems & IoT', price: 30000, hrs: 65, level: 'Intermediate', desc: 'FreeRTOS, Zephyr — tasks, scheduling, semaphores, queues, mutexes.', rating: 4.9, students: 1000, badge: 'hot', videos: [{ title: 'RTOS Concepts', yt: 'F321087yYy4' }], curriculum: ['RTOS Concepts', 'Task Management', 'Scheduling', 'Semaphores', 'Project: Robot Controller'] },
  { id: 20, title: 'Automotive Embedded Systems', cat: 'Automotive', price: 60000, hrs: 130, level: 'Advanced', desc: 'AUTOSAR, CAN/LIN/Ethernet, functional safety ISO 26262 and MISRA C.', rating: 4.8, students: 890, badge: 'hot', videos: [{ title: 'CAN Bus Protocol', yt: '9IjTbBTdKrM' }], curriculum: ['AUTOSAR Architecture', 'CAN FD', 'ISO 26262', 'UDS Diagnostics', 'Project: ABS Controller'] },
  { id: 23, title: 'Python for Data Science', cat: 'Data Science & AI', price: 35000, hrs: 75, level: 'Intermediate', desc: 'NumPy, Pandas, Matplotlib, Scikit-learn, feature engineering and deployment.', rating: 4.9, students: 3800, badge: '', videos: [{ title: 'Python Crash', yt: 'kqtD5dpn9C8' }], curriculum: ['NumPy & Pandas', 'Data Viz', 'Scikit-learn', 'Model Selection', 'Deployment'] },
  // ...add the remaining catalog entries the same way; ids must match backend/data/courses.json
];
COURSES.forEach((c) => { c.bg = bannerColor(c.cat); });

function courseBanner(c, h) {
  return `<div class="cc-thumb" style="height:${h}px;background:linear-gradient(135deg,${c.bg},${c.bg}cc)">
    <div class="cc-thumb-title">${c.title}</div>
    <div class="cc-thumb-by">BY TS TECH PARK</div>
  </div>`;
}

function renderCourses(data) {
  const grid = document.getElementById('coursesGrid');
  const res = document.getElementById('coursesRes');
  if (res) res.textContent = `Showing ${data.length} course${data.length !== 1 ? 's' : ''}`;
  if (!grid) return;
  if (!data.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-search"></i><p>No courses match your filters.</p><button class="btn-enroll" onclick="clearFilters()">Clear Filters</button></div>`;
    return;
  }
  grid.innerHTML = data.map((c) => `
   <div class="cc" onclick="openCourseModal(${c.id})">
    <div style="position:relative">
     ${courseBanner(c, 140)}
     ${c.badge ? `<span class="cc-badge badge-${c.badge}">${c.badge.toUpperCase()}</span>` : ''}
     <button class="cc-wish ${S.wishlist.has(c.id) ? 'active' : ''}" onclick="event.stopPropagation();toggleWish(${c.id},this)"><i class="fas fa-heart"></i></button>
    </div>
    <div class="cc-body">
     <div class="cc-cat">${c.cat}</div>
     <div class="cc-title">${c.title}</div>
     <div class="cc-desc">${c.desc.substring(0, 82)}…</div>
     <div class="cc-meta"><span><i class="fas fa-clock"></i>${c.hrs}h</span><span><i class="fas fa-signal"></i>${c.level}</span><span><i class="fas fa-users"></i>${c.students.toLocaleString()}</span></div>
     <div class="cc-rating"><span class="stars">${'★'.repeat(Math.floor(c.rating))}</span><strong>${c.rating}</strong></div>
     <div class="cc-footer">
      <div class="cc-price">₹${c.price.toLocaleString()}<span class="cc-old">₹${Math.floor(c.price * 1.2).toLocaleString()}</span></div>
      <button class="btn-enroll" onclick="event.stopPropagation();openCourseModal(${c.id})">Enroll Now</button>
     </div>
    </div>
   </div>`).join('');
}
function filterCourses() {
  const q = (document.getElementById('courseSearch')?.value || '').toLowerCase();
  const cat = document.getElementById('catFilter')?.value || '';
  const level = document.getElementById('levelFilter')?.value || '';
  let data = COURSES.filter((c) => (!q || c.title.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q)) && (!cat || c.cat === cat) && (!level || c.level === level));
  if (S.sortMode === 'popular') data.sort((a, b) => b.students - a.students);
  if (S.sortMode === 'rating') data.sort((a, b) => b.rating - a.rating);
  if (S.sortMode === 'price_asc') data.sort((a, b) => a.price - b.price);
  if (S.sortMode === 'price_desc') data.sort((a, b) => b.price - a.price);
  renderCourses(data);
}
function toggleSort() {
  const modes = ['popular', 'rating', 'price_asc', 'price_desc'];
  const labels = ['Popular', 'Rating', 'Price ↑', 'Price ↓'];
  const idx = (modes.indexOf(S.sortMode) + 1) % modes.length;
  S.sortMode = modes[idx];
  document.getElementById('sortBtn').innerHTML = `<i class="fas fa-sort"></i> ${labels[idx]}`;
  filterCourses();
}
function clearFilters() {
  document.getElementById('courseSearch').value = '';
  document.getElementById('catFilter').value = '';
  document.getElementById('levelFilter').value = '';
  renderCourses(COURSES);
}
function toggleWish(id, btn) {
  if (S.wishlist.has(id)) { S.wishlist.delete(id); btn.classList.remove('active'); showToast('Removed from wishlist', 'info'); }
  else { S.wishlist.add(id); btn.classList.add('active'); showToast('Added to wishlist', 'success'); }
}

/* ---------------- Video player (embedded, no redirect) ---------------- */
function openVideoPlayer(ytId, title, desc) {
  document.getElementById('videoModalBody').innerHTML = `
   <div class="vid-wrap"><iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div>
   <div class="vid-info"><h3>${title}</h3><p>${desc || 'TS Tech Park — Course Content'}</p></div>`;
  openModal('videoModal');
}
function stopVideo() { document.getElementById('videoModalBody').innerHTML = ''; }

/* ---------------- Course modal ---------------- */
function openCourseModal(id) {
  const c = COURSES.find((x) => x.id === id);
  if (!c) return;
  document.getElementById('courseModalBody').innerHTML = `
   ${courseBanner(c, 180).replace('class="cc-thumb"', 'class="cm-thumb"')}
   <div class="cm-body">
    <div style="display:flex;gap:7px;margin-bottom:8px;flex-wrap:wrap">
     <span class="cc-cat" style="margin:0">${c.cat}</span>
     <span style="background:${c.bg}22;color:${c.bg};padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700">${c.level}</span>
    </div>
    <div class="cm-title">${c.title}</div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:9px"><span class="stars">${'★'.repeat(Math.floor(c.rating))}</span><strong>${c.rating}</strong><span style="color:var(--text2);font-size:11px">(${c.students.toLocaleString()} students)</span></div>
    <div class="cm-desc">${c.desc}</div>
    <div class="cm-tabs">
     <button class="cm-tab active" onclick="cmTab(this,'cmCur')">Curriculum</button>
     <button class="cm-tab" onclick="cmTab(this,'cmVid')">Videos</button>
     <button class="cm-tab" onclick="cmTab(this,'cmPay')">Enroll</button>
    </div>
    <div id="cmCur" class="cm-tab-body active">
     ${c.curriculum.map((item, i) => `<div class="cur-item"><i class="fas fa-${i === 0 ? 'play-circle' : 'lock'}"></i><span>${item}</span></div>`).join('')}
    </div>
    <div id="cmVid" class="cm-tab-body">
     ${c.videos.map((v, i) => `<div class="cur-item" onclick="openVideoPlayer('${v.yt}','${v.title}','')"><div style="width:48px;height:32px;border-radius:6px;background:${c.bg}22;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-play-circle" style="color:${c.bg};font-size:18px"></i></div><div><div style="font-weight:700;font-size:12px">${v.title}</div><div style="font-size:10px;color:var(--text2)">Lesson ${i + 1}</div></div></div>`).join('')}
    </div>
    <div id="cmPay" class="cm-tab-body">
     <div style="font-size:1.6rem;font-weight:800;color:var(--accent);margin-bottom:4px">₹${c.price.toLocaleString()}</div>
     <label class="form-label">Choose payment mode</label>
     <div class="pay-opts">
      <label class="pay-opt sel"><input type="radio" name="pm" value="UPI" checked onchange="onPmChange(this)"> <i class="fas fa-mobile-alt"></i> UPI</label>
      <label class="pay-opt"><input type="radio" name="pm" value="Online" onchange="onPmChange(this)"> <i class="fas fa-credit-card"></i> Online</label>
      <label class="pay-opt"><input type="radio" name="pm" value="Cash" onchange="onPmChange(this)"> <i class="fas fa-money-bill-wave"></i> Cash</label>
     </div>
     <button class="btn-full btn-accent" style="margin-top:8px" onclick="payAndEnroll(${c.id})">Pay &amp; Enroll — ₹${c.price.toLocaleString()}</button>
    </div>
   </div>`;
  openModal('courseModal');
}
function cmTab(btn, id) {
  const b = btn.closest('.cm-body');
  b.querySelectorAll('.cm-tab').forEach((t) => t.classList.remove('active'));
  b.querySelectorAll('.cm-tab-body').forEach((t) => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(id).classList.add('active');
}
function onPmChange(input) {
  document.querySelectorAll('.pay-opt').forEach((p) => p.classList.remove('sel'));
  input.closest('.pay-opt').classList.add('sel');
}
async function payAndEnroll(id) {
  if (!S.loggedIn) { openAuth('login'); return; }
  const mode = document.querySelector('input[name="pm"]:checked')?.value || 'UPI';
  try {
    const data = await TS.api(`/courses/${id}/enroll`, { method: 'POST', body: { mode } });
    S.enrolledCourses = data.enrolledCourses;
    document.getElementById('enrolledBadge').textContent = S.enrolledCourses.length;
    closeModal('courseModal');
    showToast(mode === 'Cash' ? 'Enrolled — please pay cash at the office to confirm' : 'Payment successful! Course unlocked.', 'success');
  } catch (e) {
    showToast(e.message, 'error');
  }
}
