/* ============================================================
   TS TECH PARK — TECHBOT (rule-based, multilingual)
   Matches casual conversation pairs + LMS-specific FAQ.
   No external AI API — pure pattern matching, runs fully
   client-side, works offline.
   ============================================================ */

const BAD_WORDS = ['stupid','idiot','fool','dumb','hate','kill','shutup','fuck','shit','bastard','bitch','die','suck','moron','crap','useless','ugly','racist'];

// Casual conversation pairs, exactly as provided, per language.
const CASUAL = {
  en: [
    [['hi','hello','hey'], "Hello! How can I help you today?"],
    [['how are you'], "I'm doing well. How are you?"],
    [['what is your name','who are you'], "I am an AI assistant."],
    [['good morning'], "Good morning! Hope you have a great day."],
    [['good night'], "Good night! Sleep well."],
    [['thank you','thanks'], "You're welcome!"],
    [['bye','goodbye'], "Goodbye! Have a nice day."],
    [['what can you do'], "I can answer questions, provide information, and assist with various tasks."],
    [['can you speak tamil'], "Yes, I can communicate in Tamil."],
    [['can you speak telugu'], "Yes, I can communicate in Telugu."],
    [['can you speak hindi'], "Yes, I can communicate in Hindi."],
    [['can you speak english'], "Yes, I can communicate in English."],
    [['tell me a joke','joke'], "Why did the computer go to the doctor? Because it had a virus!"],
    [['i am bored','bored'], "Would you like to hear a joke, play a quiz, or learn something new?"],
    [['i am sad','sad'], "I'm sorry you're feeling sad. Would you like to talk about it?"],
    [['what is the time','time'], "Please check your device's clock for the current time."],
    [['what is today\'s date','date'], "Please check your device calendar for the current date."],
  ],
  ta: [
    [['வணக்கம்'], "வணக்கம்! உங்களுக்கு எப்படி உதவலாம்?"],
    [['எப்படி இருக்கிறீர்கள்'], "நான் நன்றாக இருக்கிறேன். நீங்கள் எப்படி இருக்கிறீர்கள்?"],
    [['உங்கள் பெயர் என்ன'], "நான் ஒரு AI உதவியாளர்."],
    [['காலை வணக்கம்'], "காலை வணக்கம்! உங்கள் நாள் இனிதாக அமையட்டும்."],
    [['நன்றி'], "உங்களுக்கு வரவேற்பு!"],
    [['மீண்டும் சந்திப்போம்'], "சரி, மீண்டும் சந்திப்போம். நல்ல நாளாக இருக்கட்டும்."],
    [['நீங்கள் என்ன செய்ய முடியும்'], "கேள்விகளுக்கு பதில் அளிக்கவும், தகவல் வழங்கவும், பல்வேறு பணிகளில் உதவவும் முடியும்."],
  ],
  hi: [
    [['नमस्ते'], "नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ?"],
    [['आप कैसे हैं'], "मैं ठीक हूँ। आप कैसे हैं?"],
    [['आपका नाम क्या है'], "मैं एक AI सहायक हूँ।"],
    [['धन्यवाद'], "आपका स्वागत है।"],
    [['अलविदा'], "अलविदा! आपका दिन शुभ हो।"],
  ],
  te: [
    [['నమస్కారం'], "నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?"],
    [['మీరు ఎలా ఉన్నారు'], "నేను బాగున్నాను. మీరు ఎలా ఉన్నారు?"],
    [['మీ పేరు ఏమిటి'], "నేను ఒక AI సహాయకుడిని."],
    [['శుభోదయం'], "శుభోదయం! మీ రోజు ఆనందంగా ఉండాలి."],
    [['ధన్యవాదాలు'], "స్వాగతం!"],
    [['వీడ్కోలు'], "వీడ్కోలు! మీ రోజు శుభంగా గడవాలి."],
  ],
};

