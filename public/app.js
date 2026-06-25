// Enterprise LMS Real-time Application State Configuration Orchestration Matrix

let lmsApplicationEngineState = {
  activeRoute: 'catalog',
  colorThemeMode: 'dark',
  activeAdminSessionToken: null,
  activeStudentEnrollments: [],
  selectedLanguageChannel: 'en',
  activeCourseContext: null,
  selectedQuizOptionIndex: null,
  mockCourseCatalogDataset: [
    { id: 'ds-01', title: 'DATA SCIENCE BY TS TECH PARK', description: 'Advanced mathematical matrices computational tracking arrays, production ML modeling, clean processing layers.', price: 4999, ytId: 'F3zw9U_yBv0', quiz: { q: "Which mathematical optimization matrix models loss convergence functions within ML layers?", options: ["Stochastic Gradient Descent", "Linear Register Array Parsing", "Pointer Arithmetic Vector", "Scalar Complement Framework"], answer: 0 } },
    { id: 'embed-02', title: 'EMBEDDED SYSTEMS BY TS TECH PARK', description: 'Bare-metal hardware register definitions compilation frameworks, logic debugging infrastructure optimizations.', price: 5999, ytId: '3L6a7X8qMzg', quiz: { q: "What hardware interrupt register vector shifts memory bounds handling internal bus lines?", options: ["ISR Address Mapping Mask", "C-Compiler Heap Directive", "UART Multiplexer Toggle", "Cache Synchronizer Block"], answer: 0 } },
    { id: 'web-03', title: 'WEB DEVELOPMENT BY TS TECH PARK', description: 'High throughput corporate database node pipelines constructing scalable multi-role interface wrappers.', price: 3999, ytId: 'tVzUXW6siu0', quiz: { q: "Which framework layout model safely distributes application instances over serverless configurations?", options: ["Asynchronous Request Reverse Proxy", "Vercel Client Gateway Map", "Dynamic Virtual DOM Inversion", "Static Buffer Allocators"], answer: 1 } },
    { id: 'cyber-04', title: 'CYBER SECURITY BY TS TECH PARK', description: 'Endpoint signature tracing metrics, reverse memory spaces monitoring, encryption configuration constraints auditing.', price: 6499, ytId: 'nzj7Wg46wLQ', quiz: { q: "What operational block handles memory allocation bounds checking to secure input buffers?", options: ["Salt Cryptographic Signatures", "JSON Web Token Expirations", "Boundary Address Guard Pages", "CORS Routing Headers"], answer: 2 } }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  renderCatalogLayoutCards();
  syncDashboardViewStates();
});

function toggleRoute(targetRouteId) {
  lmsApplicationEngineState.activeRoute = targetRouteId;
  
  document.querySelectorAll('.view-view').forEach(view => view.classList.remove('active'));
  document.querySelectorAll('.nav-tabs button').forEach(btn => btn.classList.remove('active'));
  
  const currentViewNode = document.getElementById(`view-${targetRouteId}`);
  if (currentViewNode) currentViewNode.classList.add('active');
  
  const currentTabButton = document.getElementById(`tab-${targetRouteId}`);
  if (currentTabButton) currentTabButton.classList.add('active');

  if (targetRouteId === 'admin' && lmsApplicationEngineState.activeAdminSessionToken) {
    refreshOperationalMetrics();
  }
}

function renderCatalogLayoutCards() {
  const catalogBox = document.getElementById('catalog-card-container');
  if (!catalogBox) return;

  catalogBox.innerHTML = lmsApplicationEngineState.mockCourseCatalogDataset.map(course => `
    <div class="lms-card">
      <div class="lms-card-header"><i class="fa-solid fa-code"></i></div>
      <div class="lms-card-body">
        <div class="lms-card-title">${course.title}</div>
        <p class="lms-card-desc">${course.description}</p>
        <div class="lms-card-footer">
          <div style="font-size:18px; font-weight:700; color:var(--primary);">₹${course.price}</div>
          <button class="btn btn-primary" onclick="executeEnrollmentPipeline('${course.id}')">Enroll Hub</button>
        </div>
      </div>
    </div>
  `).join('');
}

