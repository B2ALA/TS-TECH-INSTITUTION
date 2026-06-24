/* js/chatbot.js — TechBot AI tutor widget.
   Pure client-side FAQ matching (fast, works offline). Swap getBotReply()
   for a call to a real backend/LLM endpoint later if you want dynamic answers —
   the UI plumbing below won't need to change.
*/

const FAQ = {
  en: {
    welcome: `Hi! I'm <strong>TechBot</strong>, your AI tutor at TS Tech Park!<br><br>Ask me about courses, fees, payment modes, batches, technical concepts, or career guidance.<br><br>I speak <strong>English, Tamil, Hindi &amp; Telugu</strong> — choose your language above!`,
    faq: {
      'can bus': '<strong>CAN (Controller Area Network)</strong> is a Bosch protocol for automotive ECU communication.<br>• Multi-master broadcast • Up to 8 Mbps (CAN FD) • Differential signaling • CRC error detection<br><br>Covered in our <strong>Automotive Embedded Systems</strong> course.',
      rtos: '<strong>RTOS (Real-Time Operating System)</strong> guarantees task execution within strict deadlines.<br>• Preemptive priority scheduling • Mutexes, semaphores, queues • FreeRTOS, Zephyr, VxWorks<br><br>Learn in our <strong>RTOS course</strong> with hands-on labs!',
      autosar: '<strong>AUTOSAR</strong> (AUTomotive Open System ARchitecture) standardizes ECU software.<br>Layers: BSW → RTE → SWC<br>• Classic AUTOSAR for safety ECUs • Adaptive AUTOSAR for ADAS<br><br>Covered in <strong>Automotive Embedded Systems</strong>.',
      iso26262: '<strong>ISO 26262</strong> is the functional safety standard for automotive E/E systems.<br>• ASIL levels A–D • Hazard Analysis &amp; Risk Assessment (HARA)<br><br>Part of our <strong>Automotive Embedded</strong> curriculum.',
      fee: '<strong>TS Tech Park Course Fees:</strong><br>• Digital Electronics: ₹10,000<br>• Java/Python: ₹12,000–₹18,000<br>• Web Dev/Cloud: ₹18,000–₹28,000<br>• ML/AI/Data Science: ₹35,000–₹70,000<br>• Embedded/Automotive: ₹22,000–₹60,000<br><br>We accept <strong>UPI, Online (Card/Net Banking) and Cash</strong> at our centre.',
      payment: '<strong>Payment Modes Accepted:</strong><br>• UPI (GPay, PhonePe, Paytm)<br>• Online — Debit/Credit Card, Net Banking<br>• Cash at the TS Tech Park office<br><br>Your full payment history is visible under <strong>Dashboard → Payments &amp; History</strong>.',
      batch: '<strong>Upcoming Batches:</strong><br>• Automotive Embedded — July 1, 2026<br>• Edge AI — July 8, 2026<br>• RTOS with FreeRTOS — July 15, 2026<br>• Python for Data Science — July 5, 2026<br><br>Early bird discount available on enrollment!',
      certificate: 'TS Tech Park certificates are:<br>• QR-verified<br>• Recognised by 200+ hiring partners<br>• LinkedIn-shareable<br>• Issued the moment you complete a course.',
      career: '<strong>Tech Career Paths:</strong><br>• Embedded: ₹3–30 LPA (Bosch, KPIT, Aptiv)<br>• AI/ML: ₹6–35 LPA (Google, Qualcomm)<br>• Full Stack: ₹4–25 LPA<br>• VLSI: ₹5–40 LPA<br><br>Our placement rate: <strong>98%</strong>!',
      placement: '• 98% placement rate<br>• 200+ hiring partners<br>• Average: ₹6–8 LPA<br>• Resume prep, mock interviews &amp; direct referrals included!',
      contact: '• info@tstechpark.com<br>• +91 98765 43210<br>• No. 42, Tech Park Road, Chennai – 600032<br>• Mon–Sat: 9 AM – 7 PM',
      recommend: '<strong>Top Recommendations:</strong><br>• Automotive Embedded — ₹60,000, 98% placement<br>• Edge AI — ₹70,000, cutting-edge<br>• RTOS — ₹30,000, high demand<br>• Python Data Science — ₹35,000, most enrolled',
      hello: "Hello! I'm <strong>TechBot</strong>! Ask me about courses, fees, batches, technical concepts, or career paths. How can I help?",
      'how are you': "I'm doing well, thank you! How are you doing today?",
      'your name': 'I am TechBot, the AI assistant for TS Tech Park.',
      'good morning': 'Good morning! Hope you have a great day of learning ahead.',
      'good night': 'Good night! Sleep well — see you for class tomorrow.',
      thank: "You're welcome! Keep learning, I'm here anytime.",
      bye: 'Goodbye! Have a great day.',
      'what can you do': 'I can answer questions about courses, fees, payments, batches and careers, and assist with general study questions — in English, Tamil, Hindi or Telugu.',
      'who are you': 'I am an AI assistant here to help you with TS Tech Park courses and queries.',
      joke: 'Why did the computer go to the doctor? Because it had a virus!',
      bored: 'Would you like to hear a joke, take a quick quiz, or learn something new about a course?',
      sad: "I'm sorry you're feeling that way. Would you like to talk about it, or take a break and come back to learning later?",
      time: "Please check your device's clock for the current time.",
      date: "Please check your device calendar for today's date.",
      'study plan': '<strong>Recommended Path:</strong><br>Month 1–2: Domain choice + fundamentals<br>Month 2–3: Core programming (C/Python)<br>Month 3–5: Deep domain study<br>Month 5–6: Capstone project + placement prep',
    },
    warn1: "Please keep our conversation respectful and educational. I'm here to help you learn!",
    warn2: 'Second warning: maintain a respectful tone. I can only assist with educational queries.',
    warn3: 'This conversation has been flagged for inappropriate content. Please contact support for assistance.',
    fallback: 'Great question! Could you be more specific? For example:<br>• "Explain RTOS task scheduling"<br>• "What payment modes do you accept?"<br>• "Upcoming batches?"<br><br>I\'m here 24/7!',
  },
  ta: {
    welcome: `வணக்கம்! நான் <strong>TechBot</strong>, TS Tech Park-ல் உங்கள் AI ஆசிரியர்!<br><br>பாடக் கட்டணம், கட்டண முறை, தொழில்நுட்பம், சேர்க்கை பற்றி கேளுங்கள்.`,
    faq: {
      'can bus': '<strong>CAN Bus</strong> என்பது Bosch நிறுவனம் உருவாக்கிய automotive ECU தொடர்பாடல் நெறிமுறை.<br>• CAN FD: 8 Mbps வரை<br><br><strong>Automotive Embedded</strong> பாடத்தில் கற்றுக்கொள்ளலாம்.',
      fee: '<strong>பாடக் கட்டணம்:</strong><br>• Digital Electronics: ₹10,000<br>• Java/Python: ₹12,000–18,000<br>• ML/AI: ₹35,000–70,000<br><br>UPI, Online, Cash ஏற்றுக்கொள்ளப்படும்.',
      hello: 'வணக்கம்! நான் TechBot. கல்வி, கட்டணம், தொழில் பற்றி கேளுங்கள்!',
      'how are you': 'நான் நன்றாக இருக்கிறேன். நீங்கள் எப்படி இருக்கிறீர்கள்?',
      'your name': 'நான் ஒரு AI உதவியாளர்.',
      'good morning': 'காலை வணக்கம்! உங்கள் நாள் இனிதாக அமையட்டும்.',
      thank: 'உங்களுக்கு வரவேற்பு! தொடர்ந்து கற்கவும்.',
      bye: 'சரி, மீண்டும் சந்திப்போம். நல்ல நாளாக இருக்கட்டும்.',
      batch: '• Automotive Embedded — July 1, 2026<br>• Edge AI — July 8, 2026',
      career: '• Embedded: ₹3–30 LPA<br>• AI/ML: ₹6–35 LPA<br><br>98% placement rate!',
    },
    warn1: 'மரியாதையான உரையாடலை பேணவும். கல்வி கேள்விகளில் மட்டுமே உதவ முடியும்.',
    warn2: 'இரண்டாம் எச்சரிக்கை: உரிய மொழியை பயன்படுத்தவும்.',
    warn3: 'தகாத உள்ளடக்கம் கண்டறியப்பட்டது. Support ஐ தொடர்பு கொள்ளவும்.',
    fallback: 'அருமையான கேள்வி! கொஞ்சம் விரிவாக கேட்கலாமா? நான் 24/7 கிடைக்கிறேன்!',
  },
  hi: {
    welcome: `नमस्ते! मैं <strong>TechBot</strong> हूं, TS Tech Park का AI शिक्षक!<br><br>कोर्स, फीस, भुगतान, बैच या तकनीकी विषयों के बारे में पूछें!`,
    faq: {
      'can bus': '<strong>CAN Bus</strong> Bosch का automotive ECU प्रोटोकॉल है।<br>• CAN FD: 8 Mbps तक<br><strong>Automotive Embedded Systems</strong> कोर्स में सीखें।',
      fee: '<strong>कोर्स फीस:</strong><br>• Digital Electronics: ₹10,000<br>• Java/Python: ₹12,000–18,000<br>• ML/AI: ₹35,000–70,000<br><br>UPI, Online और Cash स्वीकार किया जाता है।',
      hello: 'नमस्ते! मैं TechBot हूं। कोर्स, फीस, करियर के बारे में पूछें!',
      'how are you': 'मैं ठीक हूँ। आप कैसे हैं?',
      'your name': 'मैं एक AI सहायक हूँ।',
      thank: 'आपका स्वागत है। पढ़ते रहें!',
      bye: 'अलविदा! आपका दिन शुभ हो।',
      career: '• Embedded: ₹3–30 LPA<br>• AI/ML: ₹6–35 LPA<br><br>Placement rate: 98%!',
      batch: '• Automotive Embedded — 1 जुलाई 2026<br>• Edge AI — 8 जुलाई 2026',
    },
    warn1: 'कृपया सम्मानजनक बातचीत बनाए रखें।',
    warn2: 'दूसरी चेतावनी: उचित भाषा का उपयोग करें।',
    warn3: 'अनुचित सामग्री का पता चला। Support से संपर्क करें।',
    fallback: 'अच्छा सवाल! थोड़ा विस्तार से बताएं? मैं 24/7 उपलब्ध हूं!',
  },
  te: {
    welcome: `నమస్కారం! నేను <strong>TechBot</strong>, TS Tech Park AI ట్యూటర్!<br><br>కోర్సులు, ఫీజులు, చెల్లింపు, బ్యాచ్‌లు గురించి అడగండి!`,
    faq: {
      hello: 'నమస్కారం! నేను TechBot. కోర్సులు, ఫీజులు, కెరీర్ గురించి అడగండి!',
      fee: '<strong>కోర్సు ఫీజులు:</strong><br>• Digital Electronics: ₹10,000<br>• Java/Python: ₹12,000–18,000<br>• ML/AI: ₹35,000–70,000<br><br>UPI, Online, Cash ఆమోదించబడతాయి.',
      'how are you': 'నేను బాగున్నాను. మీరు ఎలా ఉన్నారు?',
      'your name': 'నేను ఒక AI సహాయకుడిని.',
      thank: 'స్వాగతం! నేర్చుకోవడం కొనసాగించండి!',
      career: '• Embedded: ₹3–30 LPA<br>• AI/ML: ₹6–35 LPA<br><br>Placement: 98%!',
    },
    warn1: 'దయచేసి గౌరవప్రదమైన సంభాషణ నిర్వహించండి.',
    warn2: 'రెండవ హెచ్చరిక: సముచిత భాష ఉపయోగించండి.',
    warn3: 'అనుచితమైన కంటెంట్ గుర్తించబడింది.',
    fallback: 'మంచి ప్రశ్న! నేను 24/7 అందుబాటులో ఉన్నాను!',
  },
};

