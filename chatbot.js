/**
 * Multi-Language Conversational Academic Chatbot Logic Array
 */
class MultilingualChatbot {
    constructor() {
        this.isOpen = false;
        this.selectedLanguage = 'en';
        
        // Comprehensive pre-defined translation matrix
        this.dictionary = {
            en: {
                welcome: "Welcome to TS Tech Park terminal support. Ask your training curriculum parameters.",
                fallback: "Query processed by cloud token engine. For real-time enrollment validation, cross-check parameters within the admin console tracking registers.",
                qa: [
                    { q: "hi", a: "Hello! How can I help you today?" },
                    { q: "how are you", a: "I'm doing well. How are you?" },
                    { q: "what is your name", a: "I am an AI assistant." },
                    { q: "good morning", a: "Good morning! Hope you have a great day." },
                    { q: "good night", a: "Good night! Sleep well." },
                    { q: "thank you", a: "You're welcome!" },
                    { q: "bye", a: "Goodbye! Have a nice day." },
                    { q: "what can you do", a: "I can answer questions, provide information, and assist with various tasks." },
                    { q: "who are you", a: "I am an AI assistant here to help you." },
                    { q: "can you speak tamil", a: "Yes, I can communicate in Tamil." },
                    { q: "can you speak telugu", a: "Yes, I can communicate in Telugu." },
                    { q: "can you speak hindi", a: "Yes, I can communicate in Hindi." },
                    { q: "can you speak english", a: "Yes, I can communicate in English." },
                    { q: "tell me a joke", a: "Why did the computer go to the doctor? Because it had a virus!" },
                    { q: "i am bored", a: "Would you like to hear a joke, play a quiz, or learn something new?" },
                    { q: "i am sad", a: "I'm sorry you're feeling sad. Would you like to talk about it?" },
                    { q: "what is the time", a: "Please check your device's clock for the current time." },
                    { q: "what is today's date", a: "Please check your device calendar for the current date." }
                ]
            },
            ta: {
                welcome: "வணக்கம்! டிஎஸ் டெக் பார்க் உதவி மையத்திற்கு வரவேற்கிறோம். தங்களின் சந்தேகங்களை கேட்கலாம்.",
                fallback: "தங்களின் கேள்விக்குரிய விவரம் தற்போது சேமிப்பில் இல்லை. கணினி மேலாளரை அணுகவும்.",
                qa: [
                    { q: "வணக்கம்", a: "வணக்கம்! உங்களுக்கு எப்படி உதவலாம்?" },
                    { q: "எப்படி இருக்கிறீர்கள்", a: "நான் நன்றாக இருக்கிறேன். நீங்கள் எப்படி இருக்கிறீர்கள்?" },
                    { q: "உங்கள் பெயர் என்ன", a: "நான் ஒரு AI உதவியாளர்." },
                    { q: "காலை வணக்கம்", a: "காலை வணக்கம்! உங்கள் நாள் இனிதாக அமையட்டும்." },
                    { q: "நன்றி", a: "உங்களுக்கு வரவேற்பு!" },
                    { q: "மீண்டும் சந்திப்போம்", a: "சரி, மீண்டும் சந்திப்போம். நல்ல நாளாக இருக்கட்டும்." },
                    { q: "நீங்கள் என்ன செய்ய முடியும்", a: "கேள்விகளுக்கு பதில் அளிக்கவும், தகவல் வழங்கவும், பல்வேறு பணிகளில் உதவவும் முடியும்." }
                ]
            },
            te: {
                welcome: "నమస్కారం! టిఎస్ టెక్ పార్క్ సహాయ కేంద్రానికి స్వాగతం.",
                fallback: "క్షమించండి, ఈ ప్రశ్నకు సంబంధించిన సమాచారం ప్రస్తుతం అందుబాటులో లేదు.",
                qa: [
                    { q: "నమస్కారం", a: "నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?" },
                    { q: "మీరు ఎలా ఉన్నారు", a: "నేను బాగున్నాను. మీరు ఎలా ఉన్నారు?" },
                    { q: "మీ పేరు ఏమిటి", a: "నేను ఒక AI సహాయకుడిని." },
                    { q: "శుభోదయం", a: "శుభోదయం! మీ రోజు ఆనందంగా ఉండాలి." },
                    { q: "ధన్యవాదాలు", a: "స్వాగతం!" },
                    { q: "వీడ్కోలు", a: "వీడ్కోలు! మీ రోజు శుభంగా గడవాలి." }
                ]
            },
            hi: {
                welcome: "नमस्ते! टीएस टेक पार्क सहायता केंद्र में आपका स्वागत है।",
                fallback: "क्षमा करें, इस प्रश्न का सटीक उत्तर डेटाबेस में उपलब्ध नहीं है।",
                qa: [
                    { q: "नमस्ते", a: "नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ?" },
                    { q: "आप कैसे हैं", a: "मैं ठीक हूँ। आप कैसे हैं?" },
                    { q: "आपका नाम क्या है", a: "मैं एक AI सहायक हूँ।" },
                    { q: "धन्यवाद", a: "आपका स्वागत है।" },
                    { q: "अलविदा", a: "अलविदा! आपका दिन शुभ हो।" }
                ]
            }
        };
    }

