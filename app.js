/* ═══════════════════════════════════════════════════════════════
   TS TECH PARK LMS — app.js
   All JS: auth, courses, dashboard, forum, live, admin, chat
   User data flows from signup → everywhere (no hardcoded profiles)
════════════════════════════════════════════════════════════════ */

/* ═══ GLOBAL STATE ═══ */
const STATE = {
  loggedIn:    false,
  user:        null,   // set on login/signup
  wishlist:    new Set(),
  sortMode:    'popular',
  currentPage: 'home',
  dashSection: 'overview',
  quizTimer:   null,
  chatOpen:    false,
  notifOpen:   false,
  adminPage:   1,
  adminFilter: '',
  adminRole:   '',
  forumTab:    'all',
  liveTab:     'live',
  enrolledCourses: [], // IDs
  notes: [],
  forumPosts: [],      // dynamic + seeded
  chatHistory: [],
};

/* ═══ COURSES DATA ═══ */
const COURSES = [
  {id:1,  title:'Embedded Systems Fundamentals', cat:'Embedded Systems',   price:50000, hrs:120, level:'Beginner',     emoji:'🔌', bg:'#0891b2', desc:'Master microcontrollers, RTOS, CAN bus, and industry-grade embedded C development from scratch.',                  rating:4.9, students:1240, badge:'hot',  curriculum:['Intro to Embedded C','MCU Architecture','GPIO & Timers','UART/SPI/I2C','RTOS Basics','CAN Bus Protocol','Project: Smart Car ECU']},
  {id:2,  title:'Automotive Embedded Systems',   cat:'Embedded Systems',   price:60000, hrs:130, level:'Advanced',     emoji:'🚗', bg:'#7c3aed', desc:'AUTOSAR, CAN/LIN/Ethernet, functional safety and ISO 26262 — industry-grade automotive embedded engineering.',        rating:4.8, students:890,  badge:'hot',  curriculum:['AUTOSAR Architecture','CAN FD Protocol','Automotive Ethernet','ISO 26262 Safety','Diagnostics (UDS)','MISRA C Standard','Capstone: ABS Controller']},
  {id:3,  title:'Edge AI & Deep Learning',        cat:'Artificial Intelligence', price:70000, hrs:100, level:'Advanced',emoji:'🧠', bg:'#e94560', desc:'Deploy AI models on edge devices. TensorFlow Lite, OpenVINO, NVIDIA Jetson and real-time inference.',              rating:4.7, students:650,  badge:'new',  curriculum:['Neural Networks','CNNs and RNNs','Model Quantization','TensorFlow Lite','OpenVINO','Jetson Nano Deploy','Project: Object Detection']},
  {id:4,  title:'IoT & Robotics',                 cat:'Embedded Systems',   price:55000, hrs:110, level:'Intermediate', emoji:'🤖', bg:'#059669', desc:'Build intelligent IoT systems and robotic platforms using Arduino, Raspberry Pi, ROS and cloud.',                   rating:4.8, students:780,  badge:'',     curriculum:['Arduino Deep Dive','Raspberry Pi 4','Sensors & Actuators','MQTT Protocol','AWS IoT Core','ROS Basics','Project: Autonomous Robot']},
  {id:5,  title:'Python for Data Science',        cat:'Data Science',       price:40000, hrs:80,  level:'Intermediate', emoji:'🐍', bg:'#2563eb', desc:'Complete Python data science stack: NumPy, Pandas, Matplotlib, Scikit-learn and real-world ML projects.',           rating:4.9, students:2100, badge:'',     curriculum:['Python Advanced','NumPy & Pandas','Data Viz','Machine Learning','Deep Learning Intro','Dataset Projects','Deployment Basics']},
  {id:6,  title:'Full-Stack Web Development',     cat:'Web Development',    price:20000, hrs:60,  level:'Beginner',     emoji:'🌐', bg:'#0f3460', desc:'HTML to React to Node.js — build complete web apps with databases and deploy to the cloud.',                        rating:4.6, students:1500, badge:'',     curriculum:['HTML/CSS/JS','React JS','Node.js & Express','MongoDB','REST APIs','Auth (JWT)','Deploy on Vercel']},
  {id:7,  title:'Machine Learning Engineering',   cat:'Artificial Intelligence', price:45000, hrs:90, level:'Advanced',emoji:'🔮', bg:'#7c3aed', desc:'Production ML: feature engineering, MLOps pipelines, model monitoring and real-time inference at scale.',           rating:4.7, students:540,  badge:'new',  curriculum:['Supervised Learning','Unsupervised Learning','Model Evaluation','Feature Eng','ML Pipelines','Docker & MLflow','Deployment & Monitoring']},
  {id:8,  title:'Cloud Computing & DevOps',       cat:'Cloud & DevOps',     price:30000, hrs:50,  level:'Intermediate', emoji:'☁️', bg:'#0891b2', desc:'AWS/Azure/GCP, Docker, Kubernetes, CI/CD pipelines and infrastructure-as-code for modern deployments.',            rating:4.5, students:860,  badge:'',     curriculum:['AWS Core Services','Docker & Containers','Kubernetes','CI/CD GitHub Actions','Terraform','Monitoring','Cost Optimization']},
  {id:9,  title:'Cybersecurity & Ethical Hacking',cat:'Cybersecurity',      price:35000, hrs:70,  level:'Intermediate', emoji:'🔐', bg:'#dc2626', desc:'Penetration testing, vulnerability assessment, network security, CTF challenges and bug bounty basics.',            rating:4.8, students:420,  badge:'hot',  curriculum:['Network Security','Linux for Hackers','Metasploit','Web App Pentesting','CTF Challenges','Malware Analysis','Bug Bounty Basics']},
  {id:10, title:'VLSI Design & Verification',     cat:'Electronics',        price:50000, hrs:100, level:'Advanced',     emoji:'⚡', bg:'#0e7490', desc:'RTL design, SystemVerilog, UVM verification and FPGA implementation for chip-level engineering.',                  rating:4.7, students:280,  badge:'',     curriculum:['Digital Design','Verilog HDL','SystemVerilog','UVM Methodology','FPGA Implementation','Timing Analysis','Tapeout Basics']},
  {id:11, title:'SQL & Database Management',      cat:'Programming',        price:10000, hrs:25,  level:'Beginner',     emoji:'🗄️', bg:'#0891b2', desc:'Master SQL from basics to advanced: joins, stored procedures, indexing, query optimisation and real projects.',   rating:4.8, students:3200, badge:'free', curriculum:['SQL Basics','Advanced Joins','Stored Procs','Indexing & Perf','NoSQL Intro','Database Design','Real-world Projects']},
  {id:12, title:'React JS & Modern Frontend',     cat:'Web Development',    price:18000, hrs:45,  level:'Intermediate', emoji:'⚛️', bg:'#2563eb', desc:'Build modern React apps with hooks, Redux, TypeScript, React Query and testing best practices.',                  rating:4.9, students:1800, badge:'',     curriculum:['React Fundamentals','Hooks Deep Dive','State Management','TypeScript','React Query','Testing with Jest','Performance Opt']},
];

/* ═══ SEEDED FORUM POSTS ═══ */
const SEED_POSTS = [
  {id:1001, user:'Priya M', av:'PM', color:'#7c3aed', time:'2 hrs ago', cat:'Doubt', catColor:'#e94560',
   title:'CAN bus vs LIN bus — when to choose?', text:'Working on a dashboard ECU project, confused about which protocol to use for body ECUs. Any advice?',
   likes:23, replies:8, tags:['CAN','LIN','Automotive'], type:'questions'},
  {id:1002, user:'Arjun V', av:'AV', color:'#0891b2', time:'4 hrs ago', cat:'Project', catColor:'#059669',
   title:'Built lane detection with Edge AI on Jetson Nano!', text:'Completed my capstone — YOLO v8 + TensorRT on Jetson Nano for real-time lane detection at 30fps. Happy to share code.',
   likes:87, replies:24, tags:['Edge AI','Jetson','YOLO'], type:'projects'},
  {id:1003, user:'Deepa K', av:'DK', color:'#dc2626', time:'6 hrs ago', cat:'Question', catColor:'#f59e0b',
   title:'MISRA C beginner resources?', text:'Starting automotive embedded internship next month. Where should I start learning MISRA C standards?',
   likes:14, replies:12, tags:['MISRA-C','Automotive','C'], type:'questions'},
  {id:1004, user:'TS Tech Park', av:'TS', color:'#e94560', time:'1 day ago', cat:'Announcement', catColor:'#0891b2',
   title:'New Batch: Automotive Embedded — July 2026', text:'Applications open for our next batch starting July 1st, 2026. Limited seats. Early bird discount of 15% available.',
   likes:142, replies:35, tags:['Announcement','Batch'], type:'announcements'},
];

/* ═══ LIVE CLASSES DATA ═══ */
const LIVE_CLASSES = {
  live: [
    {title:'Edge AI: Neural Network Quantization', instructor:'Dr. Vijay R.', time:'LIVE NOW',   attendees:142, platform:'Zoom',        emoji:'🧠'},
  ],
  upcoming: [
    {title:'Automotive CAN FD — Advanced Session', instructor:'Mr. Suresh K.', time:'Tomorrow, 10:00 AM', attendees:89, platform:'Google Meet', emoji:'🚗'},
    {title:'Python for Embedded Engineers',        instructor:'Ms. Priya N.', time:'Tomorrow, 3:00 PM',  attendees:203, platform:'Zoom',       emoji:'🐍'},
    {title:'RTOS Deep Dive: FreeRTOS Tasks',       instructor:'Mr. Karthik V.',time:'Thu, 11:00 AM',     attendees:67,  platform:'Zoom',       emoji:'⏱'},
    {title:'React + Node.js Full Project',         instructor:'Ms. Sneha L.', time:'Fri, 4:00 PM',      attendees:112, platform:'Zoom',       emoji:'🌐'},
  ],
  recordings: [
    {title:'Introduction to AUTOSAR Architecture', instructor:'Dr. Vijay R.', time:'Recorded: Jun 5, 2026', attendees:0, platform:'YouTube', emoji:'📹', duration:'2h 14m'},
    {title:'Python ML: Scikit-learn Deep Dive',   instructor:'Ms. Priya N.', time:'Recorded: Jun 3, 2026', attendees:0, platform:'YouTube', emoji:'🐍', duration:'1h 48m'},
    {title:'Docker & Kubernetes for Beginners',   instructor:'Mr. Karthik V.',time:'Recorded: Jun 1, 2026', attendees:0, platform:'YouTube', emoji:'☁️', duration:'3h 02m'},
  ]
};

