/* ============================================================
   js/chatbot.js — self-contained, no backend required.
   Combines casual conversational replies (EN/TA/TE/HI) with
   LMS-specific FAQ (fees, batches, certificates, careers).
   ============================================================ */

const CHAT_STATE = { lang: 'en', open: false, warnings: 0 };

const BAD_WORDS = ['stupid','idiot','fool','dumb','hate','kill','shutup','fuck','shit','bastard','bitch','die','suck','moron','crap','useless','racist'];

const CASUAL = {
  en: {
    'hi': 'Hello! How can I help you today?', 'hello': 'Hello! How can I help you today?',
    'how are you': "I'm doing well. How are you?",
    'what is your name': 'I am TechBot, an AI assistant for TS Tech Park.',
    'good morning': 'Good morning! Hope you have a great day.',
    'good night': 'Good night! Sleep well.',
    'thank you': "You're welcome!", 'thanks': "You're welcome!",
    'bye': 'Goodbye! Have a nice day.', 'goodbye': 'Goodbye! Have a nice day.',
    'what can you do': 'I can answer questions, provide course information, and assist with various tasks.',
    'who are you': 'I am an AI assistant here to help you.',
    'can you speak tamil': 'Yes, I can communicate in Tamil.',
    'can you speak telugu': 'Yes, I can communicate in Telugu.',
    'can you speak hindi': 'Yes, I can communicate in Hindi.',
    'can you speak english': 'Yes, I can communicate in English.',
    'tell me a joke': 'Why did the computer go to the doctor? Because it had a virus!',
    'i am bored': 'Would you like to hear a joke, try a quiz, or learn something new?',
    'i am sad': "I'm sorry you're feeling sad. Would you like to talk about it, or take a short break from studying?",
    'what is the time': "Please check your device's clock for the current time.",
    'what is today date': 'Please check your device calendar for the current date.',
  },
  ta: {
    'வணக்கம்': 'வணக்கம்! உங்களுக்கு எப்படி உதவலாம்?',
    'எப்படி இருக்கிறீர்கள்': 'நான் நன்றாக இருக்கிறேன். நீங்கள் எப்படி இருக்கிறீர்கள்?',
    'உங்கள் பெயர் என்ன': 'நான் ஒரு AI உதவியாளர்.',
    'காலை வணக்கம்': 'காலை வணக்கம்! உங்கள் நாள் இனிதாக அமையட்டும்.',
    'நன்றி': 'உங்களுக்கு வரவேற்பு!',
    'மீண்டும் சந்திப்போம்': 'சரி, மீண்டும் சந்திப்போம். நல்ல நாளாக இருக்கட்டும்.',
    'நீங்கள் என்ன செய்ய முடியும்': 'கேள்விகளுக்கு பதில் அளிக்கவும், தகவல் வழங்கவும், பல்வேறு பணிகளில் உதவவும் முடியும்.',
  },
  te: {
    'నమస్కారం': 'నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?',
    'మీరు ఎలా ఉన్నారు': 'నేను బాగున్నాను. మీరు ఎలా ఉన్నారు?',
    'మీ పేరు ఏమిటి': 'నేను ఒక AI సహాయకుడిని.',
    'శుభోదయం': 'శుభోదయం! మీ రోజు ఆనందంగా ఉండాలి.',
    'ధన్యవాదాలు': 'స్వాగతం!',
    'వీడ్కోలు': 'వీడ్కోలు! మీ రోజు శుభంగా గడవాలి.',
  },
  hi: {
    'नमस्ते': 'नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ?',
    'आप कैसे हैं': 'मैं ठीक हूँ। आप कैसे हैं?',
    'आपका नाम क्या है': 'मैं एक AI सहायक हूँ।',
    'धन्यवाद': 'आपका स्वागत है।',
    'अलविदा': 'अलविदा! आपका दिन शुभ हो।',
  },
};

