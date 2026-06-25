const chatbotQA_Matrix = {
    en: {
        fallback: "Query processed by cloud token engine. For structural placement tracking details, analyze criteria maps within the acceleration terminal interface.",
        records: [
            { q: ["hi", "hello"], a: "Hello! How can I help you today?" },
            { q: ["how are you"], a: "I'm doing well. How are you?" },
            { q: ["what is your name"], a: "I am an AI assistant representating TS Tech Park." },
            { q: ["good morning"], a: "Good morning! Hope you have a great day." },
            { q: ["good night"], a: "Good night! Sleep well." },
            { q: ["thank you"], a: "You're welcome!" },
            { q: ["bye", "goodbye"], a: "Goodbye! Have a nice day." },
            { q: ["what can you do"], a: "I can answer questions, provide information, and assist with various tasks." },
            { q: ["who are you"], a: "I am an AI assistant here to help you." },
            { q: ["can you speak tamil"], a: "Yes, I can communicate in Tamil." },
            { q: ["can you speak telugu"], a: "Yes, I can communicate in Telugu." },
            { q: ["can you speak hindi"], a: "Yes, I can communicate in Hindi." },
            { q: ["can you speak english"], a: "Yes, I can communicate in English." },
            { q: ["tell me a joke"], a: "Why did the computer go to the doctor? Because it had a virus!" },
            { q: ["i am bored"], a: "Would you like to hear a joke, play a quiz, or learn something new?" },
            { q: ["i am sad"], a: "I'm sorry you're feeling sad. Would you like to talk about it?" },
            { q: ["what is the time"], a: "Please check your device's clock for the current time." },
            { q: ["what is today's date"], a: "Please check your device calendar for the current date." }
        ]
    },
    ta: {
        fallback: "தங்களின் கேள்விக்குரிய விவரம் தற்போது சேமிப்பில் இல்லை. கணினி மேலாளரை அணுகவும்.",
        records: [
            { q: ["வணக்கம்"], a: "வணக்கம்! உங்களுக்கு எப்படி உதவலாம்?" },
            { q: ["எப்படி இருக்கிறீர்கள்"], a: "நான் நன்றாக இருக்கிறேன். நீங்கள் எப்படி இருக்கிறீர்கள்?" },
            { q: ["உங்கள் பெயர் என்ன"], a: "நான் ஒரு AI உதவியாளர்." },
            { q: ["காலை வணக்கம்"], a: "காலை வணக்கம்! உங்கள் நாள் இனிதாக அமையட்டும்." },
            { q: ["நன்றி"], a: "உங்களுக்கு வரவேற்பு!" },
            { q: ["மீண்டும் சந்திப்போம்"], a: "சரி, மீண்டும் சந்திப்போம். நல்ல நாளாக இருக்கட்டும்." },
            { q: ["நீங்கள் என்ன செய்ய முடியும்"], a: "கேள்விகளுக்கு பதில் அளிக்கவும், தகவல் வழங்கவும், பல்வேறு பணிகளில் உதவவும் முடியும்." }
        ]
    },
    te: {
        fallback: "క్షమించండి, ఈ ప్రశ్నకు సంబంధించిన సమాచారం ప్రస్తుతం అందుబాటులో లేదు.",
        records: [
            { q: ["నమస్కారం"], a: "నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?" },
            { q: ["మీరు ఎలా ఉన్నారు"], a: "నేను బాగున్నాను. మీరు ఎలా ఉన్నారు?" },
            { q: ["మీ పేరు ఏమిటి"], a: "నేను ఒక AI సహాయకుడిని." },
            { q: ["శుభోదయం"], a: "శుభోదయం! మీ రోజు ఆనందంగా ఉండాలి." },
            { q: ["ధన్యవాదాలు"], a: "స్వాगతం!" },
            { q: ["వీడ్కోలు"], a: "వీడ్కోలు! మీ రోజు శుభంగా గడవాలి." }
        ]
    },
    hi: {
        fallback: "क्षमा करें, इस प्रश्न का सटीक उत्तर डेटाबेस में उपलब्ध नहीं है।",
        records: [
            { q: ["नमस्ते"], a: "नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ?" },
            { q: ["आप कैसे हैं"], a: "मैं ठीक हूँ। आप कैसे हैं?" },
            { q: ["आपका नाम क्या है"], a: "मैं एक AI सहायक हूँ।" },
            { q: ["धन्यवाद"], a: "आपका स्वागत है।" },
            { q: ["अलविदा"], a: "अलविदा! आपका दिन शुभ हो।" }
        ]
    }
};

exports.processMessageInput = async (req, res) => {
    try {
        const { message, language } = req.body;
        const targetLang = ['en', 'ta', 'te', 'hi'].includes(language) ? language : 'en';
        
        if (!message) {
            return res.status(400).json({ error: "Message prompt element cannot be evaluated blank." });
        }

        const normalizedInput = message.toLowerCase().trim();
        const pack = chatbotQA_Matrix[targetLang];

        let finalReply = null;
        for (const item of pack.records) {
            if (item.q.some(keyword => normalizedInput.includes(keyword) || keyword.includes(normalizedInput))) {
                finalReply = item.a;
                break;
            }
        }

        if (!finalReply && targetLang !== 'en') {
            for (const item of chatbotQA_Matrix.en.records) {
                if (item.q.some(keyword => normalizedInput.includes(keyword))) {
                    finalReply = item.a;
                    break;
                }
            }
        }

        if (!finalReply) {
            finalReply = pack.fallback;
        }

        return res.status(200).json({
            reply: finalReply,
            languageEvaluated: targetLang,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