/* ═══ AI CHATBOT RESPONSES ═══ */
const AI_KB = {
  'can bus': '**CAN (Controller Area Network) Bus** is a robust serial protocol developed by Bosch (1983), widely used in automotive ECU communication.<br><br>• Multi-master, broadcast protocol<br>• Up to 1 Mbps (Classical) or 8 Mbps (CAN FD)<br>• Differential signaling for noise immunity<br>• Built-in error detection (CRC, ACK, EOF)<br><br>Covered in depth in our <strong>Automotive Embedded Systems</strong> course! 🚗',
  'rtos': '<strong>RTOS (Real-Time Operating System)</strong> guarantees task execution within strict time constraints.<br><br>Key concepts:<br>• Task scheduling (preemptive priority)<br>• Mutexes, semaphores, queues<br>• ISR-safe APIs<br>• FreeRTOS, Zephyr, VxWorks<br><br>We cover FreeRTOS in detail in our Embedded Fundamentals course! ⏱',
  'iso 26262': '<strong>ISO 26262</strong> is the functional safety standard for automotive electrical/electronic systems.<br><br>• Defines ASIL levels: A → D (most critical)<br>• Covers hardware and software development lifecycle<br>• Requires hazard analysis, risk assessment<br>• ASIL D = airbags, steering, brakes<br><br>Covered in our Automotive Embedded course! 🛡',
  'autosar': '<strong>AUTOSAR</strong> (AUTomotive Open System ARchitecture) is a standardized automotive software framework.<br><br>Layers: BSW → RTE → SWC<br>• Classic AUTOSAR: safety-critical ECUs<br>• Adaptive AUTOSAR: ADAS, Infotainment<br>• Enables software reuse across OEMs<br><br>Full AUTOSAR module in Automotive Embedded course! 🚘',
  'study plan': '<strong>Recommended Study Plan:</strong><br><br>Month 1-2: Choose a domain (Embedded / AI / Web)<br>Month 2-3: Core programming (C/Python)<br>Month 3-5: Domain deep dive<br>Month 5-6: Capstone project + placement prep<br><br>Tell me your current background for a personalised plan! 📅',
  'career': '<strong>Tech Career Paths at TS Tech Park:</strong><br><br>🔌 Embedded: ₹3-30 LPA (Bosch, KPIT, Aptiv)<br>🧠 AI/ML: ₹6-35 LPA (Google, Qualcomm, startups)<br>🌐 Full Stack: ₹4-25 LPA (product companies)<br><br>Our placement rate is <strong>98%</strong>! Which domain interests you most?',
  'recommend': '<strong>Top Course Recommendations:</strong><br><br>🏆 <strong>Automotive Embedded</strong> — ₹60,000, 98% placement<br>🧠 <strong>Edge AI</strong> — ₹70,000, cutting-edge career<br>🐍 <strong>Python for DS</strong> — ₹40,000, most enrolled<br><br>What\'s your background? I can personalise this!',
  'certificate': 'TS Tech Park certificates are:<br><br>✅ QR-verified & blockchain-backed<br>✅ Recognised by 200+ hiring partners<br>✅ LinkedIn-shareable<br>✅ Issued within 24 hours of course completion<br><br>Each certificate has a unique ID you can verify online!',
  'fee': 'Course fees range from <strong>₹10,000</strong> (SQL basics) to <strong>₹70,000</strong> (Edge AI).<br><br>💳 Payment options: UPI, Card, Net Banking, EMI, Cash<br>🎓 EMI available on all courses above ₹20,000<br>💰 Group discounts available (3+ students)<br><br>Check the Courses page for detailed pricing!',
  'hello': 'Hello! 👋 Great to connect! I\'m <strong>TechBot</strong>, your AI tutor at TS Tech Park.<br><br>I can help with course recommendations, technical concepts, study planning, and career guidance. What would you like to explore?',
  'thank': 'You\'re welcome! 😊 Keep up the great learning spirit! Is there anything else I can help you with?',
};

/* ═══════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  STATE.forumPosts = [...SEED_POSTS];
  initParticles();
  renderCourses(COURSES);
  renderForum();
  renderLiveClasses('live');
  renderAdminTable();
  renderAdminChart();
  renderAdminTopCourses();
  renderAdminActivityLog();
  renderNotifications();
  renderChatWelcome();
  loadFromStorage();
});

function loadFromStorage() {
  const saved = localStorage.getItem('ts_user');
  if (saved) {
    STATE.user = JSON.parse(saved);
    STATE.loggedIn = true;
    afterLogin();
  }
}

/* ═══ HERO PARTICLES ═══ */
function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left   = Math.random() * 100 + '%';
    p.style.top    = Math.random() * 100 + '%';
    p.style.animationDelay    = Math.random() * 6 + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    p.style.opacity = (0.2 + Math.random() * 0.5).toString();
    container.appendChild(p);
  }
}

/* ═══ THEME ═══ */
function toggleTheme() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
  document.getElementById('themeIcon').className = isDark ? 'fas fa-moon' : 'fas fa-sun';
  showToast(isDark ? 'Light mode on' : 'Dark mode on', 'info');
}

/* ═══ PAGE NAVIGATION ═══ */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.textContent.trim().toLowerCase().includes(name.toLowerCase()));
  });
  STATE.currentPage = name;
  window.scrollTo(0, 0);

  if (name === 'dashboard') {
    if (!STATE.loggedIn) { openAuth('login'); return; }
    renderDashOverview();
  }
  if (name === 'profile') renderProfilePage();
  if (name === 'admin') { renderAdminTable(); }
}

/* ═══ MOBILE MENU ═══ */
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
  document.getElementById('mobileMenuOverlay').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('mobileMenuOverlay').classList.remove('open');
}

function setMbnav(el) {
  document.querySelectorAll('.mbnav-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

/* ═══ NOTIFICATIONS ═══ */
function renderNotifications() {
  const panel = document.getElementById('notifPanel');
  const items = [
    {icon:'fa-robot',     cls:'ad-purple', title:'AI Quiz Ready',        body:'Embedded Systems quiz generated for you',  time:'2 min ago',  unread:true},
    {icon:'fa-certificate',cls:'ad-green', title:'Certificate Earned!',  body:'Python for Data Science — completed',       time:'1 hr ago',   unread:true},
    {icon:'fa-video',     cls:'ad-blue',   title:'Live Class in 30 mins',body:'Edge AI: Neural Networks starting soon',    time:'25 min ago', unread:false},
    {icon:'fa-trophy',    cls:'ad-gold',   title:'New Badge Unlocked',   body:'You earned "Code Ninja" badge 🥷',          time:'3 hr ago',   unread:false},
  ];
  panel.innerHTML = `
    <div class="notif-panel-header">
      <span style="font-weight:700;font-size:15px;">Notifications</span>
      <span style="font-size:12px;color:var(--accent);cursor:pointer;" onclick="markAllRead()">Mark all read</span>
    </div>
    ${items.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}">
        <div class="notif-icon ${n.cls}"><i class="fas ${n.icon}"></i></div>
        <div class="notif-text">
          <div class="notif-title">${n.title}</div>
          <div class="notif-body">${n.body}</div>
          <div class="notif-time">${n.time}</div>
        </div>
        ${n.unread ? '<div class="unread-dot"></div>' : ''}
      </div>`).join('')}
    <div style="padding:12px;text-align:center;font-size:13px;color:var(--accent);cursor:pointer;font-weight:600;">View all notifications</div>`;
}
function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(i => i.classList.remove('unread'));
  document.querySelectorAll('.unread-dot').forEach(d => d.remove());
  document.getElementById('notifBadge').style.display = 'none';
  showToast('All notifications marked as read', 'success');
}
function toggleNotif() {
  STATE.notifOpen = !STATE.notifOpen;
  document.getElementById('notifPanel').classList.toggle('open', STATE.notifOpen);
}
document.addEventListener('click', e => {
  if (STATE.notifOpen && !e.target.closest('#notifPanel') && !e.target.closest('#notifBtn')) {
    STATE.notifOpen = false;
    document.getElementById('notifPanel').classList.remove('open');
  }
});

/* ═══════════════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════════════════ */
function openAuth(tab) {
  document.getElementById('authModal').classList.add('active');
  switchAuth(tab);
}
function switchAuth(tab) {
  document.getElementById('loginForm').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('signupTab').classList.toggle('active', tab === 'signup');
}
function setRole(btn) {
  btn.closest('.role-select').querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  const isPass = inp.type === 'password';
  inp.type = isPass ? 'text' : 'password';
  btn.innerHTML = isPass ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
}
function checkPasswordStrength(val) {
  const el = document.getElementById('pwStrength');
  if (!el) return;
  if (val.length === 0) { el.className = 'pw-strength'; el.title = ''; return; }
  if (val.length < 6)   { el.className = 'pw-strength weak';   el.title = 'Weak'; return; }
  if (val.length < 10 || !/[0-9]/.test(val)) { el.className = 'pw-strength medium'; el.title = 'Medium'; return; }
  el.className = 'pw-strength strong'; el.title = 'Strong';
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  if (!email || !pass) { showToast('Please fill in all fields', 'error'); return; }

  // Check stored accounts
  const accounts = JSON.parse(localStorage.getItem('ts_accounts') || '[]');
  const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() || a.username === email);
  if (!found) {
    // Demo fallback: accept anything
    const user = {
      firstName: email.split('@')[0],
      lastName: '',
      email: email,
      phone: '',
      city: '',
      role: 'student',
      joinedDate: new Date().toLocaleDateString('en-IN', {month:'short', year:'numeric'}),
      xp: 0, streak: 0, hoursLearned: 0, certificates: 0, enrolledCount: 0,
    };
    finishLogin(user);
  } else {
    finishLogin(found);
  }
}

function doSignup() {
  const fname = document.getElementById('regFname').value.trim();
  const lname = document.getElementById('regLname').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const city  = document.getElementById('regCity').value.trim();
  const pass  = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const role  = document.querySelector('#signupForm .role-btn.active')?.textContent.trim().toLowerCase().replace(/\s+/g,'') || 'student';

  if (!fname || !email || !phone || !pass) { showToast('Please fill all required fields', 'error'); return; }
  if (pass !== pass2)                      { showToast('Passwords do not match', 'error'); return; }
  if (pass.length < 6)                     { showToast('Password must be at least 6 characters', 'error'); return; }

  const user = {
    firstName: fname,
    lastName: lname,
    email: email,
    phone: phone,
    city: city,
    role: role.includes('instructor') ? 'Instructor' : 'Student',
    joinedDate: new Date().toLocaleDateString('en-IN', {month:'short', year:'numeric'}),
    xp: 0, streak: 1, hoursLearned: 0, certificates: 0, enrolledCount: 0,
    username: email.split('@')[0],
  };

  // Save to local storage registry
  const accounts = JSON.parse(localStorage.getItem('ts_accounts') || '[]');
  accounts.push({ ...user, pass });
  localStorage.setItem('ts_accounts', JSON.stringify(accounts));

  finishLogin(user);
  showToast(`Welcome, ${fname}! Account created 🎉`, 'success');
}

function finishLogin(user) {
  STATE.user = user;
  STATE.loggedIn = true;
  localStorage.setItem('ts_user', JSON.stringify(user));
  closeModal('authModal');
  afterLogin();
  showPage('dashboard');
  if (!user.firstName.includes('@')) {
    showToast(`Welcome back, ${user.firstName}! 👋`, 'success');
  }
}

function afterLogin() {
  const u = STATE.user;
  const initials = getInitials(u);

  // Navbar avatar
  document.getElementById('userAvatarBtn').style.display = 'flex';
  document.getElementById('userAvatarInitials').textContent = initials;
  document.getElementById('guestButtons').style.display = 'none';

  // Sidebar user
  document.getElementById('suAvatar').textContent = initials;
  document.getElementById('suName').textContent   = getDisplayName(u);

  // Profile banner
  renderProfilePage();
}

function doLogout() {
  STATE.loggedIn = false;
  STATE.user = null;
  localStorage.removeItem('ts_user');
  document.getElementById('userAvatarBtn').style.display = 'none';
  document.getElementById('guestButtons').style.display = 'flex';
  document.getElementById('suAvatar').textContent = '?';
  document.getElementById('suName').textContent   = 'Guest';
  showPage('home');
  showToast('Logged out successfully', 'info');
}

function getInitials(u) {
  if (!u) return '?';
  const f = (u.firstName || '').charAt(0).toUpperCase();
  const l = (u.lastName  || '').charAt(0).toUpperCase();
  return (f + l) || (u.email || '?').charAt(0).toUpperCase();
}
function getDisplayName(u) {
  if (!u) return 'Guest';
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return full || u.email || 'User';
}

function handleOverlayClick(e, modalId) {
  if (e.target === e.currentTarget) closeModal(modalId);
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

/* ═══════════════════════════════════════════════════════════════
   COURSES
════════════════════════════════════════════════════════════════ */
function renderCourses(data) {
  const grid = document.getElementById('coursesGrid');
  const res  = document.getElementById('coursesResults');
  if (res) res.textContent = `Showing ${data.length} course${data.length !== 1 ? 's' : ''}`;
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <i class="fas fa-search"></i>
      <p>No courses match your filters.</p>
      <button class="btn-enroll" onclick="clearFilters()">Clear Filters</button>
    </div>`;
    return;
  }

  grid.innerHTML = data.map(c => `
    <div class="course-card" onclick="openCourseModal(${c.id})">
      <div class="cc-thumb" style="background:linear-gradient(135deg,${c.bg}22,${c.bg}55);">
        <span>${c.emoji}</span>
        ${c.badge ? `<span class="cc-badge badge-${c.badge}">${c.badge.toUpperCase()}</span>` : ''}
        <button class="cc-wishlist ${STATE.wishlist.has(c.id)?'active':''}"
          onclick="event.stopPropagation();toggleWishlist(${c.id},this)">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <div class="cc-body">
        <div class="cc-cat">${c.cat}</div>
        <div class="cc-title">${c.title}</div>
        <div class="cc-desc">${c.desc.substring(0,88)}…</div>
        <div class="cc-meta">
          <span><i class="fas fa-clock"></i>${c.hrs} hrs</span>
          <span><i class="fas fa-signal"></i>${c.level}</span>
          <span><i class="fas fa-users"></i>${c.students.toLocaleString()}</span>
        </div>
        <div class="cc-rating">
          <span class="stars">${'★'.repeat(Math.floor(c.rating))}</span>
          <strong>${c.rating}</strong>
        </div>
        <div class="cc-footer">
          <div class="cc-price">
            ${c.price === 0
              ? '<span style="color:var(--green);font-weight:800;">FREE</span>'
              : `₹${c.price.toLocaleString()}<span class="cc-old-price">₹${Math.floor(c.price*1.2).toLocaleString()}</span>`}
          </div>
          <button class="btn-enroll" onclick="event.stopPropagation();enrollCourse(${c.id})">Enroll Now</button>
        </div>
      </div>
    </div>`).join('');
}

