const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { verifyRole } = require('../middleware/auth');
require('dotenv').config();

// In-Memory Operations Matrix Logs Storage
let transactionLedger = [];
let databaseUsers = [
  { id: "USR-001", email: "student@tstechpark.com", role: "student", status: "active" },
  { id: "USR-002", email: "instructor@tstechpark.com", role: "instructor", status: "active" }
];

const chatbotCoreQA = {
  en: {
    "hi": "Hello! How can I help you today?",
    "how are you": "I am doing well, ready to optimize your academic tracking matrices. How are you?",
    "what is your name": "I am the TS Tech Park Advanced AI Support Engine.",
    "good morning": "Good morning! Hope you have a great day.",
    "good night": "Good night! Sleep well.",
    "thank you": "You're welcome!",
    "bye": "Goodbye! Have a nice day.",
    "who are you": "I am an AI assistant here to help you."
  },
  ta: {
    "வணக்கம்": "வணக்கம்! உங்களுக்கு எப்படி உதவலாம்?",
    "எப்படி இருக்கிறீர்கள்": "நான் நன்றாக இருக்கிறேன். நீங்கள் எப்படி இருக்கிறீர்கள்?",
    "உங்கள் பெயர் என்ன": "நான் ஒரு AI உதவியாளர்.",
    "காலை வணக்கம்": "காலை வணக்கம்! உங்கள் நாள் இனிதாக அமையட்டும்.",
    "நன்றி": "உங்களுக்கு வரவேற்பு!",
    "மீண்டும் சந்திப்போம்": "சரி, மீண்டும் சந்திப்போம். நல்ல நாளாக இருக்கட்டும்."
  },
  te: {
    "నమస్కారం": "నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?",
    "మీరు ఎలా ఉన్నారు": "నేను బాగున్నాను. మీరు ఎలా ఉన్నారు?",
    "మీ పేరు ఏమిటి": "మీ పేరు ఏమిటి?",
    "శుభోదయం": "శుభోదయం! మీ రోజు ఆనందంగా ఉండాలి.",
    "ధన్యవాదాలు": "స్వాగతం!"
  },
  hi: {
    "नमस्ते": "नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ?",
    "आप कैसे हैं": "मैं ठीक हूँ। आप कैसे हैं?",
    "आपका नाम क्या है": "मैं एक AI सहायक हूँ।",
    "धन्यवाद": "आपका स्वागत है।"
  }
};

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const sysUser = process.env.ADMIN_USER || 'admin@tstechpark.com';
  const sysPass = process.env.ADMIN_PASS || 'TSTechParkAdminSecure2026Password';

  if (email === sysUser && password === sysPass) {
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
    return res.json({ success: true, token, role: 'admin' });
  }

  if (email.includes('instructor')) {
    const token = jwt.sign({ email, role: 'instructor' }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
    return res.json({ success: true, token, role: 'instructor' });
  }

  const token = jwt.sign({ email, role: 'student' }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
  res.json({ success: true, token, role: 'student' });
});

router.post('/payments/execute', (req, res) => {
  const { studentName, accountName, courseName, mode, amount } = req.body;
  const generatedId = 'TXN-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  const transactionRecord = {
    id: generatedId,
    studentName: studentName || "Anonymous Scholar",
    accountName: accountName || "Primary Remitter Node",
    courseName,
    mode: mode || "UPI Gateway Link",
    amount: parseFloat(amount || 4999),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    status: "Success"
  };

  transactionLedger.unshift(transactionRecord);
  res.json({ success: true, transaction: transactionRecord });
});

router.get('/payments/ledger', (req, res) => {
  res.json(transactionLedger);
});

router.get('/admin/users', verifyRole(['admin']), (req, res) => {
  res.json(databaseUsers);
});

router.post('/chatbot/query', (req, res) => {
  const { message, language } = req.body;
  if (!message) return res.status(400).json({ reply: "Null elements cannot be evaluated." });

  const activeLang = language || 'en';
  const cleanInput = message.trim().toLowerCase().replace(/[?.!]/g, '');
  
  const selectedDictionary = chatbotCoreQA[activeLang] || chatbotCoreQA['en'];
  let reply = selectedDictionary[cleanInput];

  if (!reply && activeLang !== 'en') {
    reply = chatbotCoreQA['en'][cleanInput];
  }
  if (!reply) {
    reply = activeLang === 'ta' ? "மன்னிக்கவும், எனக்கு புரியவில்லை." :
            activeLang === 'te' ? "క్షమించండి, నాకు అర్థం కాలేదు." :
            activeLang === 'hi' ? "क्षमा करें, मुझे समझ नहीं आया।" :
                                "I can answer questions regarding courses, placement criteria, or tuition invoices.";
  }

  res.json({ reply });
});

module.exports = router;