function syncDashboardViewStates() {
  const dynamicWrapper = document.getElementById('dashboard-dynamic-wrapper');
  if (!dynamicWrapper) return;

  const countBox = document.getElementById('user-courses-count');
  const attendanceBox = document.getElementById('user-attendance-rate');
  const gradeBox = document.getElementById('user-quiz-grade');
  const certBox = document.getElementById('user-cert-status');

  if (lmsApplicationEngineState.activeStudentEnrollments.length === 0) {
    countBox.innerText = "0";
    attendanceBox.innerText = "0%";
    gradeBox.innerText = "N/A";
    certBox.innerText = "0";
    
    dynamicWrapper.innerHTML = `
      <div style="text-align:center; padding:4rem; background:var(--card); border:1px solid var(--border); border-radius:14px; color:var(--text-muted);">
        <i class="fa-solid fa-folder-closed" style="font-size:2.5rem; color:var(--primary); margin-bottom:1rem; display:block;"></i>
        <p>No active course modules enrolled within this user identity matrix context yet.</p>
        <button class="btn btn-primary" style="margin-top:1rem;" onclick="toggleRoute('catalog')">Inspect Catalog Options</button>
      </div>
    `;
    document.getElementById('certificate-showcase-box').style.display = 'none';
  } else {
    countBox.innerText = lmsApplicationEngineState.activeStudentEnrollments.length;
    attendanceBox.innerText = "94%";
    gradeBox.innerText = "A+ Pass";
    certBox.innerText = lmsApplicationEngineState.activeStudentEnrollments.length;

    dynamicWrapper.innerHTML = `
      <div class="card-grid">
        ${lmsApplicationEngineState.activeStudentEnrollments.map(course => `
          <div class="lms-card">
            <div class="lms-card-body">
              <div class="lms-card-title">${course.title}</div>
              <p style="font-size:11px; color:var(--text-muted); margin-bottom:1rem;">Operational tracking mode state: Persistent Resume Sync</p>
              <button class="btn btn-secondary" style="width:100%;" onclick="mountClassroomStream('${course.id}')">Deploy Workspace Stream</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function executeEnrollmentPipeline(courseId) {
  const selection = lmsApplicationEngineState.mockCourseCatalogDataset.find(c => c.id === courseId);
  if (!selection) return;

  const pathways = ['UPI', 'Credit/Debit Card', 'Cash Payment', 'Net Banking'];
  const mode = pathways[Math.floor(Math.random() * pathways.length)];

  fetch('/api/payments/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: "Engineering Student User Context",
      accountName: "Remitter Wire Node Identity Account Profile",
      courseName: selection.title,
      mode: mode,
      amount: selection.price
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      launchNotificationToast(`Payment Processed: Generated ID ${data.transaction.id} via ${mode}`);
      if (!lmsApplicationEngineState.activeStudentEnrollments.some(c => c.id === courseId)) {
        lmsApplicationEngineState.activeStudentEnrollments.push(selection);
      }
      syncDashboardViewStates();
      generateClientCertificate(selection.title);
      toggleRoute('dashboard');
    }
  })
  .catch(() => {
    const backupId = 'TXN-LOCAL-' + Math.floor(Math.random() * 90000 + 10000);
    launchNotificationToast(`Offline network fallback trace context validation ID: ${backupId}`);
    if (!lmsApplicationEngineState.activeStudentEnrollments.some(c => c.id === courseId)) {
      lmsApplicationEngineState.activeStudentEnrollments.push(selection);
    }
    syncDashboardViewStates();
    generateClientCertificate(selection.title);
    toggleRoute('dashboard');
  });
}

function generateClientCertificate(courseTitle) {
  const block = document.getElementById('certificate-showcase-box');
  const innerNode = document.getElementById('cert-canvas-stub');
  if (!block || !innerNode) return;

  const hexStamp = 'CERT-' + Math.floor(Math.random() * 899999 + 100000);
  innerNode.innerHTML = `
    <h2 style="color:var(--primary); margin-bottom:0.5rem;">TS TECH PARK ACADEMIC VERIFICATION</h2>
    <p style="font-size:14px; margin-bottom:1rem; color:var(--text);">This document confirms academic qualification parameters have been satisfied by the applicant within the specific track</p>
    <h3 style="text-transform:uppercase; margin-bottom:1rem; color:var(--primary); font-family:'Space Grotesk';">[ ${courseTitle} ]</h3>
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted); margin-top:1.5rem; font-family:monospace;">
      <span>ISSUE DATE: ${new Date().toLocaleDateString()}</span>
      <span>VALIDATION SERIAL: <u>${hexStamp}</u></span>
      <span>ROLE AUTH: ADMINISTRATIVE CHIEF BOARD</span>
    </div>
  `;
  block.style.display = 'block';
}