const FAQ = {
  en: {
    'fee': '<strong>Course Fees:</strong><br>• Digital Electronics: ₹10,000<br>• Java/Python: ₹12,000–18,000<br>• ML/AI: ₹35,000–70,000<br>• Embedded/Automotive: ₹22,000–60,000<br>EMI available • UPI/Card/Cash accepted',
    'batch': 'Upcoming batches open monthly. Check the Live Classes tab for the current schedule and seat availability.',
    'certificate': 'Certificates are QR-verified, shareable to LinkedIn, and issued automatically once you complete a course — view them in your Dashboard → Certificates.',
    'career': '<strong>Tech Career Paths:</strong><br>Embedded: ₹3–30 LPA · AI/ML: ₹6–35 LPA · Full Stack: ₹4–25 LPA · VLSI: ₹5–40 LPA',
    'payment': 'We accept UPI, Cash, Card, and Net Banking. Payments are recorded and verified by our team — check Dashboard → Payments for your history.',
    'recommend': 'Tell me a subject you like (e.g. "embedded systems" or "AI") and I can point you to the right course category.',
  },
};

function chatWelcome() {
  const msgs = { en: "Hi! I'm <strong>TechBot</strong>. Ask me about courses, fees, or just say hello!",
    ta: 'வணக்கம்! நான் <strong>TechBot</strong>.', te: 'నమస్కారం! నేను <strong>TechBot</strong>.', hi: 'नमस्ते! मैं <strong>TechBot</strong> हूं।' };
  addBotMsg(msgs[CHAT_STATE.lang] || msgs.en);
}

function setChatLang(lang) { CHAT_STATE.lang = lang; document.getElementById('chatMsgs').innerHTML = ''; chatWelcome(); }
function toggleChat() {
  CHAT_STATE.open = !CHAT_STATE.open;
  document.getElementById('chatPanel').classList.toggle('open', CHAT_STATE.open);
}
function clearChat() { document.getElementById('chatMsgs').innerHTML = ''; CHAT_STATE.warnings = 0; chatWelcome(); }

function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  const lower = msg.toLowerCase();

  if (BAD_WORDS.some(w => lower.includes(w))) {
    CHAT_STATE.warnings++;
    addUserMsg(msg);
    const warn = CHAT_STATE.warnings === 1 ? 'Please keep our conversation respectful — I\'m here to help you learn!'
      : CHAT_STATE.warnings === 2 ? 'Second warning: please use respectful language.'
      : 'Conversation flagged. Please contact support if you need assistance.';
    setTimeout(() => addBotMsg(`<div class="warn-msg">⚠️ ${warn}</div>`), 400);
    return;
  }

  addUserMsg(msg);
  setTimeout(() => addBotMsg(getBotReply(lower)), 500);
}

function sendSugg(text) { document.getElementById('chatInput').value = text; sendChat(); }

function getBotReply(lower) {
  const casual = CASUAL[CHAT_STATE.lang] || CASUAL.en;
  for (const [k, v] of Object.entries(casual)) if (lower.includes(k)) return v;
  for (const [k, v] of Object.entries(CASUAL.en)) if (lower.includes(k)) return v;

  const faq = FAQ[CHAT_STATE.lang] || FAQ.en;
  if (lower.includes('fee') || lower.includes('cost') || lower.includes('price')) return faq.fee || FAQ.en.fee;
  if (lower.includes('batch') || lower.includes('schedule')) return faq.batch || FAQ.en.batch;
  if (lower.includes('cert')) return faq.certificate || FAQ.en.certificate;
  if (lower.includes('career') || lower.includes('job') || lower.includes('salary')) return faq.career || FAQ.en.career;
  if (lower.includes('pay') || lower.includes('upi') || lower.includes('cash')) return faq.payment || FAQ.en.payment;
  if (lower.includes('recommend') || lower.includes('best course')) return faq.recommend || FAQ.en.recommend;

  return 'Great question! Could you be more specific — for example, "course fees" or "upcoming batches"? I\'m here 24/7!';
}

function addBotMsg(html) {
  const msgs = document.getElementById('chatMsgs');
  const d = document.createElement('div');
  d.className = 'cmr';
  d.innerHTML = `<div class="msg-av-sm bot-av-sm"><i class="fas fa-robot" style="font-size:8px"></i></div><div class="msg-bubble bot-bub">${html}</div>`;
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
}
function addUserMsg(text) {
  const msgs = document.getElementById('chatMsgs');
  const d = document.createElement('div');
  d.className = 'cmr user';
  d.innerHTML = `<div class="msg-bubble user-bub">${text.replace(/</g,'&lt;')}</div><div class="msg-av-sm user-av-sm">U</div>`;
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
}

document.addEventListener('DOMContentLoaded', chatWelcome);
Chatbot · JS