function filterCourses() {
  const q     = (document.getElementById('courseSearch')?.value || '').toLowerCase();
  const cat   = document.getElementById('catFilter')?.value   || '';
  const price = document.getElementById('priceFilter')?.value || '';
  const level = document.getElementById('levelFilter')?.value || '';

  let data = COURSES.filter(c => {
    const mq  = !q    || c.title.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
    const mc  = !cat  || c.cat === cat;
    const ml  = !level|| c.level === level;
    let   mp  = true;
    if (price === 'free')    mp = c.price === 0;
    if (price === 'under10') mp = c.price < 10000;
    if (price === 'under30') mp = c.price < 30000;
    if (price === 'premium') mp = c.price >= 50000;
    return mq && mc && ml && mp;
  });

  if (STATE.sortMode === 'popular') data.sort((a,b) => b.students - a.students);
  if (STATE.sortMode === 'price_asc') data.sort((a,b) => a.price - b.price);
  if (STATE.sortMode === 'price_desc') data.sort((a,b) => b.price - a.price);
  if (STATE.sortMode === 'rating') data.sort((a,b) => b.rating - a.rating);
  if (STATE.sortMode === 'newest') data.sort((a,b) => (b.badge==='new'?1:0) - (a.badge==='new'?1:0));

  renderCourses(data);
}

function toggleSort() {
  const modes = ['popular','rating','price_asc','price_desc','newest'];
  const labels = ['Popular','Rating','Price ↑','Price ↓','Newest'];
  const idx = (modes.indexOf(STATE.sortMode) + 1) % modes.length;
  STATE.sortMode = modes[idx];
  const btn = document.getElementById('sortBtn');
  if (btn) btn.innerHTML = `<i class="fas fa-sort"></i> Sort: ${labels[idx]}`;
  filterCourses();
}

function clearFilters() {
  document.getElementById('courseSearch').value = '';
  document.getElementById('catFilter').value   = '';
  document.getElementById('priceFilter').value = '';
  document.getElementById('levelFilter').value = '';
  renderCourses(COURSES);
}

function toggleWishlist(id, btn) {
  if (STATE.wishlist.has(id)) {
    STATE.wishlist.delete(id);
    btn.classList.remove('active');
    showToast('Removed from wishlist', 'info');
  } else {
    STATE.wishlist.add(id);
    btn.classList.add('active');
    showToast('Added to wishlist ❤️', 'success');
  }
}

function enrollCourse(id) {
  if (!STATE.loggedIn) { openAuth('login'); return; }
  const c = COURSES.find(x => x.id === id);
  if (!STATE.enrolledCourses.includes(id)) {
    STATE.enrolledCourses.push(id);
    if (STATE.user) STATE.user.enrolledCount = (STATE.user.enrolledCount || 0) + 1;
  }
  closeModal('courseModal');
  showToast(`Enrolled in ${c.title}! 🎉`, 'success');
}

/* ─── Course Modal ─── */
function openCourseModal(id) {
  const c = COURSES.find(x => x.id === id);
  if (!c) return;
  document.getElementById('courseModalBody').innerHTML = `
    <div class="cm-thumb" style="background:linear-gradient(135deg,${c.bg}33,${c.bg}77);">
      <span>${c.emoji}</span>
      <div class="cm-play" onclick="showToast('Loading preview…','info')"><i class="fas fa-play"></i></div>
    </div>
    <div class="cm-body">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
        <span class="cc-cat" style="margin:0;">${c.cat}</span>
        <span style="background:${c.bg}22;color:${c.bg};padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;">${c.level}</span>
        ${c.badge ? `<span class="cc-badge badge-${c.badge}" style="position:static;margin:0;">${c.badge.toUpperCase()}</span>` : ''}
      </div>
      <div class="cm-title">${c.title}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span class="stars">${'★'.repeat(Math.floor(c.rating))}</span>
        <strong>${c.rating}</strong>
        <span style="color:var(--text2);font-size:13px;">(${c.students.toLocaleString()} students)</span>
      </div>
      <div class="cm-desc">${c.desc}</div>
      <div class="cm-tabs">
        <button class="cm-tab active" onclick="cmSwitchTab(this,'cmCur')">📚 Curriculum</button>
        <button class="cm-tab" onclick="cmSwitchTab(this,'cmPay')">💳 Enroll</button>
        <button class="cm-tab" onclick="cmSwitchTab(this,'cmRev')">⭐ Reviews</button>
        <button class="cm-tab" onclick="cmSwitchTab(this,'cmInfo')">ℹ️ Info</button>
      </div>
      <div id="cmCur" class="cm-tab-body active">
        ${c.curriculum.map((item,i) => `
          <div class="curriculum-item">
            <i class="fas fa-${i===0?'play-circle':'lock'}"></i>
            <span>${item}</span>
            ${i===0?'<span style="margin-left:auto;font-size:11px;color:var(--green);font-weight:700;">FREE PREVIEW</span>':''}
          </div>`).join('')}
      </div>
      <div id="cmPay" class="cm-tab-body">
        <div style="font-size:2rem;font-weight:800;margin-bottom:6px;">₹${c.price.toLocaleString()}</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:16px;">Lifetime access • Certificate included • All updates free</div>
        <div style="font-size:14px;font-weight:600;margin-bottom:10px;">Payment Method:</div>
        <div class="pay-opts">
          <label class="pay-opt selected"><input type="radio" name="pm" value="upi" checked style="margin-right:5px;"> 📱 UPI</label>
          <label class="pay-opt"><input type="radio" name="pm" value="card"       style="margin-right:5px;"> 💳 Card</label>
          <label class="pay-opt"><input type="radio" name="pm" value="net"        style="margin-right:5px;"> 🏦 Net Banking</label>
          <label class="pay-opt"><input type="radio" name="pm" value="emi"        style="margin-right:5px;"> 📅 EMI</label>
          <label class="pay-opt"><input type="radio" name="pm" value="cash"       style="margin-right:5px;"> 💵 Cash</label>
        </div>
        <button class="btn-full btn-accent" style="margin-top:10px;"
          onclick="enrollCourse(${c.id});showToast('Payment successful! Course unlocked 🎉','success')">
          Pay &amp; Enroll — ₹${c.price.toLocaleString()}
        </button>
        <div style="text-align:center;margin-top:10px;font-size:13px;color:var(--text2);">
          🔒 Secure · 30-day money-back guarantee
        </div>
      </div>
      <div id="cmRev" class="cm-tab-body">
        ${['Excellent! Got placed at KPIT within 2 months of completing this course.',
           'Best Embedded course in Tamil Nadu. Hands-on projects made all the difference.',
           'The CAN bus and AUTOSAR modules alone are worth the entire fee.'].map((r,i) => `
          <div style="padding:14px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--purple));
                          display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;">
                ${['RK','PM','AV'][i]}
              </div>
              <div>
                <div style="font-weight:700;font-size:14px;">${['Rajesh K.','Priya M.','Arjun V.'][i]}</div>
                <span class="stars">★★★★★</span>
              </div>
            </div>
            <p style="font-size:14px;color:var(--text2);line-height:1.6;">${r}</p>
          </div>`).join('')}
      </div>
      <div id="cmInfo" class="cm-tab-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:14px;">
          <div><strong><i class="fas fa-clock" style="color:var(--accent);margin-right:5px;"></i>Duration</strong><div style="color:var(--text2);margin-top:3px;">${c.hrs} hours</div></div>
          <div><strong><i class="fas fa-signal" style="color:var(--accent);margin-right:5px;"></i>Level</strong><div style="color:var(--text2);margin-top:3px;">${c.level}</div></div>
          <div><strong><i class="fas fa-users" style="color:var(--accent);margin-right:5px;"></i>Students</strong><div style="color:var(--text2);margin-top:3px;">${c.students.toLocaleString()}</div></div>
          <div><strong><i class="fas fa-star" style="color:var(--gold);margin-right:5px;"></i>Rating</strong><div style="color:var(--text2);margin-top:3px;">${c.rating}/5.0</div></div>
          <div><strong><i class="fas fa-certificate" style="color:var(--accent);margin-right:5px;"></i>Certificate</strong><div style="color:var(--text2);margin-top:3px;">Yes, QR-verified</div></div>
          <div><strong><i class="fas fa-language" style="color:var(--accent);margin-right:5px;"></i>Language</strong><div style="color:var(--text2);margin-top:3px;">English / Tamil</div></div>
        </div>
      </div>
    </div>`;
  document.getElementById('courseModal').classList.add('active');
}