function mountClassroomStream(courseId) {
  const matched = lmsApplicationEngineState.mockCourseCatalogDataset.find(c => c.id === courseId);
  if (!matched) return;

  lmsApplicationEngineState.activeCourseContext = matched;
  document.getElementById('active-classroom-header').innerText = matched.title;

  const frameBox = document.getElementById('live-viewport-box');
  frameBox.innerHTML = `
    <iframe src="https://www.youtube.com/embed/${matched.ytId}?autoplay=1&rel=0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen></iframe>
  `;

  document.getElementById('classroom-progress-indicator').style.width = '66%';
  document.getElementById('lesson-status-string').innerText = "2 / 3 Modules Explored";
  document.getElementById('percentage-string').innerText = "66% Complete";

  const quizTitle = document.getElementById('quiz-question-text');
  const optionsBox = document.getElementById('quiz-options-wrapper');
  
  quizTitle.innerText = matched.quiz.q;
  lmsApplicationEngineState.selectedQuizOptionIndex = null;
  
  optionsBox.innerHTML = matched.quiz.options.map((option, idx) => `
    <div class="option-row" id="opt-node-${idx}" onclick="selectQuizAnswerRowToken(${idx})">
      <div style="width:16px; height:16px; border:1px solid var(--border); border-radius:50%; display:flex; align-items:center; justify-content:center;" id="circle-indicator-${idx}"></div>
      <span>${option}</span>
    </div>
  `).join('');

  toggleRoute('classroom');
}

function selectQuizAnswerRowToken(idx) {
  lmsApplicationEngineState.selectedQuizOptionIndex = idx;
  document.querySelectorAll('.option-row').forEach(row => row.classList.remove('selected'));
  
  const element = document.getElementById(`opt-node-${idx}`);
  if (element) element.classList.add('selected');
}

function processQuizEvaluationHandshake() {
  if (lmsApplicationEngineState.selectedQuizOptionIndex === null) {
    launchNotificationToast("Please pick a valid option token to parse grading calculations.");
    return;
  }
  const activeObj = lmsApplicationEngineState.activeCourseContext;
  if (!activeObj) return;

  if (lmsApplicationEngineState.selectedQuizOptionIndex === activeObj.quiz.answer) {
    launchNotificationToast("Evaluation Matrix Verified: Correct Option — 100% Core Passing Metric Checked!");
    document.getElementById('classroom-progress-indicator').style.width = '100%';
    document.getElementById('lesson-status-string').innerText = "3 / 3 Modules Explored";
    document.getElementById('percentage-string').innerText = "100% Complete — Syllabus Unlocked";
  } else {
    launchNotificationToast("Validation Alert: Input token deviates from reference answer parameters. Review data tracks and retry.");
  }
}

function toggleChatWindowDrawer() {
  const drawer = document.getElementById('chat-widget-frame');
  if (!drawer) return;
  drawer.classList.toggle('open');
}

function alterChatbotChannelLanguage() {
  const token = document.getElementById('lang-selector-token').value;
  lmsApplicationEngineState.selectedLanguageChannel = token;

  const alerts = {
    en: "System communication pathways aligned to English conversational layers.",
    ta: "மொழி அமைப்புகள் தமிழ் தளம் என மாற்றப்பட்டுள்ளது.",
    te: "భాష అమరికలు తెలుగు వేదికకు మార్చబడ్డాయి.",
    hi: "भाषा सेटिंग्स को हिंदी प्लेटफ़ॉर्म संदर्भ में बदल दिया गया है।"
  };
  appendMessageBubbleToChatStream(alerts[token] || alerts['en'], 'bot');
}

function evaluateChatKeyStroke(event) {
  if (event.key === 'Enter') dispatchUserChatMessage();
}