    togglePanelWindow() {
        const panel = document.getElementById('chatbotWindowPanel');
        this.isOpen = !this.isOpen;
        panel.classList.toggle('hidden');
        if (this.isOpen && document.getElementById('chatbotMessageDisplayBucket').children.length === 0) {
            this.injectSystemMessage(this.dictionary[this.selectedLanguage].welcome);
        }
    }

    handleLanguageContextChange() {
        this.selectedLanguage = document.getElementById('chatLanguageSelect').value;
        const bucket = document.getElementById('chatbotMessageDisplayBucket');
        bucket.innerHTML = '';
        this.injectSystemMessage(this.dictionary[this.selectedLanguage].welcome);
    }

    dispatchUserMessage(event) {
        event.preventDefault();
        const inputEl = document.getElementById('chatMessagePayloadInput');
        const queryText = inputEl.value.trim();
        if (!queryText) return;

        this.appendMessageBubble(queryText, 'user');
        inputEl.value = '';

        // Render localized typing animation state
        this.renderTypingIndicator();

        setTimeout(() => {
            this.clearTypingIndicator();
            const reply = this.lookupResponse(queryText);
            this.appendMessageBubble(reply, 'bot');
        }, 650);
    }

    lookupResponse(rawQuery) {
        const normalized = rawQuery.toLowerCase().replace(/[?.,!]/g, '').trim();
        const langPack = this.dictionary[this.selectedLanguage];
        
        // Step A: Precise matching within selected language array
        const found = langPack.qa.find(item => normalized.includes(item.q.toLowerCase()) || item.q.toLowerCase().includes(normalized));
        if (found) return found.a;

        // Step B: Direct secondary check cross-referencing English dataset vectors
        if (this.selectedLanguage !== 'en') {
            const fallbackFound = this.dictionary.en.qa.find(item => normalized.includes(item.q) || item.q.includes(normalized));
            if (fallbackFound) return fallbackFound.a;
        }

        return langPack.fallback;
    }

    appendMessageBubble(text, sender) {
        const bucket = document.getElementById('chatbotMessageDisplayBucket');
        const wrap = document.createElement('div');
        wrap.className = `cmr ${sender === 'user' ? 'user' : ''}`;
        wrap.innerHTML = `
            <div class="msg-bubble ${sender === 'user' ? 'user-bub' : 'bot-bub'}">
                ${text}
            </div>
        `;
        bucket.appendChild(wrap);
        bucket.scrollTop = bucket.scrollHeight;
    }

    injectSystemMessage(text) {
        this.appendMessageBubble(text, 'bot');
    }

    renderTypingIndicator() {
        const bucket = document.getElementById('chatbotMessageDisplayBucket');
        const indicator = document.createElement('div');
        indicator.id = 'chatBotTypingIndicatorNode';
        indicator.className = 'cmr';
        indicator.innerHTML = `<div class="msg-bubble bot-bub" style="padding:6px 12px; color:var(--text2); font-style:italic;"><i class="fas fa-ellipsis-h fa-pulse"></i> processing tokens...</div>`;
        bucket.appendChild(indicator);
        bucket.scrollTop = bucket.scrollHeight;
    }

    clearTypingIndicator() {
        document.getElementById('chatBotTypingIndicatorNode')?.remove();
    }
}

const chatbot = new MultilingualChatbot();