function cmSwitchTab(btn, tabId) {
  const modal = btn.closest('.cm-body');
  modal.querySelectorAll('.cm-tab').forEach(t => t.classList.remove('active'));
  modal.querySelectorAll('.cm-tab-body').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════════ */
function switchDash(btn, section) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  if (btn) btn.classList.add('active');
  STATE.dashSection = section;
  const fns = {
    overview, mycourses:renderMyCourses, progress:renderProgress,
    quizzes:renderQuizzes, certificates:renderCertificates,
    assignments:renderAssignments, notes:renderNotes,
    wishlist:renderWishlistDash, gamification:renderGamification,
    leaderboard:renderLeaderboard, schedule:renderSchedule,
    payments:renderPayments, settings:renderSettings
  };
  const fn = fns[section] || renderDashOverview;
  fn();
}
function renderDashOverview() { overview(); }

function overview() {
  if (!STATE.loggedIn) { openAuth('login'); return; }
  const u = STATE.user;
  const name = getDisplayName(u);
  const enrolled = [
    {name:'Automotive Embedded Systems', prog:72, emoji:'🚗', bg:'#7c3aed'},
    {name:'Edge AI & Deep Learning',     prog:45, emoji:'🧠', bg:'#e94560'},
    {name:'Python for Data Science',     prog:88, emoji:'🐍', bg:'#2563eb'},
    {name:'IoT & Robotics',             prog:30, emoji:'🤖', bg:'#059669'},
  ];

  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header">
      <div>
        <h2>Welcome back, ${name}! 👋</h2>
        <p>You have 2 assignments due and 1 live class today.</p>
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:7px;background:rgba(233,69,96,0.1);
                    border:1px solid rgba(233,69,96,0.2);border-radius:10px;padding:8px 14px;font-size:13px;color:var(--accent);">
          <i class="fas fa-fire"></i> ${u.streak || 1}-day streak! Keep it up!
        </div>
        <button class="btn-sm btn-primary" onclick="switchDash(null,'quizzes')"><i class="fas fa-robot"></i> Start AI Quiz</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card c1"><div class="sc-icon"><i class="fas fa-book-open"></i></div><div class="sc-val">${u.enrolledCount||4}</div><div class="sc-lbl">Enrolled Courses</div><div class="sc-chg">↑ 1 new this week</div></div>
      <div class="stat-card c2"><div class="sc-icon"><i class="fas fa-clock"></i></div><div class="sc-val">${u.hoursLearned||142}h</div><div class="sc-lbl">Hours Learned</div><div class="sc-chg">↑ 8h this week</div></div>
      <div class="stat-card c3"><div class="sc-icon"><i class="fas fa-star"></i></div><div class="sc-val">${u.xp||3420}</div><div class="sc-lbl">XP Points</div><div class="sc-chg">Rank #12 overall</div></div>
      <div class="stat-card c4"><div class="sc-icon"><i class="fas fa-certificate"></i></div><div class="sc-val">${u.certificates||2}</div><div class="sc-lbl">Certificates</div><div class="sc-chg">2 more in progress</div></div>
    </div>

    <div class="dash-grid-2">
      <div class="dash-card">
        <div class="dc-title">Continue Learning <a href="#" onclick="switchDash(null,'mycourses')">View all</a></div>
        ${enrolled.map(c => `
          <div class="enrolled-item">
            <div class="ei-icon" style="background:${c.bg}22;">${c.emoji}</div>
            <div class="ei-info">
              <div class="ei-name">${c.name}</div>
              <div class="ei-prog">
                <div class="mini-bar"><div class="mini-fill" style="width:${c.prog}%;"></div></div>
                ${c.prog}%
              </div>
            </div>
            <button class="btn-resume" onclick="showToast('Opening ${c.name}…','info')">Resume</button>
          </div>`).join('')}
      </div>
      <div>
        <div class="dash-card" style="margin-bottom:16px;">
          <div class="dc-title">Recent Activity</div>
          ${[
            {icon:'fa-check-circle', cls:'ad-green',  title:'Completed: CAN Bus Module',   time:'2 hrs ago'},
            {icon:'fa-trophy',       cls:'ad-gold',   title:'Badge Earned: "Code Ninja"',  time:'5 hrs ago'},
            {icon:'fa-clipboard-check',cls:'ad-blue', title:'Quiz: 8/10 on RTOS Basics',   time:'Yesterday'},
            {icon:'fa-play',         cls:'ad-purple', title:'Started: Edge AI Module 4',    time:'2 days ago'},
          ].map(a => `
            <div class="activity-item">
              <div class="act-dot ${a.cls}"><i class="fas ${a.icon}" style="font-size:13px;"></i></div>
              <div><div class="act-title">${a.title}</div><div class="act-time">${a.time}</div></div>
            </div>`).join('')}
        </div>
        <div class="streak-card">
          <div style="font-size:11px;opacity:0.7;margin-bottom:4px;">🔥 CURRENT STREAK</div>
          <div class="streak-num">${u.streak || 7}</div>
          <div style="font-size:13px;opacity:0.7;">days in a row!</div>
          <div class="week-dots">
            ${['M','T','W','T','F','S','S'].map((d,i) => `
              <div class="wd ${i<5?'wd-done':i===5?'wd-today':'wd-future'}">${d}</div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function renderMyCourses() {
  const courses = [
    {name:'Automotive Embedded Systems', prog:72, emoji:'🚗', bg:'#7c3aed', hrs:130, done:94},
    {name:'Edge AI & Deep Learning',     prog:45, emoji:'🧠', bg:'#e94560', hrs:100, done:45},
    {name:'Python for Data Science',     prog:88, emoji:'🐍', bg:'#2563eb', hrs:80,  done:70},
    {name:'IoT & Robotics',             prog:30, emoji:'🤖', bg:'#059669', hrs:110, done:33},
  ];
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header">
      <div><h2>My Courses</h2><p>Continue where you left off</p></div>
      <button class="btn-sm btn-primary" onclick="showPage('courses')"><i class="fas fa-plus"></i> Browse More</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
      ${courses.map(c => `
        <div class="course-card" onclick="showToast('Opening course player…','info')">
          <div class="cc-thumb" style="background:linear-gradient(135deg,${c.bg}22,${c.bg}55);height:120px;">${c.emoji}</div>
          <div class="cc-body">
            <div class="cc-title">${c.name}</div>
            <div class="prog-bar" style="margin:12px 0 5px;"><div class="prog-fill" style="width:${c.prog}%;"></div></div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text2);">
              <span>${c.prog}% complete</span><span>${c.done}/${c.hrs} hrs</span>
            </div>
            <button class="btn-enroll" style="width:100%;margin-top:12px;">Resume Learning</button>
          </div>
        </div>`).join('')}
    </div>`;
}

function renderProgress() {
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header"><div><h2>Analytics</h2><p>Your learning performance</p></div></div>
    <div class="dash-grid-equal">
      <div class="dash-card">
        <div class="dc-title">Weekly Hours Studied</div>
        <div style="display:flex;align-items:flex-end;gap:7px;height:100px;margin-top:12px;">
          ${[3,5,4,7,6,8,5].map((h,i) => `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;">
              <span style="font-size:10px;font-weight:700;color:var(--text2);">${h}h</span>
              <div style="width:100%;height:${h*11}px;background:linear-gradient(to top,var(--accent),var(--purple));border-radius:4px 4px 0 0;"></div>
              <span style="font-size:10px;color:var(--text2);">${['M','T','W','T','F','S','S'][i]}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="dash-card">
        <div class="dc-title">Quiz Performance</div>
        ${[{s:'Embedded C',sc:90},{s:'RTOS Basics',sc:80},{s:'CAN Protocol',sc:95},{s:'Python ML',sc:75}].map(q => `
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;"><span>${q.s}</span><strong>${q.sc}%</strong></div>
            <div class="prog-bar"><div class="prog-fill" style="width:${q.sc}%;"></div></div>
          </div>`).join('')}
      </div>
    </div>
    <div class="dash-card">
      <div class="dc-title">🤖 AI Performance Insights</div>
      <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:18px;display:flex;gap:14px;">
        <div style="font-size:2rem;flex-shrink:0;">🤖</div>
        <div>
          <div style="font-weight:700;margin-bottom:8px;">TechBot Analysis for ${getDisplayName(STATE.user)}</div>
          <p style="font-size:14px;color:var(--text2);line-height:1.7;">
            You're excelling in Embedded C (90th percentile). Your CAN protocol score is exceptional at 95%.
            Consider more time on RTOS advanced topics — currently at 75th percentile.
            <br><br>Recommended next: <strong>FreeRTOS Semaphores & Queues (Module 6)</strong>. Estimated time: 4 hours.
          </p>
        </div>
      </div>
    </div>`;
}

function renderQuizzes() {
  const questions = [
    {q:'What does RTOS stand for?',                           opts:['Real-Time Operating System','Remote Terminal OS','Rapid Task OS','Real-Time Object System'], ans:0},
    {q:'Which protocol uses differential signaling in automotive ECUs?', opts:['UART','SPI','CAN Bus','I2C'],                                ans:2},
    {q:'In FreeRTOS, what is the highest task priority value?',          opts:['0','1','configMAX_PRIORITIES - 1','255'],                   ans:2},
    {q:'What is the max data rate of CAN FD?',               opts:['1 Mbps','4 Mbps','8 Mbps','10 Mbps'],                              ans:2},
    {q:'Which CPU arch is most common in automotive MCUs?',  opts:['x86','ARM Cortex-M','MIPS','RISC-V'],                              ans:1},
    {q:'What does AUTOSAR stand for?',                       opts:['Auto System Architecture','AUTomotive Open System ARchitecture','Automated Software Runtime','Auto Source Archive'], ans:1},
    {q:'ISO 26262 covers which engineering domain?',         opts:['Software Quality','Functional Safety of E/E Systems','Network Security','Embedded Debugging'], ans:1},
  ];

  let current=0, score=0, answered=false, timerSec=60;
  if (STATE.quizTimer) clearInterval(STATE.quizTimer);

  function render() {
    if (current >= questions.length) {
      clearInterval(STATE.quizTimer);
      const pct = Math.round(score / questions.length * 100);
      document.getElementById('dashMain').innerHTML = `
        <div style="max-width:580px;margin:4rem auto;text-align:center;">
          <div style="font-size:4rem;margin-bottom:20px;">${pct>=85?'🏆':pct>=65?'🎖️':'📚'}</div>
          <h2>Quiz Complete!</h2>
          <div style="font-size:3rem;font-weight:800;color:${pct>=85?'var(--green)':pct>=65?'var(--gold)':'var(--accent)'};margin:16px 0;">
            ${score}/${questions.length}
          </div>
          <p style="color:var(--text2);">Score: ${pct}% · ${pct>=85?'Excellent!':pct>=65?'Good effort!':'Keep practising!'}</p>
          <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;flex-wrap:wrap;">
            <button class="btn-quiz btn-quiz-pri" onclick="renderQuizzes()">Try Again</button>
            <button class="btn-quiz btn-quiz-sec" onclick="switchDash(null,'overview')">Dashboard</button>
          </div>
          ${pct===100?'<div style="margin-top:20px;background:rgba(6,214,160,0.1);border:1px solid rgba(6,214,160,0.3);border-radius:12px;padding:16px;"><strong>🎉 Perfect Score! +100 XP bonus!</strong></div>':''}
        </div>`;
      return;
    }

    const q = questions[current];
    timerSec = 60;
    document.getElementById('dashMain').innerHTML = `
      <div class="dash-header">
        <div><h2>AI Quiz — Embedded Systems</h2><p>Question ${current+1} of ${questions.length}</p></div>
        <div class="timer-badge"><i class="fas fa-clock"></i> <span id="timerDisplay">1:00</span></div>
      </div>
      <div class="quiz-container">
        <div class="quiz-header">
          <div class="quiz-progress-row">
            <span>Progress</span>
            <span>${current+1} / ${questions.length} · Score: ${score}</span>
          </div>
          <div class="prog-bar">
            <div class="prog-fill" style="width:${(current/questions.length*100)}%;"></div>
          </div>
        </div>
        <div class="question-card">
          <div class="q-num">Question ${current+1}</div>
          <div class="q-text">${q.q}</div>
          <div class="options-list">
            ${q.opts.map((opt,i) => `
              <div class="option" id="opt-${i}" onclick="selectOpt(${i},${q.ans})">
                <div class="opt-letter">${String.fromCharCode(65+i)}</div>
                <span>${opt}</span>
              </div>`).join('')}
          </div>
        </div>
        <div class="quiz-nav">
          <button class="btn-quiz btn-quiz-sec" onclick="renderQuizzes()"><i class="fas fa-redo"></i> Restart</button>
          <button class="btn-quiz btn-quiz-pri" id="nextBtn" disabled onclick="nextQ()">
            ${current+1 < questions.length ? 'Next <i class="fas fa-arrow-right"></i>' : 'Finish <i class="fas fa-flag-checkered"></i>'}
          </button>
        </div>
      </div>`;

    STATE.quizTimer = setInterval(() => {
      timerSec--;
      const el = document.getElementById('timerDisplay');
      if (el) el.textContent = `${Math.floor(timerSec/60)}:${String(timerSec%60).padStart(2,'0')}`;
      if (timerSec <= 0) { clearInterval(STATE.quizTimer); nextQ(); }
    }, 1000);

    window.selectOpt = (i, ans) => {
      if (answered) return;
      answered = true;
      clearInterval(STATE.quizTimer);
      document.querySelectorAll('.option').forEach(o => o.style.pointerEvents = 'none');
      document.getElementById('opt-'+i).classList.add(i===ans ? 'correct' : 'wrong');
      if (i !== ans) document.getElementById('opt-'+ans).classList.add('correct');
      if (i === ans) score++;
      document.getElementById('nextBtn').disabled = false;
    };
    window.nextQ = () => { current++; answered=false; render(); };
  }
  render();
}

function renderCertificates() {
  const u = STATE.user;
  const certs = [
    {course:'Python for Data Science',         date:'March 2025', id:'TS-2025-PDS-8291'},
    {course:'Embedded Systems Fundamentals',   date:'May 2025',   id:'TS-2025-ESF-4472'},
  ];
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header"><div><h2>My Certificates</h2><p>Verified credentials with QR codes</p></div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(440px,1fr));gap:20px;">
      ${certs.map(cert => `
        <div class="cert-card">
          <div class="cert-org">TS TECH PARK</div>
          <div class="cert-sub">A Group of TS Institutions</div>
          <div class="cert-label">Certificate of Completion</div>
          <div class="cert-name">${getDisplayName(u)}</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.7);margin-bottom:6px;">has successfully completed</div>
          <div class="cert-course">${cert.course}</div>
          <div class="cert-date">Awarded: ${cert.date} · ID: ${cert.id}</div>
          <div class="cert-footer">
            <div class="qr-box"><i class="fas fa-qrcode" style="font-size:26px;color:var(--primary);"></i></div>
            <div><div style="font-size:11px;margin-bottom:4px;">Scan to verify</div><div style="font-size:10px;opacity:0.5;">${cert.id}</div></div>
            <div style="margin-left:auto;display:flex;gap:6px;">
              <button onclick="showToast('Certificate PDF downloaded!','success')"
                style="padding:7px 13px;background:var(--gold);color:#4a2e00;border:none;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;">
                <i class="fas fa-download"></i> PDF
              </button>
              <button onclick="showToast('LinkedIn share link copied!','info')"
                style="padding:7px 13px;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);border-radius:7px;font-size:12px;cursor:pointer;">
                <i class="fab fa-linkedin"></i> Share
              </button>
            </div>
          </div>
        </div>`).join('')}
      <div class="dash-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:200px;border-style:dashed;border-color:var(--border);">
        <i class="fas fa-lock" style="font-size:2rem;color:var(--text2);margin-bottom:12px;opacity:0.35;"></i>
        <div style="font-weight:700;margin-bottom:6px;">Automotive Embedded Systems</div>
        <div style="font-size:13px;color:var(--text2);">Complete 28% more to unlock</div>
        <div class="prog-bar" style="width:200px;margin-top:12px;"><div class="prog-fill" style="width:72%;"></div></div>
      </div>
    </div>`;
}

function renderAssignments() {
  const u = STATE.user;
  const tasks = [
    {title:'Design a CAN Bus message matrix for a vehicle ECU network', course:'Automotive Embedded', due:'Jun 15, 2026', status:'pending', pts:50},
    {title:'Implement FreeRTOS mutex for shared resource access',        course:'Embedded Systems',   due:'Jun 18, 2026', status:'pending', pts:40},
    {title:'Python data analysis on EV telemetry dataset',              course:'Python for Data Science', due:'Jun 12, 2026', status:'submitted', pts:45},
    {title:'Arduino smart home automation project report',              course:'IoT & Robotics',     due:'Jun 8, 2026',  status:'graded',   pts:50, grade:'92/100'},
  ];
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header"><div><h2>Assignments</h2><p>Submit work and get AI feedback</p></div></div>
    ${tasks.map(a => `
      <div class="dash-card" style="margin-bottom:14px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-weight:700;font-size:15px;margin-bottom:5px;">${a.title}</div>
            <div style="font-size:13px;color:var(--text2);">${a.course} · Due: ${a.due} · ${a.pts} pts</div>
          </div>
          <span class="status-pill ${a.status==='graded'?'sp-active':a.status==='submitted'?'sp-pending':'sp-suspended'}">${a.status.toUpperCase()}</span>
        </div>
        <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;align-items:center;">
          ${a.status==='graded' ?
            `<span style="font-weight:700;font-size:15px;color:var(--green);">Grade: ${a.grade}</span>
             <button class="action-btn ab-view" onclick="showToast('Opening AI feedback…','info')"><i class="fas fa-robot"></i> AI Feedback</button>`
          : a.status==='submitted' ?
            `<span style="font-size:13px;color:var(--text2);"><i class="fas fa-clock"></i> Awaiting review</span>
             <button class="action-btn ab-view" onclick="showToast('Opening submission…','info')">View Submission</button>`
          : `<button class="action-btn ab-edit" onclick="showToast('Assignment editor opened','info')"><i class="fas fa-upload"></i> Submit</button>
             <button class="action-btn ab-view" onclick="showToast('AI hint generated! Check your chatbot 🤖','info')"><i class="fas fa-robot"></i> AI Hint</button>`}
        </div>
      </div>`).join('')}`;
}

function renderNotes() {
  const seedNotes = [
    {title:'CAN Bus Key Points', course:'Automotive Embedded', note:'• Differential signaling\n• Max 1 Mbps classical, 8 Mbps CAN FD\n• Multi-master architecture\n• CSMA/CD collision avoidance', color:'#7c3aed', date:'Today'},
    {title:'RTOS Task States',   course:'Embedded Systems',   note:'Running → Ready → Blocked → Suspended\n\nPriority preemption: higher task preempts lower.\n\nvTaskDelay() vs vTaskDelayUntil()', color:'#0891b2', date:'Yesterday'},
    {title:'Python ML Pipeline', course:'Data Science',       note:'1. Load & explore data\n2. Clean & preprocess\n3. Feature engineering\n4. Model selection\n5. Train & validate\n6. Deploy', color:'#2563eb', date:'2 days ago'},
    ...STATE.notes,
  ];
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header">
      <div><h2>My Notes</h2><p>Quick notes from your sessions</p></div>
      <button class="btn-sm btn-primary" onclick="addNotePrompt()"><i class="fas fa-plus"></i> New Note</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
      ${seedNotes.map((n,i) => `
        <div class="dash-card" style="border-top:3px solid ${n.color};">
          <div style="font-weight:700;margin-bottom:4px;">${n.title}</div>
          <div style="font-size:12px;color:var(--text2);margin-bottom:12px;">${n.course} · ${n.date}</div>
          <pre style="font-size:13px;font-family:'Inter',sans-serif;color:var(--text2);white-space:pre-wrap;line-height:1.7;">${n.note}</pre>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <button class="action-btn ab-edit" onclick="showToast('Note editor opened','info')">Edit</button>
            <button class="action-btn ab-delete" onclick="deleteNote(${i})">Delete</button>
          </div>
        </div>`).join('')}
    </div>`;
}
function addNotePrompt() {
  const title = prompt('Note title:');
  const note  = prompt('Note content:');
  if (title && note) {
    STATE.notes.unshift({title, course:'General', note, color:'#e94560', date:'Just now'});
    renderNotes();
    showToast('Note saved!', 'success');
  }
}
function deleteNote(i) {
  STATE.notes.splice(i, 1);
  renderNotes();
  showToast('Note deleted', 'info');
}

function renderWishlistDash() {
  const list = COURSES.filter(c => STATE.wishlist.has(c.id));
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header"><div><h2>Wishlist</h2><p>${list.length} courses saved</p></div></div>
    ${list.length === 0
      ? `<div class="empty-state"><i class="fas fa-heart"></i><p>Your wishlist is empty.</p>
         <button class="btn-enroll" onclick="showPage('courses')">Browse Courses</button></div>`
      : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
           ${list.map(c => `
             <div class="course-card">
               <div class="cc-thumb" style="background:linear-gradient(135deg,${c.bg}22,${c.bg}44);height:100px;">${c.emoji}</div>
               <div class="cc-body">
                 <div class="cc-title">${c.title}</div>
                 <div class="cc-footer"><div class="cc-price">₹${c.price.toLocaleString()}</div>
                 <button class="btn-enroll" onclick="enrollCourse(${c.id})">Enroll</button></div>
               </div>
             </div>`).join('')}
         </div>`}`;
}

function renderGamification() {
  const u = STATE.user;
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header"><div><h2>Badges &amp; XP</h2><p>Your achievements and rewards</p></div></div>
    <div class="dash-grid-equal">
      <div class="dash-card" style="text-align:center;">
        <div style="font-size:2.8rem;font-weight:800;color:var(--gold);font-family:'Sora',sans-serif;">${u.xp||3420}</div>
        <div style="font-size:14px;color:var(--text2);margin-top:4px;">Total XP Points</div>
        <div class="prog-bar" style="margin:14px 0 5px;"><div class="prog-fill" style="width:68%;"></div></div>
        <div style="font-size:13px;color:var(--text2);">1,580 XP to next level · <strong>Expert</strong></div>
      </div>
      <div class="streak-card">
        <div style="font-size:11px;opacity:0.7;margin-bottom:4px;">🔥 LEARNING STREAK</div>
        <div class="streak-num">${u.streak||7}</div>
        <div style="font-size:13px;opacity:0.7;">days in a row</div>
        <div class="week-dots">
          ${['M','T','W','T','F','S','S'].map((d,i) => `<div class="wd ${i<5?'wd-done':i===5?'wd-today':'wd-future'}">${d}</div>`).join('')}
        </div>
      </div>
    </div>
    <div class="dash-card">
      <div class="dc-title">Badges</div>
      <div class="badge-grid">
        ${[
          {e:'🚀',n:'First Launch',earned:true},  {e:'🔥',n:'Hot Streak',earned:true},
          {e:'🥷',n:'Code Ninja',earned:true},    {e:'🏆',n:'Quiz Master',earned:true},
          {e:'⚡',n:'Speed Learner',earned:false}, {e:'🎓',n:'Graduate',earned:false},
          {e:'👑',n:'Top Ranker',earned:false},    {e:'💎',n:'Diamond',earned:false},
          {e:'🌟',n:'Star Student',earned:false},  {e:'🔬',n:'Researcher',earned:false},
        ].map(b => `
          <div class="badge-item ${b.earned?'earned':'locked'}">
            <div class="badge-emoji">${b.e}</div>
            <div class="badge-name">${b.n}</div>
            ${b.earned ? '' : '<div style="font-size:10px;color:var(--text2);margin-top:4px;"><i class="fas fa-lock"></i></div>'}
          </div>`).join('')}
      </div>
    </div>`;
}

function renderLeaderboard() {
  const u = STATE.user;
  const userName = getDisplayName(u);
  const users = [
    {name:'Karthik V.',    pts:8920, badge:'👑', av:'KV', color:'#7c3aed'},
    {name:'Priya M.',      pts:7340, badge:'🥈', av:'PM', color:'#0891b2'},
    {name:'Arjun V.',      pts:6180, badge:'🥉', av:'AV', color:'#059669'},
    {name:'Deepa K.',      pts:5420, badge:'🏅', av:'DK', color:'#dc2626'},
    {name:`${userName} (You)`, pts:u.xp||3420, badge:'🎖️', av:getInitials(u), color:'#e94560', you:true},
    {name:'Mohan R.',      pts:2980, badge:'',   av:'MR', color:'#2563eb'},
    {name:'Sneha L.',      pts:2640, badge:'',   av:'SL', color:'#7c3aed'},
  ].sort((a,b) => b.pts - a.pts);

  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header"><div><h2>Leaderboard</h2><p>Top learners this month</p></div></div>
    <div class="dash-card" style="max-width:580px;">
      <div class="dc-title">Monthly Rankings <span style="font-size:12px;color:var(--text2);">June 2026</span></div>
      ${users.map((u,i) => `
        <div class="lb-item" style="${u.you?'background:rgba(233,69,96,0.06);border-radius:10px;padding:4px 8px;':''}">
          <div class="lb-rank ${i===0?'r-gold':i===1?'r-silver':i===2?'r-bronze':'r-other'}">
            ${i<3?['🥇','🥈','🥉'][i]:`#${i+1}`}
          </div>
          <div class="lb-av" style="background:${u.color}22;color:${u.color};">${u.av}</div>
          <div class="lb-name">${u.name}${u.you?'<strong style="color:var(--accent);"> ← You</strong>':''}</div>
          <div class="lb-pts">${u.pts.toLocaleString()} XP</div>
          <div style="font-size:18px;">${u.badge}</div>
        </div>`).join('')}
    </div>`;
}

function renderSchedule() {
  const events = [
    {day:'Today',       time:'3:00 PM', title:'CAN FD Advanced Session',     type:'live',       color:'#e94560'},
    {day:'Today',       time:'11:59 PM',title:'Python DS Quiz deadline',     type:'quiz',       color:'#7c3aed'},
    {day:'Tomorrow',    time:'10:00 AM',title:'Automotive Embedded Module 6',type:'class',      color:'#0891b2'},
    {day:'Thu Jun 13',  time:'11:00 AM',title:'RTOS Deep Dive: Tasks',       type:'live',       color:'#e94560'},
    {day:'Fri Jun 14',  time:'11:59 PM',title:'CAN Bus Assignment due',      type:'assignment', color:'#f5a623'},
  ];
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header"><div><h2>My Schedule</h2><p>Upcoming classes, quizzes and deadlines</p></div></div>
    <div class="dash-card">
      <div class="dc-title">This Week</div>
      ${events.map(e => `
        <div style="display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--border);">
          <div style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></div>
          <div style="min-width:100px;font-size:13px;color:var(--text2);">${e.day}</div>
          <div style="min-width:70px;font-size:13px;font-weight:600;">${e.time}</div>
          <div style="flex:1;font-size:14px;font-weight:600;">${e.title}</div>
          <span style="background:${e.color}22;color:${e.color};padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;">${e.type.toUpperCase()}</span>
          <button class="action-btn ab-view" onclick="showToast('Opening ${e.title}…','info')">View</button>
        </div>`).join('')}
    </div>`;
}

function renderPayments() {
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header"><div><h2>Payment History</h2><p>All transactions</p></div></div>
    <div class="dash-card">
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead><tr><th>Course</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Invoice</th></tr></thead>
          <tbody>
            ${[
              {c:'Automotive Embedded Systems', a:'₹60,000', m:'UPI',          d:'Mar 15, 2025', s:'paid'},
              {c:'Python for Data Science',     a:'₹40,000', m:'Card',         d:'Jan 8, 2025',  s:'paid'},
              {c:'IoT & Robotics',              a:'₹55,000', m:'Net Banking',  d:'May 1, 2025',  s:'paid'},
              {c:'Edge AI & Deep Learning',     a:'₹70,000', m:'EMI ×3',       d:'Jun 1, 2025',  s:'active'},
            ].map(r => `
              <tr>
                <td style="font-weight:600;">${r.c}</td>
                <td style="font-weight:700;">${r.a}</td>
                <td>${r.m}</td>
                <td>${r.d}</td>
                <td><span class="status-pill ${r.s==='paid'?'sp-active':'sp-pending'}">${r.s.toUpperCase()}</span></td>
                <td><button class="action-btn ab-view" onclick="showToast('Invoice downloading…','success')"><i class="fas fa-download"></i> PDF</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderSettings() {
  const u = STATE.user || {};
  document.getElementById('dashMain').innerHTML = `
    <div class="dash-header"><div><h2>Settings</h2><p>Manage your account preferences</p></div></div>
    <div style="max-width:580px;">
      <div class="dash-card" style="margin-bottom:16px;">
        <div class="dc-title">Profile Information</div>
        <div class="form-group"><label class="form-label">First Name</label><input class="form-input" id="setFname" value="${u.firstName||''}"></div>
        <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" id="setLname" value="${u.lastName||''}"></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="setEmail" value="${u.email||''}"></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="setPhone" value="${u.phone||''}"></div>
        <div class="form-group"><label class="form-label">City / Location</label><input class="form-input" id="setCity" value="${u.city||''}"></div>
        <button class="btn-enroll" onclick="saveSettings()">Save Changes</button>
      </div>
      <div class="dash-card" style="margin-bottom:16px;">
        <div class="dc-title">Notifications</div>
        ${[['Email notifications','email',true],['Push notifications','push',true],['Course updates','course',true],['Assignment reminders','assign',false],['Community replies','forum',true]].map(n => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
            <span style="font-size:14px;">${n[0]}</span>
            <input type="checkbox" ${n[2]?'checked':''} onchange="showToast('Preference saved','success')" style="width:16px;height:16px;accent-color:var(--accent);">
          </div>`).join('')}
      </div>
      <div class="dash-card">
        <div class="dc-title">Appearance</div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;">
          <span style="font-size:14px;">Dark Mode</span>
          <button class="btn-enroll" onclick="toggleTheme()">Toggle</button>
        </div>
        <div class="form-group" style="margin-top:10px;">
          <label class="form-label">Language</label>
          <select class="form-input" onchange="showToast('Language saved','success')"><option>English</option><option>Tamil</option><option>Hindi</option></select>
        </div>
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);">
          <button style="padding:9px 18px;background:rgba(233,69,96,0.1);color:var(--accent);border:1.5px solid rgba(233,69,96,0.3);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;" onclick="doLogout()">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </div>`;
}
function saveSettings() {
  if (!STATE.user) return;
  STATE.user.firstName = document.getElementById('setFname').value.trim();
  STATE.user.lastName  = document.getElementById('setLname').value.trim();
  STATE.user.email     = document.getElementById('setEmail').value.trim();
  STATE.user.phone     = document.getElementById('setPhone').value.trim();
  STATE.user.city      = document.getElementById('setCity').value.trim();
  localStorage.setItem('ts_user', JSON.stringify(STATE.user));
  afterLogin();
  showToast('Profile saved successfully!', 'success');
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE PAGE
════════════════════════════════════════════════════════════════ */
function renderProfilePage() {
  const u = STATE.user;
  if (!u) return;

  const initials = getInitials(u);
  const fullName = getDisplayName(u);

  document.getElementById('profileAvatarBig').textContent = initials;
  document.getElementById('profileName').textContent      = fullName;
  document.getElementById('profileTagline').textContent   =
    [u.role, u.city].filter(Boolean).join(' · ') || 'TS Tech Park Learner';
  document.getElementById('profileEmailDisplay').innerHTML  = `<i class="fas fa-envelope"></i> ${u.email || '—'}`;
  document.getElementById('profilePhoneDisplay').innerHTML  = `<i class="fas fa-phone"></i> ${u.phone || '—'}`;
  document.getElementById('profileJoinedDisplay').innerHTML = `<i class="fas fa-calendar"></i> Joined ${u.joinedDate || '—'}`;

  // Stats
  document.getElementById('profileStatsList').innerHTML = [
    {label:'Courses Enrolled', val: u.enrolledCount||4},
    {label:'Hours Learned',    val: (u.hoursLearned||142)+'h'},
    {label:'Certificates',     val: u.certificates||2},
    {label:'XP Points',        val: '<span class="text-gold fw-800">'+(u.xp||3420)+'</span>'},
    {label:'Day Streak 🔥',   val: u.streak||7},
  ].map(s => `
    <div class="psl-item">
      <span class="psl-label">${s.label}</span>
      <span class="psl-val">${s.val}</span>
    </div>`).join('');

  // Certs
  document.getElementById('profileCerts').innerHTML = [
    {name:'Python for Data Science',       date:'Mar 2025', color:'#2563eb'},
    {name:'Embedded Systems Fundamentals', date:'May 2025', color:'#0891b2'},
  ].map(cert => `
    <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);">
      <div style="width:36px;height:36px;border-radius:10px;background:${cert.color}22;color:${cert.color};display:flex;align-items:center;justify-content:center;font-size:17px;">
        <i class="fas fa-certificate"></i>
      </div>
      <div>
        <div style="font-weight:700;font-size:14px;">${cert.name}</div>
        <div style="font-size:12px;color:var(--text2);">${cert.date}</div>
      </div>
      <button class="action-btn ab-view" style="margin-left:auto;" onclick="showToast('Opening certificate…','info')">View</button>
    </div>`).join('');

  // Skills
  document.getElementById('profileSkills').innerHTML = [
    {s:'Embedded C',     pct:90}, {s:'CAN/LIN Protocol',pct:85},
    {s:'Python',         pct:78}, {s:'RTOS',            pct:70},
    {s:'Machine Learning',pct:60},{s:'Cloud (AWS)',      pct:45},
  ].map(sk => `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;"><span>${sk.s}</span><strong>${sk.pct}%</strong></div>
      <div class="prog-bar"><div class="prog-fill" style="width:${sk.pct}%;"></div></div>
    </div>`).join('');

  // Heatmap
  const cells = Array.from({length:84}, (_,i) => {
    const r = Math.random();
    return r < 0.3 ? 0 : r < 0.55 ? 1 : r < 0.75 ? 2 : r < 0.9 ? 3 : 4;
  });
  document.getElementById('profileHeatmap').innerHTML =
    `<div style="font-size:12px;color:var(--text2);margin-bottom:8px;">Last 84 days of activity</div>
     <div class="heatmap-grid">${cells.map(c => `<div class="heat-cell h${c}" title="${c} hrs"></div>`).join('')}</div>
     <div style="display:flex;align-items:center;gap:6px;margin-top:8px;font-size:11px;color:var(--text2);">
       Less <div class="heat-cell h0" style="width:12px;height:12px;flex-shrink:0;"></div>
       <div class="heat-cell h1" style="width:12px;height:12px;flex-shrink:0;"></div>
       <div class="heat-cell h2" style="width:12px;height:12px;flex-shrink:0;"></div>
       <div class="heat-cell h3" style="width:12px;height:12px;flex-shrink:0;"></div>
       <div class="heat-cell h4" style="width:12px;height:12px;flex-shrink:0;"></div> More
     </div>`;
}

function openEditProfile() {
  const u = STATE.user;
  if (!u) { openAuth('login'); return; }
  document.getElementById('editProfileBody').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label class="form-label">First Name</label><input class="form-input" id="epFname" value="${u.firstName||''}"></div>
      <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" id="epLname" value="${u.lastName||''}"></div>
    </div>
    <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="epEmail" value="${u.email||''}"></div>
    <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="epPhone" value="${u.phone||''}"></div>
    <div class="form-group"><label class="form-label">City</label><input class="form-input" id="epCity" value="${u.city||''}"></div>
    <div class="form-group"><label class="form-label">Bio / Tagline</label><input class="form-input" id="epBio" value="${u.bio||''}"></div>
    <button class="btn-full btn-accent" onclick="saveEditProfile()">Save Profile</button>`;
  document.getElementById('editProfileModal').classList.add('active');
}
function saveEditProfile() {
  const u = STATE.user;
  u.firstName = document.getElementById('epFname').value.trim();
  u.lastName  = document.getElementById('epLname').value.trim();
  u.email     = document.getElementById('epEmail').value.trim();
  u.phone     = document.getElementById('epPhone').value.trim();
  u.city      = document.getElementById('epCity').value.trim();
  u.bio       = document.getElementById('epBio').value.trim();
  localStorage.setItem('ts_user', JSON.stringify(u));
  closeModal('editProfileModal');
  afterLogin();
  renderProfilePage();
  showToast('Profile updated successfully!', 'success');
}

/* ═══════════════════════════════════════════════════════════════
   FORUM
════════════════════════════════════════════════════════════════ */
function renderForum(filter='', tab='all') {
  const container = document.getElementById('forumPosts');
  if (!container) return;
  let posts = STATE.forumPosts;
  if (filter) posts = posts.filter(p =>
    p.title.toLowerCase().includes(filter.toLowerCase()) ||
    p.text.toLowerCase().includes(filter.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))
  );
  if (tab !== 'all') posts = posts.filter(p => p.type === tab);

  container.innerHTML = posts.length === 0
    ? `<div class="empty-state"><i class="fas fa-comments"></i><p>No posts yet. Be the first!</p></div>`
    : posts.map(p => `
        <div class="forum-post">
          <div class="fp-header">
            <div class="fp-av" style="background:${p.color}22;color:${p.color};">${p.av}</div>
            <div class="fp-meta">
              <div class="fp-name">${p.user}</div>
              <div class="fp-time">${p.time}</div>
            </div>
            <span class="fp-cat" style="background:${p.catColor}22;color:${p.catColor};">${p.cat}</span>
          </div>
          <div class="fp-title" onclick="showToast('Opening post: ${p.title.substring(0,30)}…','info')">${p.title}</div>
          <div class="fp-text">${p.text}</div>
          <div class="fp-tags">${p.tags.map(t => `<span class="tag-pill">#${t}</span>`).join('')}</div>
          <div class="fp-footer">
            <button class="fp-action" onclick="likePost(this)"><i class="fas fa-heart"></i> ${p.likes}</button>
            <button class="fp-action" onclick="showToast('Opening replies…','info')"><i class="fas fa-comment"></i> ${p.replies} replies</button>
            <button class="fp-action" onclick="showToast('Post saved!','success')"><i class="fas fa-bookmark"></i> Save</button>
            <button class="fp-action" style="margin-left:auto;" onclick="showToast('Share link copied!','info')"><i class="fas fa-share"></i></button>
          </div>
        </div>`).join('');
}
function filterForum(val) {
  renderForum(val || document.querySelector('#page-forum .search-box input')?.value, STATE.forumTab);
}
function setForumTab(btn, tab) {
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  STATE.forumTab = tab;
  renderForum('', tab);
}
function likePost(btn) {
  const icon  = btn.querySelector('i');
  const liked = icon.style.color === 'var(--accent)';
  icon.style.color = liked ? '' : 'var(--accent)';
  const n = parseInt(btn.textContent.match(/\d+/)[0]);
  btn.innerHTML = `<i class="fas fa-heart" style="color:${liked?'':'var(--accent)'}"></i> ${liked?n-1:n+1}`;
}
function openNewPost() {
  if (!STATE.loggedIn) { openAuth('login'); return; }
  document.getElementById('postModal').classList.add('active');
}
function submitForumPost() {
  const title   = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const cat     = document.getElementById('postCat').value;
  const tags    = document.getElementById('postTags').value.split(',').map(t => t.trim()).filter(Boolean);
  if (!title || !content) { showToast('Please fill title and content', 'error'); return; }

  const u = STATE.user;
  const newPost = {
    id: Date.now(),
    user: getDisplayName(u),
    av: getInitials(u),
    color: '#e94560',
    time: 'Just now',
    cat, catColor: '#0891b2',
    title, text: content,
    likes: 0, replies: 0,
    tags: tags.length ? tags : [cat],
    type: 'questions',
  };
  STATE.forumPosts.unshift(newPost);
  closeModal('postModal');
  renderForum();
  document.getElementById('postTitle').value   = '';
  document.getElementById('postContent').value = '';
  document.getElementById('postTags').value    = '';
  showToast('Post published successfully! 🎉', 'success');
}

/* ═══════════════════════════════════════════════════════════════
   LIVE CLASSES
════════════════════════════════════════════════════════════════ */
function renderLiveClasses(tab) {
  const container = document.getElementById('liveContent');
  if (!container) return;
  const list = LIVE_CLASSES[tab] || [];

  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-video"></i><p>No sessions in this category right now.</p></div>`;
    return;
  }

  container.innerHTML = list.map(lc => `
    <div class="live-class-card">
      <div class="lc-icon" style="background:${tab==='live'?'rgba(233,69,96,0.12)':'rgba(8,145,178,0.12)'};">
        ${lc.emoji}
      </div>
      <div style="flex:1;">
        ${tab==='live' ? '<div class="lc-live-badge"><div class="live-dot"></div> LIVE NOW</div>' : ''}
        <div style="font-weight:700;font-size:15px;">${lc.title}</div>
        <div style="font-size:13px;color:var(--text2);margin-top:4px;">
          <i class="fas fa-user-tie" style="margin-right:5px;"></i>${lc.instructor}
          <i class="fas fa-clock" style="margin:0 5px 0 10px;"></i>${lc.time}
          ${tab!=='recordings' ? `<i class="fas fa-users" style="margin:0 5px 0 10px;"></i>${lc.attendees} attending` : ''}
          ${lc.duration ? `<i class="fas fa-film" style="margin:0 5px 0 10px;"></i>${lc.duration}` : ''}
        </div>
      </div>
      <button class="btn-enroll" onclick="showToast('${tab==='live'?'Joining '+lc.platform+'…':tab==='recordings'?'Loading recording…':'Reminder set! ✅'}','${tab==='live'?'success':'info'}')">
        ${tab==='live' ? '<i class="fas fa-video"></i> Join Now' : tab==='recordings' ? '<i class="fas fa-play"></i> Watch' : '<i class="fas fa-bell"></i> Remind Me'}
      </button>
    </div>`).join('');
}
function setLiveTab(btn, tab) {
  document.querySelectorAll('.ltab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  STATE.liveTab = tab;
  renderLiveClasses(tab);
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN
════════════════════════════════════════════════════════════════ */
const ADMIN_USERS = [
  {name:'Dr. Vijay R.',   email:'vijay@tstechpark.com',  phone:'+91 98001 11111', role:'Instructor', enrolled:0, status:'active',    joined:'Aug 2024'},
  {name:'Mr. Suresh K.', email:'suresh@tstechpark.com', phone:'+91 98002 22222', role:'Instructor', enrolled:0, status:'active',    joined:'Sep 2024'},
  {name:'Ms. Priya N.',  email:'priya@tstechpark.com',  phone:'+91 98003 33333', role:'Instructor', enrolled:0, status:'active',    joined:'Oct 2024'},
  {name:'Arjun V.',      email:'arjun@example.com',     phone:'+91 87654 32109', role:'Student',    enrolled:3, status:'active',    joined:'Mar 2025'},
  {name:'Deepa K.',      email:'deepa@example.com',     phone:'+91 76543 21098', role:'Student',    enrolled:1, status:'pending',   joined:'Jun 2025'},
  {name:'Karthik R.',    email:'karthik@example.com',   phone:'+91 65432 10987', role:'Student',    enrolled:5, status:'active',    joined:'Jan 2025'},
  {name:'Sneha L.',      email:'sneha@example.com',     phone:'+91 54321 09876', role:'Student',    enrolled:2, status:'suspended', joined:'Apr 2025'},
];

function getAdminUsers() {
  const accounts = JSON.parse(localStorage.getItem('ts_accounts') || '[]');
  const extra = accounts.map(a => ({
    name: [a.firstName, a.lastName].filter(Boolean).join(' ') || a.email,
    email: a.email, phone: a.phone || '—',
    role: a.role || 'Student', enrolled: 0,
    status: 'active', joined: a.joinedDate || 'Recently',
  }));
  return [...ADMIN_USERS, ...extra];
}

function renderAdminTable() {
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;
  let users = getAdminUsers();
  if (STATE.adminFilter) users = users.filter(u =>
    u.name.toLowerCase().includes(STATE.adminFilter.toLowerCase()) ||
    u.email.toLowerCase().includes(STATE.adminFilter.toLowerCase())
  );
  if (STATE.adminRole) users = users.filter(u => u.role === STATE.adminRole);

  const perPage = 6;
  const total   = Math.ceil(users.length / perPage);
  const page    = Math.min(STATE.adminPage, total);
  const paginated = users.slice((page-1)*perPage, page*perPage);

  tbody.innerHTML = paginated.map(u => {
    const av = (u.name||'?').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
    return `<tr>
      <td style="display:flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;flex-shrink:0;">${av}</div>
        <strong>${u.name}</strong>
      </td>
      <td style="color:var(--text2);">${u.email}</td>
      <td>${u.phone}</td>
      <td><span style="padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700;background:${u.role==='Instructor'?'rgba(124,58,237,0.12)':'rgba(8,145,178,0.12)'};color:${u.role==='Instructor'?'#7c3aed':'#0891b2'};">${u.role}</span></td>
      <td>${u.enrolled}</td>
      <td><span class="status-pill sp-${u.status}">${u.status.toUpperCase()}</span></td>
      <td>${u.joined}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn ab-view"   onclick="showToast('Opening ${u.name} profile…','info')">View</button>
          <button class="action-btn ab-edit"   onclick="showToast('Opening editor…','info')">Edit</button>
          <button class="action-btn ab-delete" onclick="showToast('User suspended: ${u.name}','error')">Suspend</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Pagination
  const pag = document.getElementById('tablePagination');
  if (pag) pag.innerHTML = Array.from({length:total},(_,i) => `
    <button class="page-btn ${i+1===page?'active':''}" onclick="STATE.adminPage=${i+1};renderAdminTable()">${i+1}</button>`).join('');
}
function filterAdminUsers(val) {
  if (val !== undefined) STATE.adminFilter = val;
  const roleEl = document.getElementById('adminRoleFilter');
  if (roleEl) STATE.adminRole = roleEl.value;
  STATE.adminPage = 1;
  renderAdminTable();
}
function openAddUser() { showToast('Add user form opening…', 'info'); }

function renderAdminChart() {
  const c = document.getElementById('revChart');
  if (!c) return;
  const vals = [45,72,58,91,63,88,76];
  const max  = Math.max(...vals);
  c.innerHTML = vals.map((v,i) =>
    `<div class="rev-bar" style="height:${Math.round(v/max*100)}%;" title="₹${v*1000}"></div>`
  ).join('');
}
function renderAdminTopCourses() {
  const c = document.getElementById('adminTopCourses');
  if (!c) return;
  c.innerHTML = [
    ['Automotive Embedded','₹1.8L',32],['Edge AI','₹1.2L',18],
    ['Python DS','₹0.9L',24],['IoT & Robotics','₹0.8L',15]
  ].map(([n,r,s]) => `
    <div style="padding:10px 0;border-bottom:1px solid var(--border);">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;">
        <span style="font-weight:600;">${n}</span>
        <span style="font-weight:700;color:var(--green);">${r}</span>
      </div>
      <div class="prog-bar"><div class="prog-fill" style="width:${s*3}%;"></div></div>
      <span style="font-size:11px;color:var(--text2);">${s} enrollments</span>
    </div>`).join('');
}
function renderAdminActivityLog() {
  const c = document.getElementById('adminActivityLog');
  if (!c) return;
  const logs = [
    {icon:'fa-user-plus', cls:'ad-green',  msg:'New signup: Deepa K.',        time:'5 min ago'},
    {icon:'fa-book',      cls:'ad-blue',   msg:'Course enrolled: Edge AI',     time:'12 min ago'},
    {icon:'fa-rupee-sign',cls:'ad-gold',   msg:'Payment: ₹60,000 received',    time:'1 hr ago'},
    {icon:'fa-certificate',cls:'ad-purple',msg:'Certificate issued: Arjun V.', time:'2 hr ago'},
    {icon:'fa-flag',      cls:'ad-red',    msg:'Report flagged: Forum post #8', time:'3 hr ago'},
  ];
  c.innerHTML = logs.map(l => `
    <div class="activity-item">
      <div class="act-dot ${l.cls}"><i class="fas ${l.icon}" style="font-size:12px;"></i></div>
      <div><div class="act-title">${l.msg}</div><div class="act-time">${l.time}</div></div>
    </div>`).join('');
}

/* ═══════════════════════════════════════════════════════════════
   AI CHATBOT
════════════════════════════════════════════════════════════════ */
function renderChatWelcome() {
  addBotMsg(`👋 Hi! I'm <strong>TechBot</strong>, your AI tutor at TS Tech Park!<br><br>
    I can help with:<br>• Course recommendations<br>• Technical concepts (CAN, RTOS, AI…)<br>
    • Study planning<br>• Career guidance<br><br>What would you like to learn today?`);
}
function toggleChat() {
  STATE.chatOpen = !STATE.chatOpen;
  document.getElementById('chatPanel').classList.toggle('open', STATE.chatOpen);
  document.getElementById('chatIcon').className = STATE.chatOpen ? 'fas fa-times' : 'fas fa-robot';
  if (STATE.chatOpen) {
    document.getElementById('chatUnread').style.display = 'none';
    document.getElementById('chatInput').focus();
  }
}
function clearChat() {
  document.getElementById('chatMessages').innerHTML = '';
  renderChatWelcome();
  showToast('Chat cleared', 'info');
}
function sendChat() {
  const input = document.getElementById('chatInput');
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = '';
  input.style.height = '';
  document.getElementById('chatSuggestions').style.display = 'none';

  addUserMsg(msg);
  STATE.chatHistory.push({role:'user', content:msg});

  // Show typing
  const typingId = 'typing_' + Date.now();
  const msgs = document.getElementById('chatMessages');
  const tyDiv = document.createElement('div');
  tyDiv.id = typingId;
  tyDiv.className = 'chat-msg';
  tyDiv.innerHTML = `<div class="msg-av bot-av"><i class="fas fa-robot" style="font-size:10px;"></i></div>
    <div class="msg-bubble bot-bubble"><div class="typing-indicator">
      <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
    </div></div>`;
  msgs.appendChild(tyDiv);
  scrollChat();

  setTimeout(() => {
    tyDiv.remove();
    const reply = generateAIReply(msg);
    addBotMsg(reply);
  }, 900 + Math.random() * 600);
}
function sendSuggestion(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}
function generateAIReply(msg) {
  const m = msg.toLowerCase();
  for (const [key, val] of Object.entries(AI_KB)) {
    if (m.includes(key)) return val;
  }
  if (m.includes('price') || m.includes('cost') || m.includes('fee'))  return AI_KB['fee'];
  if (m.includes('certificate') || m.includes('cert'))                  return AI_KB['certificate'];
  if (m.includes('job') || m.includes('placement') || m.includes('salary')) return AI_KB['career'];
  if (m.includes('plan') || m.includes('how long'))                    return AI_KB['study plan'];
  if (m.includes('embedded') || m.includes('microcontroller'))         return AI_KB['recommend'];
  return `That's a great question! I'd be happy to help.<br><br>
    For the best answer, could you be more specific? For example:<br>
    • "Explain RTOS task scheduling"<br>
    • "Best course for automotive jobs"<br>
    • "What is ISO 26262?"<br>
    • "How much does Edge AI course cost?"<br><br>
    I'm here 24/7! 🤖`;
}
function addBotMsg(html) {
  const msgs = document.getElementById('chatMessages');
  const d = document.createElement('div');
  d.className = 'chat-msg';
  d.innerHTML = `<div class="msg-av bot-av"><i class="fas fa-robot" style="font-size:10px;"></i></div>
    <div class="msg-bubble bot-bubble">${html}</div>`;
  msgs.appendChild(d);
  scrollChat();
}
function addUserMsg(text) {
  const msgs = document.getElementById('chatMessages');
  const d = document.createElement('div');
  d.className = 'chat-msg user';
  d.innerHTML = `<div class="msg-bubble user-bubble">${escHtml(text)}</div>
    <div class="msg-av user-av">U</div>`;
  msgs.appendChild(d);
  scrollChat();
}
function scrollChat() {
  const msgs = document.getElementById('chatMessages');
  msgs.scrollTop = msgs.scrollHeight;
}
function autoResizeChat(el) {
  el.style.height = '';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ═══════════════════════════════════════════════════════════════
   TOASTS
════════════════════════════════════════════════════════════════ */
const TOAST_ICONS = { success:'fa-check-circle', error:'fa-exclamation-circle', info:'fa-info-circle', warning:'fa-exclamation-triangle' };
function showToast(msg, type='info') {
  const container = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${TOAST_ICONS[type]||TOAST_ICONS.info}"></i>${msg}`;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 320); }, 3600);
}