// LMS-specific knowledge, keyword-matched, per language with English fallback.
const LMS_FAQ = {
  en: {
    'fee': () => {
      const courses = DB.getCourses().filter(c => c.published !== false);
      if (!courses.length) return "We don't have published courses yet — check back soon, or browse the Courses page for the latest catalog.";
      const min = Math.min(...courses.map(c => c.price));
      const max = Math.max(...courses.map(c => c.price));
      return `Course fees currently range from ${fmtMoney(min)} to ${fmtMoney(max)} depending on the course. EMI options are shown at checkout. Check the Courses page for the full list.`;
    },
    'batch': () => {
      const live = DB.getLive();
      if (!live.length) return "No upcoming batches have been posted yet. Check the Live Classes page for the latest schedule.";
      return "Upcoming sessions: " + live.slice(0,3).map(l => `${l.title} (${l.time})`).join(', ') + ". See the Live Classes page for the full schedule.";
    },
    'certificate': "Certificates at TS Tech Park are issued after you complete all modules of a course, with a unique verification code you can share on LinkedIn or with employers.",
    'placement': "We offer placement guidance including resume prep, mock interviews, and referrals to our hiring partners. Visit your Dashboard once enrolled for personalised guidance.",
    'contact': "Email: info@tstechpark.com · Phone: +91 98765 43210 · Mon–Sat, 9 AM – 7 PM.",
    'recommend': "Tell me which area interests you — Embedded Systems, AI & Data Science, Web Development, Cybersecurity, or Electronics — and I'll point you to the right course.",
    'enroll': "To enroll, open a course from the Courses page, choose a payment method (UPI, Card, or Cash) and confirm. Your enrollment and payment receipt will appear in Dashboard → Payments.",
  },
  ta: {
    'fee': "பாடக் கட்டணம் குறித்த விவரங்களை Courses பக்கத்தில் காணலாம்.",
    'certificate': "பாடத்தை முடித்த பிறகு சான்றிதழ் வழங்கப்படும்.",
  },
  hi: {
    'fee': "कोर्स फीस की जानकारी Courses पेज पर उपलब्ध है।",
    'certificate': "कोर्स पूरा करने के बाद प्रमाणपत्र जारी किया जाता है।",
  },
  te: {
    'fee': "కోర్సు ఫీజు వివరాలు Courses పేజీలో ఉన్నాయి.",
    'certificate': "కోర్సు పూర్తయిన తర్వాత సర్టిఫికేట్ జారీ చేయబడుతుంది.",
  },
};

const WARN_MSG = {
  en: ["Let's keep this conversation respectful — I'm only able to help with learning-related questions.",
       "Second reminder: please use respectful language so I can keep helping you.",
       "This conversation has been flagged for inappropriate content. Please contact support if you need help."],
  ta: ["மரியாதையான உரையாடலை பேணவும், கல்வி தொடர்பான கேள்விகளில் மட்டுமே உதவ முடியும்.",
       "இரண்டாம் நினைவூட்டல்: உரிய மொழியைப் பயன்படுத்தவும்.",
       "தகாத உள்ளடக்கம் கண்டறியப்பட்டது. உதவிக்கு support ஐ தொடர்பு கொள்ளவும்."],
  hi: ["कृपया सम्मानजनक भाषा का प्रयोग करें — मैं केवल पढ़ाई से जुड़े सवालों में मदद कर सकता हूँ।",
       "दूसरी चेतावनी: कृपया उचित भाषा का उपयोग करें।",
       "अनुचित सामग्री की पहचान हुई है। सहायता के लिए सपोर्ट से संपर्क करें।"],
  te: ["దయచేసి గౌరవప్రదమైన భాష ఉపయోగించండి — నేను చదువుకు సంబంధించిన ప్రశ్నలకే సహాయం చేయగలను.",
       "రెండవ హెచ్చరిక: సరైన భాష ఉపయోగించండి.",
       "అనుచిత కంటెంట్ గుర్తించబడింది. సహాయం కోసం సపోర్ట్‌ను సంప్రదించండి."],
};

const FALLBACK = {
  en: "I'm not sure about that yet. Try asking about course fees, upcoming batches, certificates, placements, or just say hi!",
  ta: "அதைப் பற்றி எனக்கு இன்னும் தெரியவில்லை. கட்டணம், பேட்ச், சான்றிதழ் பற்றி கேட்கலாம்!",
  hi: "मुझे अभी इसका पता नहीं है। फीस, बैच, प्रमाणपत्र के बारे में पूछ सकते हैं!",
  te: "దాని గురించి నాకు ఇంకా తెలియదు. ఫీజు, బ్యాచ్‌లు, సర్టిఫికెట్ల గురించి అడగండి!",
};

function techbotReply(message, lang, warnState) {
  const m = message.toLowerCase().trim();

  if (BAD_WORDS.some(w => m.includes(w))) {
    warnState.count++;
    const idx = Math.min(warnState.count, 3) - 1;
    return { type: 'warning', text: (WARN_MSG[lang] || WARN_MSG.en)[idx] };
  }

  const casual = CASUAL[lang] || [];
  for (const [patterns, reply] of casual) {
    if (patterns.some(p => m.includes(p))) return { type: 'reply', text: reply };
  }
  // fall through to English casual matches too (mixed language input)
  if (lang !== 'en') {
    for (const [patterns, reply] of CASUAL.en) {
      if (patterns.some(p => m.includes(p))) return { type: 'reply', text: reply };
    }
  }

  const faq = LMS_FAQ[lang] || {};
  const faqEn = LMS_FAQ.en;
  for (const [k, v] of Object.entries(faq)) {
    if (m.includes(k)) return { type: 'reply', text: typeof v === 'function' ? v() : v };
  }
  for (const [k, v] of Object.entries(faqEn)) {
    if (m.includes(k)) return { type: 'reply', text: typeof v === 'function' ? v() : v };
  }

  return { type: 'reply', text: FALLBACK[lang] || FALLBACK.en };
}