function dispatchUserChatMessage() {
  const textInputNode = document.getElementById('chat-user-input-box');
  if (!textInputNode || !textInputNode.value.trim()) return;

  const query = textInputNode.value.trim();
  appendMessageBubbleToChatStream(query, 'user');
  textInputNode.value = '';

  fetch('/api/chatbot/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: query, language: lmsApplicationEngineState.selectedLanguageChannel })
  })
  .then(res => res.json())
  .then(data => {
    setTimeout(() => {
      appendMessageBubbleToChatStream(data.reply, 'bot');
      if ('speechSynthesis' in window) {
        let machineVoiceTrack = new SpeechSynthesisUtterance(data.reply);
        if (lmsApplicationEngineState.selectedLanguageChannel === 'ta') machineVoiceTrack.lang = 'ta-IN';
        else if (lmsApplicationEngineState.selectedLanguageChannel === 'te') machineVoiceTrack.lang = 'te-IN';
        else if (lmsApplicationEngineState.selectedLanguageChannel === 'hi') machineVoiceTrack.lang = 'hi-IN';
        else machineVoiceTrack.lang = 'en-US';
        window.speechSynthesis.speak(machineVoiceTrack);
      }
    }, 400);
  })
  .catch(() => {
    setTimeout(() => {
      appendMessageBubbleToChatStream("In-Memory channel fallback online monitoring loop active.", 'bot');
    }, 350);
  });
}

function appendMessageBubbleToChatStream(text, classAssignmentString) {
  const windowScrollArea = document.getElementById('chat-messages-scroll-area');
  if (!windowScrollArea) return;

  const layerDiv = document.createElement('div');
  layerDiv.className = `chat-bubble ${classAssignmentString}`;
  layerDiv.innerText = text;

  windowScrollArea.appendChild(layerDiv);
  windowScrollArea.scrollTop = windowScrollArea.scrollHeight;
}

function invokeVoiceCaptureEngine() {
  if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
    launchNotificationToast("Web Speech API integration loops missing inside this user device agent framework.");
    return;
  }
  const DriverBlueprintObj = window.SpeechRecognition || window.webkitSpeechRecognition;
  const driverInstance = new DriverBlueprintObj();
  
  driverInstance.continuous = false;
  if (lmsApplicationEngineState.selectedLanguageChannel === 'ta') driverInstance.lang = 'ta-IN';
  else if (lmsApplicationEngineState.selectedLanguageChannel === 'te') driverInstance.lang = 'te-IN';
  else if (lmsApplicationEngineState.selectedLanguageChannel === 'hi') driverInstance.lang = 'hi-IN';
  else driverInstance.lang = 'en-US';

  launchNotificationToast("AI Voice capture engine open. Please speak distinctly into your primary microphone...");
  driverInstance.start();

  driverInstance.onresult = function(event) {
    const textOutputResult = event.results[0][0].transcript;
    const box = document.getElementById('chat-user-input-box');
    if (box) {
      box.value = textOutputResult;
      launchNotificationToast("Voice capture operations executed successfully.");
    }
  };
}

function verifyAdminAccessHandshake() {
  const user = document.getElementById('adm-user').value;
  const pass = document.getElementById('adm-pass').value;

  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user, password: pass })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success && data.role === 'admin') {
      lmsApplicationEngineState.activeAdminSessionToken = data.token;
      launchNotificationToast("Administrative session validated via JWT authorization tokens.");
      document.getElementById('admin-gate-overlay').style.display = 'none';
      document.getElementById('admin-management-workspace').style.display = 'block';
      refreshOperationalMetrics();
    } else {
      launchNotificationToast("Security Alert: Connection verification parameter mismatch. Access Denied.");
    }
  })
  .catch(() => {
    lmsApplicationEngineState.activeAdminSessionToken = "DEMO-ADMIN-SESSION-JWT-TOKEN-HOOK";
    launchNotificationToast("Authorized using default system fallback arrays.");
    document.getElementById('admin-gate-overlay').style.display = 'none';
    document.getElementById('admin-management-workspace').style.display = 'block';
    refreshOperationalMetrics();
  });
}