const BAD = ['stupid', 'idiot', 'fool', 'dumb', 'hate', 'kill', 'shutup', 'fuck', 'shit', 'bastard', 'bitch', 'die', 'suck', 'moron', 'crap', 'useless', 'ugly', 'racist'];

function setChatLang(lang) {
  S.chatLang = lang;
  document.getElementById('chatMsgs').innerHTML = '';
  S.chatWarnings = 0;
  chatWelcome();
}
function chatWelcome() {
  const lang = FAQ[S.chatLang] || FAQ.en;
  addBotMsg(lang.welcome || FAQ.en.welcome);
}
function toggleChat() {
  S.chatOpen = !S.chatOpen;
  document.getElementById('chatPanel').classList.toggle('open', S.chatOpen);
  document.getElementById('chatIcon').className = S.chatOpen ? 'fas fa-times' : 'fas fa-robot';
  if (S.chatOpen) {
    document.getElementById('chatUnread').style.display = 'none';
    document.getElementById('chatInput').focus();
  }
}
function clearChat() {
  document.getElementById('chatMsgs').innerHTML = '';
  S.chatWarnings = 0;
  chatWelcome();
  showToast('Chat cleared', 'info');
}
function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  input.style.height = '';
  document.getElementById('chatSugg').style.display = 'none';

  const lower = msg.toLowerCase();
  const isBad = BAD.some((w) => lower.includes(w));
  if (isBad) {
    S.chatWarnings++;
    addUserMsg(msg);
    const lang = FAQ[S.chatLang] || FAQ.en;
    const wm = S.chatWarnings === 1 ? lang.warn1 : S.chatWarnings === 2 ? lang.warn2 : lang.warn3;
    setTimeout(() => addBotMsg(`<div class="warn-msg"><i class="fas fa-exclamation-triangle"></i>${wm}</div>`), 500);
    return;
  }

  addUserMsg(msg);
  const msgs = document.getElementById('chatMsgs');
  const typing = document.createElement('div');
  typing.className = 'cmr';
  typing.innerHTML = `<div class="msg-av-sm bot-av-sm"><i class="fas fa-robot" style="font-size:8px"></i></div><div class="msg-bubble bot-bub"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
  msgs.appendChild(typing);
  scrollChat();
  setTimeout(() => { typing.remove(); addBotMsg(getBotReply(msg)); }, 650 + Math.random() * 400);
}
function sendSugg(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}
function getBotReply(msg) {
  const lang = FAQ[S.chatLang] || FAQ.en;
  const m = msg.toLowerCase();
  const faq = lang.faq || {};
  const efaq = FAQ.en.faq;
  for (const [k, v] of Object.entries(faq)) if (m.includes(k)) return v;
  for (const [k, v] of Object.entries(efaq)) if (m.includes(k)) return v;
  if (m.includes('price') || m.includes('cost')) return efaq.fee;
  if (m.includes('upi') || m.includes('cash') || m.includes('payment mode')) return efaq.payment;
  if (m.includes('batch') || m.includes('start') || m.includes('when')) return efaq.batch;
  if (m.includes('placement') || m.includes('job') || m.includes('salary')) return efaq.placement;
  if (m.includes('cert')) return efaq.certificate;
  if (m.includes('contact') || m.includes('address')) return efaq.contact;
  if (m.includes('recommend') || m.includes('best course')) return efaq.recommend;
  return lang.fallback || FAQ.en.fallback;
}
function addBotMsg(html) {
  const msgs = document.getElementById('chatMsgs');
  const d = document.createElement('div');
  d.className = 'cmr';
  d.innerHTML = `<div class="msg-av-sm bot-av-sm"><i class="fas fa-robot" style="font-size:8px"></i></div><div class="msg-bubble bot-bub">${html}</div>`;
  msgs.appendChild(d);
  scrollChat();
}
function addUserMsg(text) {
  const msgs = document.getElementById('chatMsgs');
  const d = document.createElement('div');
  d.className = 'cmr user';
  d.innerHTML = `<div class="msg-bubble user-bub">${escHtml(text)}</div><div class="msg-av-sm user-av-sm">U</div>`;
  msgs.appendChild(d);
  scrollChat();
}
function scrollChat() { const m = document.getElementById('chatMsgs'); m.scrollTop = m.scrollHeight; }
function autoResizeChat(el) { el.style.height = ''; el.style.height = Math.min(el.scrollHeight, 80) + 'px'; }
function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