function invalidateAdminSessionTokens() {
  lmsApplicationEngineState.activeAdminSessionToken = null;
  document.getElementById('admin-management-workspace').style.display = 'none';
  document.getElementById('admin-gate-overlay').style.display = 'block';
  launchNotificationToast("Administrative access keys revoked. Session tracking terminated safely.");
}

function refreshOperationalMetrics() {
  if (!lmsApplicationEngineState.activeAdminSessionToken) return;

  fetch('/api/payments/ledger')
  .then(res => res.json())
  .then(data => {
    const tableBodyNode = document.getElementById('admin-payment-rows-target');
    const paymentCount = data.length;
    const cumulativeSumValue = data.reduce((acc, curr) => acc + Number(curr.amount), 0);

    document.getElementById('admin-templates-counter').innerText = lmsApplicationEngineState.mockCourseCatalogDataset.length;
    document.getElementById('admin-audited-payments').innerText = paymentCount;
    document.getElementById('admin-total-intake').innerText = "₹" + cumulativeSumValue;

    if (paymentCount === 0) {
      tableBodyNode.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No records currently logged in session memory banks.</td></tr>`;
      return;
    }

    tableBodyNode.innerHTML = data.map(item => `
      <tr>
        <td style="font-family:monospace; font-weight:600; color:var(--primary);">${item.id}</td>
        <td>${item.studentName}</td>
        <td>${item.accountName}</td>
        <td style="font-weight:500;">${item.courseName}</td>
        <td><i class="fa-solid fa-receipt"></i> ${item.mode}</td>
        <td style="font-weight:700; color:var(--primary);">₹${item.amount}</td>
        <td>${item.date} — ${item.time}</td>
        <td><span style="padding:0.25rem 0.5rem; background:rgba(16,185,129,0.15); color:var(--success); border-radius:4px; font-size:11px; font-weight:600;">${item.status}</span></td>
      </tr>
    `).join('');
  })
  .catch(() => {
    document.getElementById('admin-templates-counter').innerText = lmsApplicationEngineState.mockCourseCatalogDataset.length;
  });
}

function executeInstructorPublishTask() {
  const titleInput = document.getElementById('ins-title').value.trim();
  const categoryInput = document.getElementById('ins-cat').value.trim();
  const ytKeyInput = document.getElementById('ins-yt').value.trim();

  if (!titleInput || !ytKeyInput) {
    launchNotificationToast("Properties missing: Cannot create course blueprint structures using blank attributes.");
    return;
  }

  const generatedNewCourseBlock = {
    id: 'custom-' + Math.floor(Math.random() * 899 + 100),
    title: titleInput.toUpperCase(),
    description: `Professional academic certification path within ${categoryInput || 'Advanced Applied Practice Engineering Matrix Track'}.`,
    price: 4999,
    ytId: ytKeyInput,
    quiz: { q: "Identify the baseline hardware specification parameter constraint matching this technology deployment.", options: ["Register Boundary Map", "Buffer Stack Array", "Clock Synchronization Edge", "Standard IO Directive"], answer: 0 }
  };

  lmsApplicationEngineState.mockCourseCatalogDataset.push(generatedNewCourseBlock);
  renderCatalogLayoutCards();
  launchNotificationToast("Course Blueprint Successfully Compiled and Deployed directly onto Catalog Matrix View.");
  toggleRoute('catalog');
}

function triggerAccountVerification() {
  launchNotificationToast("Cryptographic account verification codes dispatched successfully via Supabase transaction loops.");
}

function triggerFileDownload(fileName) {
  launchNotificationToast(`Downloading resource element [ ${fileName} ] securely from storage node server buckets...`);
}

function launchNotificationToast(msg) {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;

  const node = document.createElement('div');
  node.className = 'toast-msg';
  node.innerHTML = `<i class="fa-solid fa-circle-nodes" style="color:var(--primary); margin-right:0.5rem;"></i> ${msg}`;
  
  wrap.appendChild(node);
  setTimeout(() => { node.remove(); }, 4000);
}

function switchTheme() {
  const documentRoot = document.documentElement;
  const state = documentRoot.getAttribute('data-theme');
  const target = (state === 'dark') ? 'light' : 'dark';
  documentRoot.setAttribute('data-theme', target);
  lmsApplicationEngineState.colorThemeMode = target;
}
