/* ════════════════════════════════════════════════════════
   TS TECH PARK — LMS
   Standalone script.js (extracted from the enhanced HTML)
   To use: remove the inline <script>...</script> block from the
   HTML file and add this line right before </body> instead:
   <script src="script.js"></script>
   ════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════
   STATE
   ════════════════════════════════════════════════════════ */
const S = {
  loggedIn:false, user:null, wishlist:new Set(), sortMode:'popular',
  enrolledCourses:[], notes:[], forumPosts:[], chatOpen:false, notifOpen:false,
  chatLang:'en', chatWarnings:0, adminPage:1, adminFilter:'', adminRole:'',
  forumTab:'all', adminAuthed:false, pendingOtp:null, pendingSignup:null
};
const BANNER_COLORS = ['#0e7490','#4338ca','#0f766e','#b91c1c','#7c2d92','#15803d','#9a3412','#1d4ed8'];
function bannerColor(seed){ let h=0; for(let i=0;i<seed.length;i++) h=(h*31+seed.charCodeAt(i))>>>0; return BANNER_COLORS[h%BANNER_COLORS.length]; }

/* ════════════════════════════════════════════════════════
   COURSE DATA  (text banner instead of emoji thumbnails)
   ════════════════════════════════════════════════════════ */
const COURSES=[
 {id:1,title:'Programming in Java',cat:'Computer Science / IT',price:18000,hrs:60,level:'Beginner',desc:'OOP, collections, generics, multithreading, JDBC and Spring Boot for backend development.',rating:4.8,students:2100,badge:'hot',videos:[{title:'Java Basics & JVM',yt:'hBh_CC5y8-s'},{title:'OOP Concepts',yt:'pTB0EiLXUC8'},{title:'Collections',yt:'_JLogEX58NI'}],curriculum:['Java Syntax & JVM','OOP Principles','Data Structures','Exception Handling','File I/O','Multithreading','JDBC & Databases','Spring Boot','Project: REST API']},
 {id:2,title:'Data Structures & Algorithms',cat:'Computer Science / IT',price:15000,hrs:50,level:'Intermediate',desc:'Arrays, linked lists, trees, graphs, sorting and problem-solving for interviews and competitive coding.',rating:4.9,students:3200,badge:'',videos:[{title:'Arrays & Complexity',yt:'CBYHwZcbD-s'},{title:'Linked Lists',yt:'WwfhLC16bis'},{title:'Binary Trees',yt:'oSWTXtMglKE'}],curriculum:['Big O Notation','Arrays & Strings','Linked Lists','Stacks & Queues','Trees & Heaps','Graphs BFS/DFS','Dynamic Programming','Sorting Algorithms','Interview Prep']},
 {id:3,title:'Database Management Systems',cat:'Computer Science / IT',price:12000,hrs:40,level:'Beginner',desc:'SQL, normalization, indexing, transactions, stored procedures and NoSQL fundamentals.',rating:4.8,students:2800,badge:'',videos:[{title:'SQL Fundamentals',yt:'HXV3zeQKqGY'},{title:'Joins & Subqueries',yt:'9yeOJ0ZMUYw'},{title:'Database Design',yt:'ztHopE5Wnpc'}],curriculum:['Relational Model','SQL Basics','Advanced Joins','Normalization','Indexing','Transactions & ACID','Stored Procedures','NoSQL Intro','Project: Library System']},
 {id:6,title:'Machine Learning',cat:'Data Science & AI',price:40000,hrs:80,level:'Intermediate',desc:'Supervised, unsupervised learning, neural networks, model evaluation and deployment.',rating:4.9,students:2100,badge:'hot',videos:[{title:'ML Introduction',yt:'NWONeJKn6kc'},{title:'Linear Regression',yt:'nk2CQITm_eo'},{title:'Neural Networks',yt:'aircAruvnKk'}],curriculum:['Python for ML','Regression','Classification','Clustering','Decision Trees','Neural Networks','Model Evaluation','Feature Engineering','MLflow']},
 {id:7,title:'Artificial Intelligence',cat:'Data Science & AI',price:45000,hrs:90,level:'Advanced',desc:'AI fundamentals, search algorithms, NLP, computer vision and AI ethics.',rating:4.8,students:980,badge:'new',videos:[{title:'AI Overview',yt:'a0_lo_GDcFw'},{title:'Search Algorithms',yt:'ySN5Wnu88nE'},{title:'NLP Basics',yt:'CMrHM8a3hqw'}],curriculum:['AI History','Search & Heuristics','Knowledge Representation','Planning','NLP','Computer Vision','Reinforcement Learning','AI Ethics','Capstone']},
 {id:23,title:'Python for Data Science',cat:'Data Science & AI',price:35000,hrs:75,level:'Intermediate',desc:'NumPy, Pandas, Matplotlib, Scikit-learn, feature engineering and deployment.',rating:4.9,students:3800,badge:'',videos:[{title:'Python Crash',yt:'kqtD5dpn9C8'},{title:'Pandas & NumPy',yt:'vmEHCJofslg'},{title:'Scikit-learn',yt:'0Lt9w-BxKFQ'}],curriculum:['Python Advanced','NumPy & Pandas','Data Viz','Statistical Analysis','Scikit-learn','Feature Engineering','Model Selection','Cross-Validation','Deployment']},
 {id:8,title:'Cloud Computing',cat:'Cloud & DevOps',price:25000,hrs:50,level:'Intermediate',desc:'AWS/Azure/GCP, Docker, Kubernetes, serverless, CI/CD and infrastructure-as-code.',rating:4.7,students:1400,badge:'',videos:[{title:'Cloud Fundamentals',yt:'M988_fsOSWo'},{title:'AWS Core',yt:'a9__D53WsGs'},{title:'Docker Basics',yt:'3c-iBn73dDE'}],curriculum:['Cloud Models','AWS Core','Azure','GCP Overview','Docker','Kubernetes','Serverless','Terraform','CI/CD']},
 {id:9,title:'Cybersecurity',cat:'Cybersecurity',price:32000,hrs:65,level:'Intermediate',desc:'Penetration testing, vulnerability assessment, OWASP Top 10, network security, CTF.',rating:4.8,students:900,badge:'hot',videos:[{title:'Security Fundamentals',yt:'rcDO8km6R6c'},{title:'Ethical Hacking',yt:'3Kq1MIfTWCE'},{title:'Web App Security',yt:'jmgsgjPn_vs'}],curriculum:['Security Basics','Network Security','Linux for Hackers','Metasploit','Web App Pentesting','OWASP','Forensics','CTF','Bug Bounty']},
 {id:10,title:'Web Development',cat:'Web Development',price:20000,hrs:60,level:'Beginner',desc:'HTML5, CSS3, JavaScript, React, Node.js, MongoDB — full-stack from scratch to deployment.',rating:4.7,students:3500,badge:'',videos:[{title:'HTML & CSS Crash',yt:'mU6anWqZJcc'},{title:'JavaScript Basics',yt:'W6NZfCO5SIk'},{title:'React Beginner',yt:'Ke90Tje7VS0'}],curriculum:['HTML5 & CSS3','JavaScript ES6+','React JS','Node.js','Express','MongoDB','REST APIs','Auth JWT','Deploy Vercel']},
 {id:11,title:'Embedded C Programming',cat:'Embedded Systems & IoT',price:22000,hrs:55,level:'Beginner',desc:'Memory-mapped I/O, bit manipulation, pointers, interrupt handling and bare-metal C.',rating:4.9,students:1800,badge:'hot',videos:[{title:'Embedded C Intro',yt:'vDlzmFTxBCk'},{title:'Bit Manipulation',yt:'lnlbkpnlE58'},{title:'Pointers in C',yt:'zuegQmMdy8M'}],curriculum:['C Refresher','Memory Layout','Bit Operations','Pointers','Structures','Interrupt Handling','UART','Timer','Project: Digital Clock']},
 {id:14,title:'RTOS',cat:'Embedded Systems & IoT',price:30000,hrs:65,level:'Intermediate',desc:'FreeRTOS, Zephyr — tasks, scheduling, semaphores, queues, mutexes and real-time debugging.',rating:4.9,students:1000,badge:'hot',videos:[{title:'RTOS Concepts',yt:'F321087yYy4'},{title:'FreeRTOS Tasks',yt:'kP_zHbC_5eM'},{title:'Semaphores',yt:'5JcMtbA9QEE'}],curriculum:['RTOS Concepts','Task Management','Scheduling','Semaphores','Mutexes & Deadlocks','Message Queues','Event Groups','Memory','Project: Robot Controller']},
 {id:15,title:'IoT Development',cat:'Embedded Systems & IoT',price:28000,hrs:60,level:'Intermediate',desc:'ESP32, MQTT, cloud connectivity, sensor fusion, edge processing and industrial IoT.',rating:4.7,students:1300,badge:'',videos:[{title:'IoT Introduction',yt:'h0gWfVCSGQQ'},{title:'ESP32 Programming',yt:'xPlN_Tk3VLQ'},{title:'MQTT Protocol',yt:'EIxdz-2rhLs'}],curriculum:['IoT Architecture','ESP32 & Arduino','MQTT & CoAP','AWS IoT','Sensor Fusion','Edge Processing','Industrial IoT','Security','Capstone: Smart Home']},
 {id:18,title:'VLSI Design',cat:'Electronics',price:50000,hrs:100,level:'Advanced',desc:'RTL design, SystemVerilog, UVM verification, FPGA implementation and timing analysis.',rating:4.7,students:320,badge:'',videos:[{title:'Digital Design',yt:'M0mx8S05v60'},{title:'Verilog HDL',yt:'PJGvZSlsLKs'},{title:'FPGA Intro',yt:'lLg1AgA2Xoo'}],curriculum:['Digital Logic','Verilog HDL','SystemVerilog','UVM','FPGA','Timing Analysis','DFT','Physical Design','Tapeout']},
 {id:22,title:'Digital Electronics',cat:'Electronics',price:10000,hrs:30,level:'Beginner',desc:'Logic gates, combinational circuits, sequential circuits, FPGAs and simulation.',rating:4.6,students:2200,badge:'',videos:[{title:'Logic Gates',yt:'M0mx8S05v60'},{title:'Combinational Logic',yt:'hdKOWXSfJSk'},{title:'Sequential Circuits',yt:'HQ_5cTTYFtA'}],curriculum:['Number Systems','Logic Gates','Boolean Algebra','Combinational Circuits','Flip-Flops','Counters','ADC/DAC','State Machines','Sim Lab']},
 {id:20,title:'Automotive Embedded Systems',cat:'Automotive',price:60000,hrs:130,level:'Advanced',desc:'AUTOSAR, CAN/LIN/Ethernet, functional safety ISO 26262 and MISRA C for automotive engineers.',rating:4.8,students:890,badge:'hot',videos:[{title:'CAN Bus Protocol',yt:'9IjTbBTdKrM'},{title:'AUTOSAR Overview',yt:'6jDCBJsQEoA'},{title:'ISO 26262',yt:'pJfq0y8TDUE'}],curriculum:['AUTOSAR Architecture','CAN FD','LIN Bus','Automotive Ethernet','ISO 26262','UDS Diagnostics','MISRA C','Bootloaders','Project: ABS Controller']},
 {id:21,title:'Edge AI & Deep Learning',cat:'Data Science & AI',price:70000,hrs:100,level:'Advanced',desc:'TFLite, ONNX, OpenVINO, NVIDIA Jetson and real-time neural network inference.',rating:4.7,students:650,badge:'new',videos:[{title:'Neural Networks',yt:'aircAruvnKk'},{title:'TF Lite',yt:'d_-3bj1OAIU'},{title:'Jetson Setup',yt:'vbRFVLzpbFU'}],curriculum:['Deep Learning Basics','CNNs & RNNs','Quantization','TF Lite','ONNX Runtime','OpenVINO','Jetson Nano','TensorRT','Object Detection']},
 {id:24,title:'React JS & Modern Frontend',cat:'Web Development',price:18000,hrs:45,level:'Intermediate',desc:'Hooks, Redux Toolkit, TypeScript, React Query, testing and performance.',rating:4.9,students:1800,badge:'',videos:[{title:'React Fundamentals',yt:'Ke90Tje7VS0'},{title:'Hooks Deep Dive',yt:'9KJxaFHotqI'},{title:'TypeScript React',yt:'ydkQlJoDSKM'}],curriculum:['React Fundamentals','Hooks','State Management','Redux Toolkit','TypeScript','React Query','Testing','Performance','Deploy Vercel']},
];
COURSES.forEach(c=>{ c.bg = bannerColor(c.cat); });

/* ════════════════════════════════════════════════════════
   QUIZ BANK
   ════════════════════════════════════════════════════════ */
const QB={
 'Embedded Systems':[
  {q:'What does RTOS stand for?',o:['Real-Time Operating System','Remote Terminal OS','Rapid Task OS','Real-Time Object System'],a:0},
  {q:'Which protocol uses differential signaling in automotive ECUs?',o:['UART','SPI','CAN Bus','I2C'],a:2},
  {q:'Which ARM Cortex series targets microcontrollers?',o:['Cortex-A','Cortex-R','Cortex-M','Cortex-X'],a:2},
  {q:'Max data rate of CAN FD?',o:['1 Mbps','4 Mbps','8 Mbps','10 Mbps'],a:2},
  {q:'FreeRTOS function to suspend a task?',o:['vTaskDelete','vTaskSuspend','vTaskDelay','taskYIELD'],a:1},
  {q:'ISO 26262 covers which domain?',o:['Software Quality','Functional Safety E/E Systems','Network Security','Embedded Debugging'],a:1},
 ],
 'Computer Science':[
  {q:'Which data structure uses LIFO order?',o:['Queue','Stack','Linked List','Tree'],a:1},
  {q:'Time complexity of binary search?',o:['O(n)','O(n²)','O(log n)','O(n log n)'],a:2},
  {q:'What does SQL stand for?',o:['Structured Query Language','Sequential Query Logic','Simple Query Language','Standard Query Logic'],a:0},
  {q:'HTTP method to update a resource?',o:['GET','POST','PUT','DELETE'],a:2},
  {q:'Merge Sort average case complexity?',o:['O(n)','O(n log n)','O(n²)','O(log n)'],a:1},
 ],
 'AI & Data Science':[
  {q:'Algorithm for classification in supervised learning?',o:['K-Means','DBSCAN','Random Forest','PCA'],a:2},
  {q:'What is overfitting?',o:['Good on all data','Learns noise from training','Underfits patterns','High bias'],a:1},
  {q:'Activation function outputting 0 to 1?',o:['ReLU','Tanh','Sigmoid','Softmax'],a:2},
  {q:'CNN stands for?',o:['Convolutional Neural Network','Cyclic Neural Network','Complex Number Net','Central Node Net'],a:0},
  {q:'Gradient descent minimizes?',o:['Accuracy','Loss function','Precision','Recall'],a:1},
 ],
 'Electronics':[
  {q:'Unit of electrical resistance?',o:['Volt','Ampere','Ohm','Watt'],a:2},
  {q:'ADC stands for?',o:['Analog to Digital Converter','Automatic Data Controller','Advanced Digital Circuit','Async Data Clock'],a:0},
  {q:'Universal logic gate?',o:['AND','OR','NAND','XOR'],a:2},
  {q:'VLSI stands for?',o:['Very Large Scale Integration','Variable Logic Signal Interface','Virtual Layer System','Voltage Level Signal'],a:0},
  {q:'Binary 1010 in decimal?',o:['8','10','12','14'],a:1},
 ],
};

/* ════════════════════════════════════════════════════════
   CHATBOT FAQ DATA  (multilingual + casual conversation set)
   ════════════════════════════════════════════════════════ */
const FAQ={
 en:{
  welcome:`Hi! I'm <strong>TechBot</strong>, your AI tutor at TS Tech Park!<br><br>Ask me about courses, fees, payment modes, batches, technical concepts, or career guidance.<br><br>I speak <strong>English, Tamil, Hindi &amp; Telugu</strong> — choose your language above!`,
  faq:{
   'can bus':'<strong>CAN (Controller Area Network)</strong> is a Bosch protocol for automotive ECU communication.<br>• Multi-master broadcast • Up to 8 Mbps (CAN FD) • Differential signaling • CRC error detection<br><br>Covered in our <strong>Automotive Embedded Systems</strong> course.',
   'rtos':'<strong>RTOS (Real-Time Operating System)</strong> guarantees task execution within strict deadlines.<br>• Preemptive priority scheduling • Mutexes, semaphores, queues • FreeRTOS, Zephyr, VxWorks<br><br>Learn in our <strong>RTOS course</strong> with hands-on labs!',
   'autosar':'<strong>AUTOSAR</strong> (AUTomotive Open System ARchitecture) standardizes ECU software.<br>Layers: BSW → RTE → SWC<br>• Classic AUTOSAR for safety ECUs • Adaptive AUTOSAR for ADAS<br><br>Covered in <strong>Automotive Embedded Systems</strong>.',
   'iso26262':'<strong>ISO 26262</strong> is the functional safety standard for automotive E/E systems.<br>• ASIL levels A–D • Hazard Analysis & Risk Assessment (HARA)<br><br>Part of our <strong>Automotive Embedded</strong> curriculum.',
   'fee':'<strong>TS Tech Park Course Fees:</strong><br>• Digital Electronics: ₹10,000<br>• Java/Python: ₹12,000–₹18,000<br>• Web Dev/Cloud: ₹18,000–₹28,000<br>• ML/AI/Data Science: ₹35,000–₹70,000<br>• Embedded/Automotive: ₹22,000–₹60,000<br><br>We accept <strong>UPI, Online (Card/Net Banking) and Cash</strong> at our centre.',
   'payment':'<strong>Payment Modes Accepted:</strong><br>• UPI (GPay, PhonePe, Paytm)<br>• Online — Debit/Credit Card, Net Banking<br>• Cash at the TS Tech Park office<br><br>Your full payment history with date, time and amount is visible under <strong>Dashboard → Payments &amp; History</strong>.',
   'batch':'<strong>Upcoming Batches:</strong><br>• Automotive Embedded — July 1, 2026<br>• Edge AI — July 8, 2026<br>• RTOS with FreeRTOS — July 15, 2026<br>• Python for Data Science — July 5, 2026<br><br>Early bird discount available on enrollment!',
   'certificate':'TS Tech Park certificates are:<br>• QR-verified<br>• Recognised by 200+ hiring partners<br>• LinkedIn-shareable<br>• Issued the moment you complete a course — visible under Dashboard → Certificates.',
   'career':'<strong>Tech Career Paths:</strong><br>• Embedded: ₹3–30 LPA (Bosch, KPIT, Aptiv)<br>• AI/ML: ₹6–35 LPA (Google, Qualcomm)<br>• Full Stack: ₹4–25 LPA<br>• VLSI: ₹5–40 LPA<br><br>Our placement rate: <strong>98%</strong>!',
   'placement':'• 98% placement rate<br>• 200+ hiring partners<br>• Average: ₹6–8 LPA<br>• Resume prep, mock interviews &amp; direct referrals included!',
   'contact':'• info@tstechpark.com<br>• +91 98765 43210<br>• No. 42, Tech Park Road, Chennai – 600032<br>• Mon–Sat: 9 AM – 7 PM',
   'recommend':'<strong>Top Recommendations:</strong><br>• Automotive Embedded — ₹60,000, 98% placement<br>• Edge AI — ₹70,000, cutting-edge<br>• RTOS — ₹30,000, high demand<br>• Python Data Science — ₹35,000, most enrolled',
   'hello':'Hello! I\'m <strong>TechBot</strong>! Ask me about courses, fees, batches, technical concepts, or career paths. How can I help?',
   'how are you':'I\'m doing well, thank you! How are you doing today?',
   'your name':'I am TechBot, the AI assistant for TS Tech Park.',
   'good morning':'Good morning! Hope you have a great day of learning ahead.',
   'good night':'Good night! Sleep well — see you for class tomorrow.',
   'thank':'You\'re welcome! Keep learning, I\'m here anytime.',
   'bye':'Goodbye! Have a great day.',
   'what can you do':'I can answer questions about courses, fees, payments, batches and careers, and assist with general study questions — in English, Tamil, Hindi or Telugu.',
   'who are you':'I am an AI assistant here to help you with TS Tech Park courses and queries.',
   'joke':'Why did the computer go to the doctor? Because it had a virus!',
   'bored':'Would you like to hear a joke, take a quick quiz, or learn something new about a course?',
   'sad':'I\'m sorry you\'re feeling that way. Would you like to talk about it, or take a break and come back to learning later?',
   'time':'Please check your device\'s clock for the current time.',
   'date':'Please check your device calendar for today\'s date.',
   'study plan':'<strong>Recommended Path:</strong><br>Month 1–2: Domain choice + fundamentals<br>Month 2–3: Core programming (C/Python)<br>Month 3–5: Deep domain study<br>Month 5–6: Capstone project + placement prep',
  },
  warn1:'Please keep our conversation respectful and educational. I\'m here to help you learn!',
  warn2:'Second warning: maintain a respectful tone. I can only assist with educational queries.',
  warn3:'This conversation has been flagged for inappropriate content. Please contact support for assistance.',
  fallback:'Great question! Could you be more specific? For example:<br>• "Explain RTOS task scheduling"<br>• "What payment modes do you accept?"<br>• "Upcoming batches?"<br><br>I\'m here 24/7!',
 },
 ta:{
  welcome:`வணக்கம்! நான் <strong>TechBot</strong>, TS Tech Park-ல் உங்கள் AI ஆசிரியர்!<br><br>பாடக் கட்டணம், கட்டண முறை, தொழில்நுட்பம், சேர்க்கை பற்றி கேளுங்கள்.`,
  faq:{
   'can bus':'<strong>CAN Bus</strong> என்பது Bosch நிறுவனம் உருவாக்கிய automotive ECU தொடர்பாடல் நெறிமுறை.<br>• CAN FD: 8 Mbps வரை<br><br><strong>Automotive Embedded</strong> பாடத்தில் கற்றுக்கொள்ளலாம்.',
   'fee':'<strong>பாடக் கட்டணம்:</strong><br>• Digital Electronics: ₹10,000<br>• Java/Python: ₹12,000–18,000<br>• ML/AI: ₹35,000–70,000<br><br>UPI, Online, Cash ஏற்றுக்கொள்ளப்படும்.',
   'hello':'வணக்கம்! நான் TechBot. கல்வி, கட்டணம், தொழில் பற்றி கேளுங்கள்!',
   'how are you':'நான் நன்றாக இருக்கிறேன். நீங்கள் எப்படி இருக்கிறீர்கள்?',
   'your name':'நான் ஒரு AI உதவியாளர்.',
   'good morning':'காலை வணக்கம்! உங்கள் நாள் இனிதாக அமையட்டும்.',
   'thank':'உங்களுக்கு வரவேற்பு! தொடர்ந்து கற்கவும்.',
   'bye':'சரி, மீண்டும் சந்திப்போம். நல்ல நாளாக இருக்கட்டும்.',
   'batch':'• Automotive Embedded — July 1, 2026<br>• Edge AI — July 8, 2026',
   'career':'• Embedded: ₹3–30 LPA<br>• AI/ML: ₹6–35 LPA<br><br>98% placement rate!',
  },
  warn1:'மரியாதையான உரையாடலை பேணவும். கல்வி கேள்விகளில் மட்டுமே உதவ முடியும்.',
  warn2:'இரண்டாம் எச்சரிக்கை: உரிய மொழியை பயன்படுத்தவும்.',
  warn3:'தகாத உள்ளடக்கம் கண்டறியப்பட்டது. Support ஐ தொடர்பு கொள்ளவும்.',
  fallback:'அருமையான கேள்வி! கொஞ்சம் விரிவாக கேட்கலாமா? நான் 24/7 கிடைக்கிறேன்!',
 },
 hi:{
  welcome:`नमस्ते! मैं <strong>TechBot</strong> हूं, TS Tech Park का AI शिक्षक!<br><br>कोर्स, फीस, भुगतान, बैच या तकनीकी विषयों के बारे में पूछें!`,
  faq:{
   'can bus':'<strong>CAN Bus</strong> Bosch का automotive ECU प्रोटोकॉल है।<br>• CAN FD: 8 Mbps तक<br><strong>Automotive Embedded Systems</strong> कोर्स में सीखें।',
   'fee':'<strong>कोर्स फीस:</strong><br>• Digital Electronics: ₹10,000<br>• Java/Python: ₹12,000–18,000<br>• ML/AI: ₹35,000–70,000<br><br>UPI, Online और Cash स्वीकार किया जाता है।',
   'hello':'नमस्ते! मैं TechBot हूं। कोर्स, फीस, करियर के बारे में पूछें!',
   'how are you':'मैं ठीक हूँ। आप कैसे हैं?',
   'your name':'मैं एक AI सहायक हूँ।',
   'thank':'आपका स्वागत है। पढ़ते रहें!',
   'bye':'अलविदा! आपका दिन शुभ हो।',
   'career':'• Embedded: ₹3–30 LPA<br>• AI/ML: ₹6–35 LPA<br><br>Placement rate: 98%!',
   'batch':'• Automotive Embedded — 1 जुलाई 2026<br>• Edge AI — 8 जुलाई 2026',
  },
  warn1:'कृपया सम्मानजनक बातचीत बनाए रखें।',
  warn2:'दूसरी चेतावनी: उचित भाषा का उपयोग करें।',
  warn3:'अनुचित सामग्री का पता चला। Support से संपर्क करें।',
  fallback:'अच्छा सवाल! थोड़ा विस्तार से बताएं? मैं 24/7 उपलब्ध हूं!',
 },
 te:{
  welcome:`నమస్కారం! నేను <strong>TechBot</strong>, TS Tech Park AI ట్యూటర్!<br><br>కోర్సులు, ఫీజులు, చెల్లింపు, బ్యాచ్‌లు గురించి అడగండి!`,
  faq:{
   'hello':'నమస్కారం! నేను TechBot. కోర్సులు, ఫీజులు, కెరీర్ గురించి అడగండి!',
   'fee':'<strong>కోర్సు ఫీజులు:</strong><br>• Digital Electronics: ₹10,000<br>• Java/Python: ₹12,000–18,000<br>• ML/AI: ₹35,000–70,000<br><br>UPI, Online, Cash ఆమోదించబడతాయి.',
   'how are you':'నేను బాగున్నాను. మీరు ఎలా ఉన్నారు?',
   'your name':'నేను ఒక AI సహాయకుడిని.',
   'thank':'స్వాగతం! నేర్చుకోవడం కొనసాగించండి!',
   'career':'• Embedded: ₹3–30 LPA<br>• AI/ML: ₹6–35 LPA<br><br>Placement: 98%!',
  },
  warn1:'దయచేసి గౌరవప్రదమైన సంభాషణ నిర్వహించండి.',
  warn2:'రెండవ హెచ్చరిక: సముచిత భాష ఉపయోగించండి.',
  warn3:'అనుచితమైన కంటెంట్ గుర్తించబడింది.',
  fallback:'మంచి ప్రశ్న! నేను 24/7 అందుబాటులో ఉన్నాను!',
 },
};
const BAD=['stupid','idiot','fool','dumb','hate','kill','shutup','fuck','shit','bastard','bitch','die','suck','moron','crap','useless','ugly','racist'];

/* ════════════════════════════════════════════════════════
   SEED FORUM / LIVE / ADMIN DATA  (not user-specific progress)
   ════════════════════════════════════════════════════════ */
const SEEDS=[
 {id:1001,user:'Priya M',av:'PM',color:'#6366f1',time:'2 hrs ago',cat:'Question',catColor:'#ef4444',title:'CAN bus vs LIN bus — when to choose?',text:'Working on dashboard ECU, confused about which protocol for body ECUs. Any advice?',likes:23,replies:8,tags:['CAN','LIN','Automotive'],type:'questions'},
 {id:1002,user:'Arjun V',av:'AV',color:'#0e7490',time:'4 hrs ago',cat:'Project',catColor:'#15803d',title:'Built lane detection with Edge AI on Jetson Nano!',text:'YOLOv8 + TensorRT on Jetson Nano for 30fps lane detection. Happy to share code!',likes:87,replies:24,tags:['Edge AI','Jetson','YOLO'],type:'projects'},
 {id:1004,user:'TS Tech Park',av:'TS',color:'#ef4444',time:'1 day ago',cat:'Announcement',catColor:'#0e7490',title:'New Batch: Automotive Embedded — July 2026',text:'Applications open for the July 1st batch. Limited seats. Early bird discount available!',likes:142,replies:35,tags:['Announcement','Batch'],type:'announcements'},
 {id:1005,user:'Karthik V',av:'KV',color:'#15803d',time:'2 days ago',cat:'Project',catColor:'#15803d',title:'Smart home with ESP32 + AWS IoT',text:'12 sensors on ESP32 with FreeRTOS tasks, publishing to AWS IoT via MQTT.',likes:64,replies:18,tags:['ESP32','AWS','IoT'],type:'projects'},
];
const LIVE_DATA={
 live:[{title:'Edge AI: Neural Network Quantization',instructor:'Dr. Vijay R.',time:'LIVE NOW',attendees:142,link:''}],
 upcoming:[
  {title:'Automotive CAN FD — Advanced',instructor:'Mr. Suresh K.',time:'Tomorrow 10 AM',attendees:89,link:''},
  {title:'Python for Embedded Engineers',instructor:'Ms. Priya N.',time:'Tomorrow 3 PM',attendees:203,link:''},
  {title:'RTOS Deep Dive: FreeRTOS Tasks',instructor:'Mr. Karthik V.',time:'Thu 11 AM',attendees:67,link:''},
 ],
 recordings:[
  {title:'AUTOSAR Architecture Introduction',instructor:'Dr. Vijay R.',time:'Jun 5, 2026',duration:'2h 14m'},
  {title:'Python ML: Scikit-learn Deep Dive',instructor:'Ms. Priya N.',time:'Jun 3, 2026',duration:'1h 48m'},
 ],
};

/* ════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  S.forumPosts=[...SEEDS];
  document.getElementById('statCourses').textContent=COURSES.length;
  document.getElementById('snapCourses').textContent=COURSES.length;
  const totalStudents=COURSES.reduce((s,c)=>s+c.students,0);
  document.getElementById('statStudents').textContent=Math.round(totalStudents/1000)+'K+';
  renderCourses(COURSES);
  renderForum();
  renderLive('live');
  renderNotifications();
  chatWelcome();
  loadStorage();
});

function loadStorage(){
  const u=localStorage.getItem('ts_user');
  if(u){ S.user=JSON.parse(u); S.loggedIn=true; afterLogin(); }
  const e=localStorage.getItem('ts_enrolled_'+(S.user?S.user.email:''));
  if(e) S.enrolledCourses=JSON.parse(e);
}
function saveEnrolled(){ if(S.user) localStorage.setItem('ts_enrolled_'+S.user.email,JSON.stringify(S.enrolledCourses)); }
function getAccounts(){ return JSON.parse(localStorage.getItem('ts_accounts')||'[]'); }
function saveAccounts(a){ localStorage.setItem('ts_accounts',JSON.stringify(a)); }
function getPayments(){ return JSON.parse(localStorage.getItem('ts_payments')||'[]'); }
function savePayments(p){ localStorage.setItem('ts_payments',JSON.stringify(p)); }

/* ════════════════════════════════════════════════════════
   THEME
   ════════════════════════════════════════════════════════ */
function toggleTheme(){
  const isDark=document.documentElement.dataset.theme==='dark';
  document.documentElement.dataset.theme=isDark?'light':'dark';
  document.getElementById('themeIcon').className=isDark?'fas fa-moon':'fas fa-sun';
  showToast(isDark?'Light mode on':'Dark mode on','info');
}

/* ════════════════════════════════════════════════════════
   PAGE NAV
   ════════════════════════════════════════════════════════ */
function showPage(n){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg=document.getElementById('page-'+n);
  if(pg) pg.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.toggle('active', l.textContent.trim().toLowerCase().startsWith(n.toLowerCase())));
  S.currentPage=n;
  window.scrollTo(0,0);
  if(n==='dashboard'){ if(!S.loggedIn){ openAuth('login'); return; } renderOverview(); }
  if(n==='profile'){ if(!S.loggedIn){ openAuth('login'); return; } renderProfilePage(); }
}
function goAdmin(){
  showPage('admin');
  document.getElementById('adminGateView').style.display = S.adminAuthed?'none':'block';
  document.getElementById('adminDashView').style.display = S.adminAuthed?'block':'none';
  if(S.adminAuthed) renderAdminDashboard();
}
function toggleMob(){ document.getElementById('mobMenu').classList.toggle('open'); document.getElementById('mobOverlay').classList.toggle('open'); }
function closeMob(){ document.getElementById('mobMenu').classList.remove('open'); document.getElementById('mobOverlay').classList.remove('open'); }
function setMbn(el){ document.querySelectorAll('.mbnav-btn').forEach(b=>b.classList.remove('active')); el.classList.add('active'); }

/* ════════════════════════════════════════════════════════
   NOTIFICATIONS
   ════════════════════════════════════════════════════════ */
function renderNotifications(){
  const p=document.getElementById('notifPanel');
  const items=[
   {icon:'fa-robot',cls:'ni-p',title:'AI Quiz Ready',body:'A new quiz has been generated for you',time:'2 min ago',unread:true},
   {icon:'fa-certificate',cls:'ni-g',title:'Certificate System Live',body:'Complete a course to earn your first certificate',time:'1 hr ago',unread:true},
   {icon:'fa-video',cls:'ni-b',title:'Live Class Today',body:'Check the Live page for today\'s sessions',time:'25 min ago',unread:false},
   {icon:'fa-trophy',cls:'ni-y',title:'Gamification Enabled',body:'Earn XP and badges as you learn',time:'3 hr ago',unread:false},
  ];
  p.innerHTML=`<div class="ni-hdr"><span style="font-weight:700;font-size:13px">Notifications</span><span style="font-size:11px;color:var(--accent);cursor:pointer" onclick="markAllRead()">Mark all read</span></div>
  ${items.map(n=>`<div class="notif-item ${n.unread?'unread':''}"><div class="ni-ico ${n.cls}"><i class="fas ${n.icon}"></i></div><div><div style="font-size:12px;font-weight:700">${n.title}</div><div style="font-size:11px;color:var(--text2)">${n.body}</div><div style="font-size:10px;color:var(--text2)">${n.time}</div></div></div>`).join('')}`;
}
function markAllRead(){ document.querySelectorAll('.notif-item.unread').forEach(i=>i.classList.remove('unread')); document.getElementById('notifBadge').style.display='none'; showToast('All read','success'); }
function toggleNotif(){ S.notifOpen=!S.notifOpen; document.getElementById('notifPanel').classList.toggle('open',S.notifOpen); }
document.addEventListener('click',e=>{ if(S.notifOpen && !e.target.closest('#notifPanel') && !e.target.closest('#notifBtn')){ S.notifOpen=false; document.getElementById('notifPanel').classList.remove('open'); } });

/* ════════════════════════════════════════════════════════
   AUTH  (login / signup / email verification)
   ════════════════════════════════════════════════════════ */
function openAuth(tab){ document.getElementById('authModal').classList.add('active'); document.getElementById('authMainView').style.display='block'; document.getElementById('authVerifyView').style.display='none'; switchAuth(tab); }
function switchAuth(tab){
  document.getElementById('loginForm').style.display = tab==='login'?'block':'none';
  document.getElementById('signupForm').style.display = tab==='signup'?'block':'none';
  document.getElementById('loginTab').classList.toggle('active', tab==='login');
  document.getElementById('signupTab').classList.toggle('active', tab==='signup');
}
function setRole(btn){ btn.closest('.role-sel').querySelectorAll('.role-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }
function togglePw(id,btn){ const i=document.getElementById(id); const isPw=i.type==='password'; i.type=isPw?'text':'password'; btn.innerHTML=isPw?'<i class="fas fa-eye-slash"></i>':'<i class="fas fa-eye"></i>'; }
function chkPw(v){ const el=document.getElementById('pwStr'); if(!el)return; if(!v){el.className='pw-str';return;} if(v.length<6){el.className='pw-str weak';return;} if(v.length<10||!/[0-9]/.test(v)){el.className='pw-str medium';return;} el.className='pw-str strong'; }

function doLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPass').value;
  if(!email||!pass){ showToast('Please fill all fields','error'); return; }
  const accounts=getAccounts();
  const found=accounts.find(a=>a.email.toLowerCase()===email.toLowerCase());
  if(!found){ showToast('No account found. Please sign up first.','error'); return; }
  if(found.pass!==pass){ showToast('Incorrect password','error'); return; }
  if(found.status==='suspended'){ showToast('This account has been suspended by the administrator.','error'); return; }
  if(found.role==='Instructor' && found.status==='pending'){ showToast('Your instructor account is awaiting admin approval.','warning'); return; }
  if(!found.verified){ showToast('Please verify your email before logging in.','warning'); startSignupVerification(found,true); return; }
  finishLogin(found);
}
function doSignup(){
  const fname=document.getElementById('regFname').value.trim();
  const lname=document.getElementById('regLname').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const phone=document.getElementById('regPhone').value.trim();
  const city=document.getElementById('regCity').value.trim();
  const pass=document.getElementById('regPass').value;
  const pass2=document.getElementById('regPass2').value;
  const role=document.querySelector('#signupForm .role-btn.active')?.dataset.role || 'Student';
  if(!fname||!email||!phone||!pass){ showToast('Fill all required fields','error'); return; }
  if(!/^\S+@\S+\.\S+$/.test(email)){ showToast('Enter a valid email address','error'); return; }
  if(pass!==pass2){ showToast('Passwords do not match','error'); return; }
  if(pass.length<6){ showToast('Password must be at least 6 characters','error'); return; }
  const accounts=getAccounts();
  if(accounts.some(a=>a.email.toLowerCase()===email.toLowerCase())){ showToast('An account with this email already exists','error'); return; }
  const user={
   firstName:fname, lastName:lname, email, phone, city,
   role, status: role==='Instructor' ? 'pending' : 'active',
   verified:false,
   joinedDate:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),
   xp:0, streak:1, hoursLearned:0, certificates:0, enrolledCount:0,
   pass
  };
  startSignupVerification(user,false);
}
/* Email verification — simulated. In production, replace generateAndShowOtp()
   with a real call, e.g. Supabase: supabase.auth.signUp({email,password})
   (Supabase auto-emails a confirmation/OTP link), or a free service like
   EmailJS / Web3Forms to send a one-time code from your own SMTP. */
function startSignupVerification(user, isExistingUnverified){
  S.pendingSignup={user, isExistingUnverified};
  const code=String(Math.floor(100000+Math.random()*900000));
  S.pendingOtp=code;
  document.getElementById('authMainView').style.display='none';
  document.getElementById('authVerifyView').style.display='block';
  document.getElementById('verifyEmailLbl').textContent=user.email;
  document.querySelectorAll('#authVerifyView .otp-box').forEach(b=>b.value='');
  document.querySelectorAll('#authVerifyView .otp-box')[0]?.focus();
  showToast(`Verification code sent to ${user.email}: ${code} (simulated)`,'info');
}
function resendSignupOtp(){
  if(!S.pendingSignup) return;
  const code=String(Math.floor(100000+Math.random()*900000));
  S.pendingOtp=code;
  showToast(`New code sent: ${code} (simulated)`,'info');
}
function verifySignupOtp(){
  const boxes=document.querySelectorAll('#authVerifyView .otp-box');
  const entered=Array.from(boxes).map(b=>b.value).join('');
  if(entered.length<6){ showToast('Enter the full 6-digit code','error'); return; }
  if(entered!==S.pendingOtp){ showToast('Incorrect code, please try again','error'); return; }
  const {user, isExistingUnverified}=S.pendingSignup;
  user.verified=true;
  let accounts=getAccounts();
  if(isExistingUnverified){
   accounts=accounts.map(a=>a.email===user.email?user:a);
  } else {
   accounts.push(user);
  }
  saveAccounts(accounts);
  closeModal('authModal');
  showToast('Email verified! Account created successfully.','success');
  if(user.role==='Instructor' && user.status==='pending'){
   showToast('Your instructor account is now pending admin approval before you can log in.','warning');
  } else {
   finishLogin(user);
  }
  S.pendingSignup=null; S.pendingOtp=null;
}
function otpNext(el){
  el.value=el.value.replace(/[^0-9]/g,'').slice(0,1);
  if(el.value && el.nextElementSibling && el.nextElementSibling.classList.contains('otp-box')) el.nextElementSibling.focus();
}
function finishLogin(user){
  S.user=user; S.loggedIn=true;
  localStorage.setItem('ts_user',JSON.stringify(user));
  closeModal('authModal');
  afterLogin();
  showPage('dashboard');
  showToast(`Welcome, ${user.firstName}!`,'success');
}
function afterLogin(){
  const u=S.user; const init=getInit(u);
  document.getElementById('userAvBtn').style.display='flex';
  document.getElementById('userAvInit').textContent=init;
  document.getElementById('guestButtons').style.display='none';
  document.getElementById('sbAv').textContent=init;
  document.getElementById('sbName').textContent=getDisplayName(u);
  document.getElementById('sbRoleLbl').textContent=u.role||'Student';
  const e=localStorage.getItem('ts_enrolled_'+u.email);
  S.enrolledCourses = e ? JSON.parse(e) : [];
  document.getElementById('enrolledBadge').textContent=S.enrolledCourses.length;
}
function doLogout(){
  S.loggedIn=false; S.user=null; S.enrolledCourses=[];
  localStorage.removeItem('ts_user');
  document.getElementById('userAvBtn').style.display='none';
  document.getElementById('guestButtons').style.display='flex';
  document.getElementById('sbAv').textContent='?';
  document.getElementById('sbName').textContent='Guest';
  document.getElementById('sbRoleLbl').textContent='Student';
  showPage('home');
  showToast('Logged out','info');
}
function getInit(u){ if(!u) return '?'; return ((u.firstName||'').charAt(0)+(u.lastName||'').charAt(0)).toUpperCase() || (u.email||'?').charAt(0).toUpperCase(); }
function getDisplayName(u){ if(!u) return 'Guest'; return [u.firstName,u.lastName].filter(Boolean).join(' ').trim() || u.email || 'User'; }
function handleOverlay(e,id){ if(e.target===e.currentTarget) closeModal(id); }
function closeModal(id){ document.getElementById(id).classList.remove('active'); }

/* ════════════════════════════════════════════════════════
   COURSE THUMBNAIL  (text banner template, no emoji)
   ════════════════════════════════════════════════════════ */
function courseBanner(c, h){
  return `<div class="cc-thumb" style="height:${h}px;background:linear-gradient(135deg,${c.bg},${c.bg}cc)">
    <div class="cc-thumb-title">${c.title}</div>
    <div class="cc-thumb-by">BY TS TECH PARK</div>
  </div>`;
}

/* ════════════════════════════════════════════════════════
   COURSES PAGE
   ════════════════════════════════════════════════════════ */
function renderCourses(data){
  const grid=document.getElementById('coursesGrid');
  const res=document.getElementById('coursesRes');
  if(res) res.textContent=`Showing ${data.length} course${data.length!==1?'s':''}`;
  if(!grid) return;
  if(!data.length){
   grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-search"></i><p>No courses match your filters.</p><button class="btn-enroll" onclick="clearFilters()">Clear Filters</button></div>`;
   return;
  }
  grid.innerHTML=data.map(c=>`
   <div class="cc" onclick="openCourseModal(${c.id})">
    <div style="position:relative">
     ${courseBanner(c,140)}
     ${c.badge?`<span class="cc-badge badge-${c.badge}">${c.badge.toUpperCase()}</span>`:''}
     <button class="cc-wish ${S.wishlist.has(c.id)?'active':''}" onclick="event.stopPropagation();toggleWish(${c.id},this)"><i class="fas fa-heart"></i></button>
    </div>
    <div class="cc-body">
     <div class="cc-cat">${c.cat}</div>
     <div class="cc-title">${c.title}</div>
     <div class="cc-desc">${c.desc.substring(0,82)}…</div>
     <div class="cc-meta"><span><i class="fas fa-clock"></i>${c.hrs}h</span><span><i class="fas fa-signal"></i>${c.level}</span><span><i class="fas fa-users"></i>${c.students.toLocaleString()}</span></div>
     <div class="cc-rating"><span class="stars">${'★'.repeat(Math.floor(c.rating))}</span><strong>${c.rating}</strong></div>
     <div class="cc-footer">
      <div class="cc-price">₹${c.price.toLocaleString()}<span class="cc-old">₹${Math.floor(c.price*1.2).toLocaleString()}</span></div>
      <button class="btn-enroll" onclick="event.stopPropagation();openCourseModal(${c.id})">Enroll Now</button>
     </div>
    </div>
   </div>`).join('');
}
function filterCourses(){
  const q=(document.getElementById('courseSearch')?.value||'').toLowerCase();
  const cat=document.getElementById('catFilter')?.value||'';
  const level=document.getElementById('levelFilter')?.value||'';
  let data=COURSES.filter(c=>(!q||c.title.toLowerCase().includes(q)||c.cat.toLowerCase().includes(q))&&(!cat||c.cat===cat)&&(!level||c.level===level));
  if(S.sortMode==='popular') data.sort((a,b)=>b.students-a.students);
  if(S.sortMode==='price_asc') data.sort((a,b)=>a.price-b.price);
  if(S.sortMode==='price_desc') data.sort((a,b)=>b.price-a.price);
  if(S.sortMode==='rating') data.sort((a,b)=>b.rating-a.rating);
  renderCourses(data);
}
function toggleSort(){
  const modes=['popular','rating','price_asc','price_desc'];
  const labels=['Popular','Rating','Price ↑','Price ↓'];
  const idx=(modes.indexOf(S.sortMode)+1)%modes.length;
  S.sortMode=modes[idx];
  document.getElementById('sortBtn').innerHTML=`<i class="fas fa-sort"></i> ${labels[idx]}`;
  filterCourses();
}
function clearFilters(){ document.getElementById('courseSearch').value=''; document.getElementById('catFilter').value=''; document.getElementById('levelFilter').value=''; renderCourses(COURSES); }
function toggleWish(id,btn){
  if(S.wishlist.has(id)){ S.wishlist.delete(id); btn.classList.remove('active'); showToast('Removed from wishlist','info'); }
  else { S.wishlist.add(id); btn.classList.add('active'); showToast('Added to wishlist','success'); }
}

/* ════════════════════════════════════════════════════════
   VIDEO PLAYER  (embedded — no redirect)
   ════════════════════════════════════════════════════════ */
function openVideoPlayer(ytId,title,desc){
  document.getElementById('videoModalBody').innerHTML=`
   <div class="vid-wrap"><iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div>
   <div class="vid-info"><h3>${title}</h3><p>${desc||'TS Tech Park — Course Content'}</p></div>`;
  document.getElementById('videoModal').classList.add('active');
}
function stopVideo(){ document.getElementById('videoModalBody').innerHTML=''; }

/* ════════════════════════════════════════════════════════
   COURSE MODAL  (curriculum / videos / enroll+pay tabs)
   ════════════════════════════════════════════════════════ */
function openCourseModal(id){
  const c=COURSES.find(x=>x.id===id); if(!c) return;
  document.getElementById('courseModalBody').innerHTML=`
   ${courseBanner(c,180).replace('class="cc-thumb"','class="cm-thumb"')}
   <div class="cm-body">
    <div style="display:flex;gap:7px;margin-bottom:8px;flex-wrap:wrap">
     <span class="cc-cat" style="margin:0">${c.cat}</span>
     <span style="background:${c.bg}22;color:${c.bg};padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700">${c.level}</span>
     ${c.badge?`<span class="cc-badge badge-${c.badge}" style="position:static">${c.badge.toUpperCase()}</span>`:''}
    </div>
    <div class="cm-title">${c.title}</div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:9px"><span class="stars">${'★'.repeat(Math.floor(c.rating))}</span><strong>${c.rating}</strong><span style="color:var(--text2);font-size:11px">(${c.students.toLocaleString()} students)</span></div>
    <div class="cm-desc">${c.desc}</div>
    <div class="cm-tabs">
     <button class="cm-tab active" onclick="cmTab(this,'cmCur')">Curriculum</button>
     <button class="cm-tab" onclick="cmTab(this,'cmVid')">Videos</button>
     <button class="cm-tab" onclick="cmTab(this,'cmPay')">Enroll</button>
     <button class="cm-tab" onclick="cmTab(this,'cmInfo')">Info</button>
    </div>
    <div id="cmCur" class="cm-tab-body active">
     ${c.curriculum.map((item,i)=>`<div class="cur-item"><i class="fas fa-${i===0?'play-circle':'lock'}"></i><span>${item}</span>${i===0?'<span style="margin-left:auto;font-size:9px;color:var(--green);font-weight:700">FREE PREVIEW</span>':''}</div>`).join('')}
    </div>
    <div id="cmVid" class="cm-tab-body">
     <p style="font-size:11px;color:var(--text2);margin-bottom:10px">Videos open <strong>right here</strong> — no redirect to other sites.</p>
     ${c.videos.map((v,i)=>`<div class="cur-item" onclick="openVideoPlayer('${v.yt}','${v.title}','${c.desc.replace(/'/g,"\\'")}')"><div style="width:48px;height:32px;border-radius:6px;background:${c.bg}22;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-play-circle" style="color:${c.bg};font-size:18px"></i></div><div><div style="font-weight:700;font-size:12px">${v.title}</div><div style="font-size:10px;color:var(--text2)">Lesson ${i+1}</div></div><button class="play-btn-sm" onclick="event.stopPropagation();openVideoPlayer('${v.yt}','${v.title}','')"><i class="fas fa-play"></i>Play</button></div>`).join('')}
    </div>
    <div id="cmPay" class="cm-tab-body">
     <div style="font-size:1.6rem;font-weight:800;color:var(--accent);margin-bottom:4px">₹${c.price.toLocaleString()}</div>
     <div style="font-size:11px;color:var(--text2);margin-bottom:12px">Lifetime access • Certificate on completion • All updates free</div>
     <label class="form-label">Choose payment mode</label>
     <div class="pay-opts">
      <label class="pay-opt sel"><input type="radio" name="pm" value="UPI" checked onchange="onPmChange(this)"> <i class="fas fa-mobile-alt"></i> UPI</label>
      <label class="pay-opt"><input type="radio" name="pm" value="Online" onchange="onPmChange(this)"> <i class="fas fa-credit-card"></i> Online (Card/NetBanking)</label>
      <label class="pay-opt"><input type="radio" name="pm" value="Cash" onchange="onPmChange(this)"> <i class="fas fa-money-bill-wave"></i> Cash</label>
     </div>
     <div class="pay-detail-box show" id="payDetailUPI"><label class="form-label">UPI ID</label><input class="form-input" placeholder="yourname@upi" id="upiId"></div>
     <div class="pay-detail-box" id="payDetailOnline"><div class="form-row"><input class="form-input" placeholder="Card / Account Number" id="cardNo"><input class="form-input" placeholder="Name on Card" id="cardName"></div></div>
     <div class="pay-detail-box" id="payDetailCash"><p style="font-size:11px;color:var(--text2)">Pay at the TS Tech Park front office. Your seat is reserved for 48 hours pending cash payment confirmation by admin.</p></div>
     <button class="btn-full btn-accent" style="margin-top:8px" onclick="payAndEnroll(${c.id})">Pay &amp; Enroll — ₹${c.price.toLocaleString()}</button>
     <div style="text-align:center;margin-top:8px;font-size:11px;color:var(--text2)">Secure checkout · 30-day money-back guarantee</div>
    </div>
    <div id="cmInfo" class="cm-tab-body">
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px">
      <div><strong><i class="fas fa-clock" style="color:var(--accent);margin-right:3px"></i>Duration</strong><div style="color:var(--text2);margin-top:2px">${c.hrs} hours</div></div>
      <div><strong><i class="fas fa-signal" style="color:var(--accent);margin-right:3px"></i>Level</strong><div style="color:var(--text2);margin-top:2px">${c.level}</div></div>
      <div><strong><i class="fas fa-users" style="color:var(--accent);margin-right:3px"></i>Students</strong><div style="color:var(--text2);margin-top:2px">${c.students.toLocaleString()}</div></div>
      <div><strong><i class="fas fa-star" style="color:var(--gold);margin-right:3px"></i>Rating</strong><div style="color:var(--text2);margin-top:2px">${c.rating}/5.0</div></div>
      <div><strong><i class="fas fa-certificate" style="color:var(--accent);margin-right:3px"></i>Certificate</strong><div style="color:var(--text2);margin-top:2px">Yes, QR-verified</div></div>
      <div><strong><i class="fas fa-language" style="color:var(--accent);margin-right:3px"></i>Language</strong><div style="color:var(--text2);margin-top:2px">English / Tamil</div></div>
     </div>
    </div>
   </div>`;
  document.getElementById('courseModal').classList.add('active');
}
function cmTab(btn,id){
  const b=btn.closest('.cm-body');
  b.querySelectorAll('.cm-tab').forEach(t=>t.classList.remove('active'));
  b.querySelectorAll('.cm-tab-body').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(id).classList.add('active');
}
function onPmChange(input){
  document.querySelectorAll('.pay-opt').forEach(p=>p.classList.remove('sel'));
  input.closest('.pay-opt').classList.add('sel');
  document.querySelectorAll('.pay-detail-box').forEach(b=>b.classList.remove('show'));
  document.getElementById('payDetail'+input.value).classList.add('show');
}
function payAndEnroll(id){
  if(!S.loggedIn){ openAuth('login'); return; }
  const c=COURSES.find(x=>x.id===id);
  const mode=document.querySelector('input[name="pm"]:checked')?.value || 'UPI';
  if(!S.enrolledCourses.includes(id)){
   S.enrolledCourses.push(id);
   S.user.enrolledCount=(S.user.enrolledCount||0)+1;
   localStorage.setItem('ts_user',JSON.stringify(S.user));
   saveEnrolled();
   document.getElementById('enrolledBadge').textContent=S.enrolledCourses.length;
  }
  const now=new Date();
  const payments=getPayments();
  payments.unshift({
   id:'TXN'+now.getTime(),
   accountName:getDisplayName(S.user),
   email:S.user.email,
   course:c.title,
   amount:c.price,
   mode,
   date:now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}),
   time:now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}),
   status: mode==='Cash' ? 'Pending Confirmation' : 'Paid'
  });
  savePayments(payments);
  closeModal('courseModal');
  showToast(mode==='Cash' ? 'Enrolled — please pay cash at the office to confirm' : 'Payment successful! Course unlocked.','success');
}

/* ════════════════════════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════════════════════════ */
function switchDash(btn,sec){
  document.querySelectorAll('.sb-link').forEach(l=>l.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const fns={overview:renderOverview,mycourses:renderMyCourses,progress:renderProgress,quizzes:renderQuizSel,assignments:renderAssignments,certificates:renderCerts,notes:renderNotes,wishlist:renderWishlist,gamification:renderGameplay,leaderboard:renderLB,schedule:renderSchedule,payments:renderPayments,settings:renderSettings};
  (fns[sec]||renderOverview)();
}
function renderOverview(){
  if(!S.loggedIn){ openAuth('login'); return; }
  const u=S.user; const nm=getDisplayName(u);
  const myC=S.enrolledCourses.map(id=>COURSES.find(c=>c.id===id)).filter(Boolean).slice(0,4);
  document.getElementById('dashMain').innerHTML=`
   <div class="dash-hdr"><div><h2>Welcome back, ${nm}!</h2><p>${myC.length?`You have ${myC.length} course${myC.length>1?'s':''} in progress.`:'Browse the catalog and enroll in your first course to get started.'}</p></div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div style="display:flex;align-items:center;gap:5px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:8px;padding:6px 11px;font-size:11px;color:var(--gold)"><i class="fas fa-fire"></i>${u.streak||1}-day streak!</div><button class="btn-sm btn-primary" onclick="switchDash(null,'quizzes')"><i class="fas fa-robot"></i> Quiz</button></div>
   </div>
   <div class="stats-grid">
    <div class="stat-card sc1"><div class="sc-ico"><i class="fas fa-book-open"></i></div><div class="sc-val">${S.enrolledCourses.length}</div><div class="sc-lbl">Enrolled Courses</div><div class="sc-chg">Choose from Courses page</div></div>
    <div class="stat-card sc2"><div class="sc-ico"><i class="fas fa-clock"></i></div><div class="sc-val">${u.hoursLearned||0}h</div><div class="sc-lbl">Hours Learned</div><div class="sc-chg">Tracked from video playback</div></div>
    <div class="stat-card sc3"><div class="sc-ico"><i class="fas fa-star"></i></div><div class="sc-val">${u.xp||0}</div><div class="sc-lbl">XP Points</div><div class="sc-chg">Earn by completing tasks</div></div>
    <div class="stat-card sc4"><div class="sc-ico"><i class="fas fa-certificate"></i></div><div class="sc-val">${u.certificates||0}</div><div class="sc-lbl">Certificates</div><div class="sc-chg">Complete a course to earn one</div></div>
   </div>
   <div class="dash-g2">
    <div class="dash-card">
     <div class="dc-title">Continue Learning <a onclick="switchDash(null,'mycourses')">View all</a></div>
     ${myC.length===0?`<div class="empty-state" style="padding:1.5rem"><i class="fas fa-book"></i><p style="margin-bottom:8px">No courses enrolled yet.</p><button class="btn-enroll" onclick="showPage('courses')">Browse Courses</button></div>`:
      myC.map((c)=>`<div class="enr-item"><div class="enr-ico" style="background:${c.bg}">${c.title.split(' ').map(w=>w[0]).slice(0,2).join('')}</div><div style="flex:1;min-width:0"><div class="enr-name">${c.title}</div><div class="enr-prog"><div class="mb"><div class="mf" style="width:25%"></div></div>25%</div></div><button class="btn-resume" onclick="openVideoPlayer('${c.videos[0].yt}','${c.videos[0].title}','')">Resume</button></div>`).join('')}
    </div>
    <div>
     <div class="dash-card" style="margin-bottom:12px">
      <div class="dc-title">Getting Started</div>
      ${myC.length===0?
       `<div class="act-item"><div class="act-dot ad-b"><i class="fas fa-book" style="font-size:10px"></i></div><div><div class="act-title">Browse the course catalog</div><div class="act-time">Find a topic that interests you</div></div></div>
        <div class="act-item"><div class="act-dot ad-g"><i class="fas fa-credit-card" style="font-size:10px"></i></div><div><div class="act-title">Enroll &amp; pay via UPI, Online or Cash</div><div class="act-time">Flexible payment modes</div></div></div>
        <div class="act-item"><div class="act-dot ad-p"><i class="fas fa-robot" style="font-size:10px"></i></div><div><div class="act-title">Ask TechBot anything</div><div class="act-time">4 languages, 24/7</div></div></div>`
       : `<div class="act-item"><div class="act-dot ad-g"><i class="fas fa-check-circle" style="font-size:10px"></i></div><div><div class="act-title">Enrolled in ${myC.length} course${myC.length>1?'s':''}</div><div class="act-time">Keep your streak going!</div></div></div>
          <div class="act-item"><div class="act-dot ad-b"><i class="fas fa-clipboard-check" style="font-size:10px"></i></div><div><div class="act-title">Try a quiz in your subject</div><div class="act-time">Test your knowledge</div></div></div>`}
     </div>
     <div class="streak-card">
      <div style="font-size:10px;color:var(--text2);margin-bottom:2px">STREAK</div>
      <div class="streak-num">${u.streak||1}</div>
      <div style="font-size:11px;color:var(--text2)">day${(u.streak||1)>1?'s':''} in a row!</div>
      <div class="week-dots">${['M','T','W','T','F','S','S'].map((d,i)=>`<div class="wd ${i<1?'wd-today':'wd-future'}">${d}</div>`).join('')}</div>
     </div>
    </div>
   </div>`;
}
function renderMyCourses(){
  const myC=S.enrolledCourses.map(id=>COURSES.find(c=>c.id===id)).filter(Boolean);
  document.getElementById('dashMain').innerHTML=`
   <div class="dash-hdr"><div><h2>My Courses</h2><p>${myC.length} enrolled</p></div><button class="btn-sm btn-primary" onclick="showPage('courses')"><i class="fas fa-plus"></i> Browse More</button></div>
   ${myC.length===0?`<div class="empty-state"><i class="fas fa-book-open"></i><p>No courses yet. Browse and enroll!</p><button class="btn-enroll" onclick="showPage('courses')">Browse Courses</button></div>`:
   `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:13px">${myC.map(c=>`<div class="cc" onclick="openVideoPlayer('${c.videos[0].yt}','${c.videos[0].title}','')">${courseBanner(c,100)}<div class="cc-body"><div class="cc-title">${c.title}</div><div class="prog-bar" style="margin:9px 0 3px"><div class="prog-fill" style="width:25%"></div></div><button class="btn-enroll" style="width:100%;margin-top:9px"><i class="fas fa-play"></i> Resume</button></div></div>`).join('')}</div>`}`;
}
function renderProgress(){
  document.getElementById('dashMain').innerHTML=`
   <div class="dash-hdr"><div><h2>Analytics</h2><p>Your learning performance</p></div></div>
   <div class="dash-geq">
    <div class="dash-card"><div class="dc-title">Weekly Hours</div><div style="display:flex;align-items:flex-end;gap:5px;height:80px;margin-top:9px">${[3,5,4,7,6,8,5].map((h,i)=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px"><span style="font-size:9px;color:var(--text2)">${h}h</span><div style="width:100%;height:${h*9}px;background:linear-gradient(to top,var(--accent),var(--accent2));border-radius:2px 2px 0 0"></div><span style="font-size:9px;color:var(--text2)">${['M','T','W','T','F','S','S'][i]}</span></div>`).join('')}</div></div>
    <div class="dash-card"><div class="dc-title">Quiz Scores</div>${S.quizHistory&&S.quizHistory.length?S.quizHistory.slice(0,4).map(q=>`<div style="margin-bottom:9px"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span>${q.topic}</span><strong>${q.pct}%</strong></div><div class="prog-bar"><div class="prog-fill" style="width:${q.pct}%"></div></div></div>`).join(''):`<p style="font-size:12px;color:var(--text2)">Take a quiz to see your scores here.</p>`}</div>
   </div>
   <div class="dash-card"><div class="dc-title">AI Insights</div><div style="background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);border-radius:10px;padding:14px;display:flex;gap:11px"><i class="fas fa-lightbulb" style="color:var(--accent2);font-size:1.3rem;flex-shrink:0"></i><div><div style="font-weight:700;margin-bottom:6px;font-size:13px">TechBot Analysis</div><p style="font-size:12px;color:var(--text2);line-height:1.7">${S.enrolledCourses.length? 'Keep up your study streak — consistent short sessions beat long cramming. Try a quiz in your enrolled subject to reinforce what you\\'ve learned.' : 'Enroll in a course to start receiving personalised study insights here.'}</p></div></div></div>`;
}
function renderQuizSel(){
  document.getElementById('dashMain').innerHTML=`
   <div class="dash-hdr"><div><h2>Quizzes &amp; Tests</h2><p>Multi-subject quizzes to test your knowledge</p></div></div>
   <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:11px;margin-bottom:18px">${Object.keys(QB).map(topic=>`<div class="dash-card" style="cursor:pointer;text-align:center" onclick="startQuiz('${topic}')"><i class="fas fa-clipboard-question" style="font-size:1.6rem;color:var(--accent);margin-bottom:8px"></i><div style="font-weight:700;font-size:12px;margin-bottom:3px">${topic}</div><div style="font-size:10px;color:var(--text2)">${QB[topic].length} questions</div><button class="btn-enroll" style="margin-top:10px;width:100%">Start Quiz</button></div>`).join('')}</div>
   <div class="dash-card"><div class="dc-title">Quiz History</div>${(S.quizHistory&&S.quizHistory.length)?S.quizHistory.map(h=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border)"><div><div style="font-weight:600;font-size:12px">${h.topic}</div><div style="font-size:10px;color:var(--text2)">${h.when}</div></div><span style="font-weight:800;font-size:14px;color:${h.pct>=80?'var(--green)':h.pct>=60?'var(--gold)':'var(--accentr)'}">${h.pct}%</span></div>`).join(''):`<p style="font-size:12px;color:var(--text2)">No quizzes taken yet — try one above!</p>`}</div>`;
}
function startQuiz(topic){
  const qs=QB[topic]||QB['Embedded Systems'];
  let cur=0, score=0, answered=false, timerSec=60;
  if(S.quizTimer) clearInterval(S.quizTimer);
  function render(){
   if(cur>=qs.length){
    clearInterval(S.quizTimer);
    const pct=Math.round(score/qs.length*100);
    S.quizHistory=S.quizHistory||[];
    S.quizHistory.unshift({topic,pct,when:'Just now'});
    document.getElementById('dashMain').innerHTML=`<div style="max-width:520px;margin:3rem auto;text-align:center"><i class="fas fa-flag-checkered" style="font-size:2.5rem;color:var(--accent);margin-bottom:14px"></i><h2>Quiz Complete!</h2><div style="font-size:2.5rem;font-weight:800;color:${pct>=85?'var(--green)':pct>=65?'var(--gold)':'var(--accentr)'};margin:12px 0">${score}/${qs.length}</div><p style="color:var(--text2)">Score: ${pct}% · ${pct>=85?'Excellent!':pct>=65?'Good effort!':'Keep practising!'}</p><div style="display:flex;gap:9px;justify-content:center;margin-top:18px;flex-wrap:wrap"><button class="btn-quiz bq-p" onclick="startQuiz('${topic}')">Try Again</button><button class="btn-quiz bq-s" onclick="renderQuizSel()">All Quizzes</button><button class="btn-quiz bq-s" onclick="switchDash(null,'overview')">Dashboard</button></div></div>`;
    return;
   }
   const q=qs[cur]; timerSec=60;
   document.getElementById('dashMain').innerHTML=`
    <div class="dash-hdr"><div><h2>${topic} Quiz</h2><p>Q ${cur+1} of ${qs.length}</p></div><div class="timer-badge"><i class="fas fa-clock"></i><span id="td">1:00</span></div></div>
    <div class="quiz-wrap">
     <div class="dash-card" style="margin-bottom:11px"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;margin-bottom:9px"><span>Progress</span><span>${cur+1}/${qs.length} · Score: ${score}</span></div><div class="prog-bar"><div class="prog-fill" style="width:${(cur/qs.length*100)}%"></div></div></div>
     <div class="q-card"><div class="q-num">Question ${cur+1}</div><div class="q-text">${q.q}</div><div class="opts-list">${q.o.map((opt,i)=>`<div class="opt" id="op${i}" onclick="selOpt(${i},${q.a})"><div class="opt-l">${String.fromCharCode(65+i)}</div><span>${opt}</span></div>`).join('')}</div></div>
     <div class="quiz-nav"><button class="btn-quiz bq-s" onclick="startQuiz('${topic}')"><i class="fas fa-redo"></i> Restart</button><button class="btn-quiz bq-p" id="nextBtn" disabled onclick="nextQ()">${cur+1<qs.length?'Next <i class="fas fa-arrow-right"></i>':'Finish <i class="fas fa-flag-checkered"></i>'}</button></div>
    </div>`;
   S.quizTimer=setInterval(()=>{ timerSec--; const el=document.getElementById('td'); if(el) el.textContent=`${Math.floor(timerSec/60)}:${String(timerSec%60).padStart(2,'0')}`; if(timerSec<=0){ clearInterval(S.quizTimer); nextQ(); } },1000);
   window.selOpt=(i,a)=>{ if(answered) return; answered=true; clearInterval(S.quizTimer); document.querySelectorAll('.opt').forEach(o=>o.style.pointerEvents='none'); document.getElementById('op'+i).classList.add(i===a?'correct':'wrong'); if(i!==a) document.getElementById('op'+a).classList.add('correct'); if(i===a) score++; document.getElementById('nextBtn').disabled=false; };
   window.nextQ=()=>{ cur++; answered=false; render(); };
  }
  render();
}
function renderAssignments(){
  const tasks=[
   {title:'Design CAN Bus message matrix for vehicle ECU network',course:'Automotive Embedded',due:'Jun 15, 2026',status:'pending',pts:50},
   {title:'Implement FreeRTOS mutex for shared resource in C',course:'RTOS',due:'Jun 18, 2026',status:'pending',pts:40},
   {title:'Python data analysis on a public telemetry dataset',course:'Python for Data Science',due:'Jun 12, 2026',status:'pending',pts:45},
   {title:'React CRUD app with authentication',course:'Web Development',due:'Jun 22, 2026',status:'pending',pts:60},
  ];
  document.getElementById('dashMain').innerHTML=`<div class="dash-hdr"><div><h2>Assignments</h2><p>${tasks.length} pending</p></div></div>
   ${tasks.map(a=>`<div class="dash-card" style="margin-bottom:10px"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:9px;flex-wrap:wrap"><div><div style="font-weight:700;font-size:13px;margin-bottom:3px">${a.title}</div><div style="font-size:10px;color:var(--text2)">${a.course} · Due: ${a.due} · ${a.pts} pts</div></div><span class="s-pill sp-pending">PENDING</span></div><div style="display:flex;gap:6px;margin-top:10px"><button class="abt ab-e" onclick="showToast('Upload your work here','info')"><i class="fas fa-upload"></i> Submit</button></div></div>`).join('')}`;
}
function renderCerts(){
  const u=S.user;
  const myC=S.enrolledCourses.map(id=>COURSES.find(c=>c.id===id)).filter(Boolean);
  document.getElementById('dashMain').innerHTML=`<div class="dash-hdr"><div><h2>Certificates</h2><p>Verified, QR-backed credentials</p></div></div>
   ${(u.certificates||0)===0 && myC.length===0 ? `<div class="empty-state"><i class="fas fa-certificate"></i><p>No certificates yet. Enroll in a course and complete it to earn your first one.</p><button class="btn-enroll" onclick="showPage('courses')">Browse Courses</button></div>` :
   `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:15px">${myC.map(c=>`<div class="dash-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:160px;border-style:dashed"><i class="fas fa-lock" style="font-size:1.5rem;color:var(--text2);margin-bottom:9px;opacity:.35"></i><div style="font-weight:700;font-size:13px;margin-bottom:3px">${c.title}</div><div style="font-size:11px;color:var(--text2)">Complete the course to unlock</div><div class="prog-bar" style="width:160px;margin-top:9px"><div class="prog-fill" style="width:25%"></div></div></div>`).join('')}</div>`}`;
}
function renderNotes(){
  document.getElementById('dashMain').innerHTML=`<div class="dash-hdr"><div><h2>My Notes</h2><p>${S.notes.length} notes</p></div><button class="btn-sm btn-primary" onclick="addNote()"><i class="fas fa-plus"></i> New</button></div>
   ${S.notes.length===0?`<div class="empty-state"><i class="fas fa-sticky-note"></i><p>No notes yet. Add one while you study!</p></div>`:
   `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">${S.notes.map((n,i)=>`<div class="dash-card" style="border-top:2px solid var(--accent)"><div style="font-weight:700;margin-bottom:2px;font-size:13px">${n.title}</div><div style="font-size:10px;color:var(--text2);margin-bottom:9px">${n.date}</div><pre style="font-size:11px;font-family:'Inter',sans-serif;color:var(--text2);white-space:pre-wrap;line-height:1.7">${n.note}</pre><button class="abt ab-d" onclick="S.notes.splice(${i},1);renderNotes()">Delete</button></div>`).join('')}</div>`}`;
}
function addNote(){ const t=prompt('Note title:'); const n=prompt('Content:'); if(t&&n){ S.notes.unshift({title:t,note:n,date:'Just now'}); renderNotes(); showToast('Saved!','success'); } }
function renderWishlist(){
  const list=COURSES.filter(c=>S.wishlist.has(c.id));
  document.getElementById('dashMain').innerHTML=`<div class="dash-hdr"><div><h2>Wishlist</h2><p>${list.length} courses saved</p></div></div>
   ${list.length===0?`<div class="empty-state"><i class="fas fa-heart"></i><p>Wishlist is empty.</p><button class="btn-enroll" onclick="showPage('courses')">Browse Courses</button></div>`:
   `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">${list.map(c=>`<div class="cc">${courseBanner(c,90)}<div class="cc-body"><div class="cc-title">${c.title}</div><div class="cc-footer"><div class="cc-price">₹${c.price.toLocaleString()}</div><button class="btn-enroll" onclick="openCourseModal(${c.id})">Enroll</button></div></div></div>`).join('')}</div>`}`;
}
function renderGameplay(){
  const u=S.user;
  document.getElementById('dashMain').innerHTML=`<div class="dash-hdr"><div><h2>Badges &amp; XP</h2><p>Your achievements</p></div></div>
   <div class="dash-geq">
    <div class="dash-card" style="text-align:center"><div style="font-size:2.2rem;font-weight:800;color:var(--gold);font-family:'Space Grotesk',sans-serif">${u.xp||0}</div><div style="font-size:12px;color:var(--text2);margin-top:3px">Total XP</div><div class="prog-bar" style="margin:11px 0 3px"><div class="prog-fill" style="width:${Math.min((u.xp||0)/50,100)}%"></div></div><div style="font-size:11px;color:var(--text2)">Earn XP by completing courses &amp; quizzes</div></div>
    <div class="streak-card"><div style="font-size:10px;color:var(--text2);margin-bottom:2px">STREAK</div><div class="streak-num">${u.streak||1}</div><div style="font-size:11px;color:var(--text2)">days in a row</div></div>
   </div>
   <div class="dash-card"><div class="dc-title">Badges</div><div class="badge-grid">${[{i:'fa-rocket',n:'First Launch',earned:S.enrolledCourses.length>0},{i:'fa-fire',n:'Hot Streak',earned:false},{i:'fa-code',n:'Code Ninja',earned:false},{i:'fa-clipboard-check',n:'Quiz Master',earned:(S.quizHistory||[]).length>=3},{i:'fa-bolt',n:'Speed Learn',earned:false},{i:'fa-graduation-cap',n:'Graduate',earned:false},{i:'fa-medal',n:'Top Ranker',earned:false},{i:'fa-gem',n:'Diamond',earned:false}].map(b=>`<div class="badge-item ${b.earned?'earned':'locked'}"><i class="fas ${b.i} badge-emoji" style="color:${b.earned?'var(--gold)':'var(--text2)'};font-size:1.4rem"></i><div class="badge-name">${b.n}</div></div>`).join('')}</div></div>`;
}
function renderLB(){
  const u=S.user; const nm=getDisplayName(u);
  const users=[{name:'Karthik V.',pts:8920,av:'KV',color:'#6366f1'},{name:'Priya M.',pts:7340,av:'PM',color:'#0e7490'},{name:'Arjun V.',pts:6180,av:'AV',color:'#15803d'},{name:`${nm} (You)`,pts:u.xp||0,av:getInit(u),color:'#14b8c4',you:true},{name:'Deepa K.',pts:2640,av:'DK',color:'#ef4444'},{name:'Mohan R.',pts:1980,av:'MR',color:'#1d4ed8'}].sort((a,b)=>b.pts-a.pts);
  document.getElementById('dashMain').innerHTML=`<div class="dash-hdr"><div><h2>Leaderboard</h2><p>Top learners this month</p></div></div>
   <div class="dash-card" style="max-width:500px">${users.map((u2,i)=>`<div class="lb-item" style="${u2.you?'background:rgba(20,184,196,.06);border-radius:8px;padding:2px 6px':''}"><div class="lb-rank ${i===0?'r-gold':i===1?'r-silver':i===2?'r-bronze':'r-other'}">${i<3?(i+1):`#${i+1}`}</div><div class="lb-av" style="background:${u2.color}">${u2.av}</div><div class="lb-name">${u2.name}${u2.you?'<strong style="color:var(--accent)"> ← You</strong>':''}</div><div class="lb-pts">${u2.pts.toLocaleString()} XP</div></div>`).join('')}</div>`;
}
function renderSchedule(){
  const events=[{day:'Today',time:'3:00 PM',title:'Live class — check Live page',type:'live',color:'#14b8c4'},{day:'Tomorrow',time:'10:00 AM',title:'New batch starts (if enrolled)',type:'class',color:'#0e7490'}];
  document.getElementById('dashMain').innerHTML=`<div class="dash-hdr"><div><h2>Schedule</h2><p>Upcoming classes and deadlines</p></div></div>
   <div class="dash-card">${events.map(e=>`<div style="display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid var(--border)"><div style="width:6px;height:6px;border-radius:50%;background:${e.color};flex-shrink:0"></div><div style="min-width:80px;font-size:11px;color:var(--text2)">${e.day}</div><div style="min-width:60px;font-size:11px;font-weight:600">${e.time}</div><div style="flex:1;font-size:12px;font-weight:600">${e.title}</div><span style="background:${e.color}22;color:${e.color};padding:2px 7px;border-radius:4px;font-size:9px;font-weight:700">${e.type.toUpperCase()}</span></div>`).join('')}</div>`;
}
function renderPayments(){
  const all=getPayments().filter(p=>p.email===S.user.email);
  document.getElementById('dashMain').innerHTML=`<div class="dash-hdr"><div><h2>Payments &amp; History</h2><p>All your transactions, with date, time and mode</p></div></div>
   <div class="dash-card" style="overflow-x:auto">
    <table class="admin-table"><thead><tr><th>Date &amp; Time</th><th>Course</th><th>Amount</th><th>Mode</th><th>Status</th></tr></thead>
    <tbody>${all.length===0?`<tr><td colspan="5" style="text-align:center;color:var(--text2);padding:18px">No transactions yet. Enroll in a course to see your payment history here.</td></tr>`:
     all.map(p=>`<tr><td>${p.date} · ${p.time}</td><td style="font-weight:600">${p.course}</td><td style="font-weight:700;color:var(--accent)">₹${p.amount.toLocaleString()}</td><td>${p.mode}</td><td><span class="s-pill ${p.status==='Paid'?'sp-active':'sp-pending'}">${p.status.toUpperCase()}</span></td></tr>`).join('')}</tbody></table>
   </div>`;
}
function renderSettings(){
  const u=S.user||{};
  document.getElementById('dashMain').innerHTML=`<div class="dash-hdr"><div><h2>Settings</h2><p>Account preferences</p></div></div>
   <div style="max-width:520px">
    <div class="dash-card" style="margin-bottom:12px"><div class="dc-title">Profile Info</div>
     <div class="form-group"><label class="form-label">First Name</label><input class="form-input" id="sFname" value="${u.firstName||''}"></div>
     <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" id="sLname" value="${u.lastName||''}"></div>
     <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="sPhone" value="${u.phone||''}"></div>
     <div class="form-group"><label class="form-label">City</label><input class="form-input" id="sCity" value="${u.city||''}"></div>
     <button class="btn-enroll" onclick="saveSettings()">Save Changes</button>
    </div>
    <div class="dash-card"><div class="dc-title">Appearance</div><div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><span style="font-size:12px">Theme</span><button class="btn-enroll" onclick="toggleTheme()">Toggle</button></div>
     <div style="margin-top:11px;padding-top:11px;border-top:1px solid var(--border)"><button style="padding:8px 14px;background:rgba(239,68,68,.1);color:var(--accentr);border:1px solid rgba(239,68,68,.3);border-radius:7px;font-size:11px;font-weight:700;cursor:pointer" onclick="doLogout()"><i class="fas fa-sign-out-alt"></i> Logout</button></div>
    </div>
   </div>`;
}
function saveSettings(){
  if(!S.user) return;
  S.user.firstName=document.getElementById('sFname').value.trim();
  S.user.lastName=document.getElementById('sLname').value.trim();
  S.user.phone=document.getElementById('sPhone').value.trim();
  S.user.city=document.getElementById('sCity').value.trim();
  localStorage.setItem('ts_user',JSON.stringify(S.user));
  let accounts=getAccounts().map(a=>a.email===S.user.email?{...a,...S.user}:a);
  saveAccounts(accounts);
  afterLogin();
  showToast('Profile saved!','success');
}

/* ════════════════════════════════════════════════════════
   PROFILE PAGE
   ════════════════════════════════════════════════════════ */
function renderProfilePage(){
  const u=S.user; if(!u) return;
  document.getElementById('profAv').textContent=getInit(u);
  document.getElementById('profName').textContent=getDisplayName(u);
  document.getElementById('profTagline').textContent=[u.role,u.city].filter(Boolean).join(' · ')||'TS Tech Park Learner';
  document.getElementById('profEmail').innerHTML=`<i class="fas fa-envelope"></i> ${u.email||'—'}`;
  document.getElementById('profPhone').innerHTML=`<i class="fas fa-phone"></i> ${u.phone||'—'}`;
  document.getElementById('profJoined').innerHTML=`<i class="fas fa-calendar"></i> Joined ${u.joinedDate||'—'}`;
  document.getElementById('profStats').innerHTML=[
   {label:'Enrolled',val:S.enrolledCourses.length},
   {label:'Hours',val:(u.hoursLearned||0)+'h'},
   {label:'Certificates',val:u.certificates||0},
   {label:'XP',val:`<span style="color:var(--gold);font-weight:800">${u.xp||0}</span>`},
   {label:'Streak',val:u.streak||1},
  ].map(s=>`<div class="psl-item"><span class="psl-label">${s.label}</span><span class="psl-val">${s.val}</span></div>`).join('');
  document.getElementById('profCerts').innerHTML=(u.certificates||0)===0?`<p style="font-size:12px;color:var(--text2)">No certificates yet — complete a course to earn one.</p>`:'';
  document.getElementById('profSkills').innerHTML=S.enrolledCourses.length===0?`<p style="font-size:12px;color:var(--text2)">Enroll in courses to start tracking skill progress.</p>`:
   S.enrolledCourses.map(id=>COURSES.find(c=>c.id===id)).filter(Boolean).map(c=>`<div style="margin-bottom:9px"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span>${c.title}</span><strong>25%</strong></div><div class="prog-bar"><div class="prog-fill" style="width:25%"></div></div></div>`).join('');
  const cells=Array.from({length:84},()=>0);
  document.getElementById('profHeatmap').innerHTML=`<div style="font-size:10px;color:var(--text2);margin-bottom:6px">Last 84 days</div><div class="heatmap-grid">${cells.map(c=>`<div class="heat-cell h${c}"></div>`).join('')}</div>`;
}
function openEditProfile(){
  const u=S.user; if(!u){ openAuth('login'); return; }
  document.getElementById('editProfileBody').innerHTML=`
   <div class="form-row"><div class="form-group"><label class="form-label">First Name</label><input class="form-input" id="epFn" value="${u.firstName||''}"></div><div class="form-group"><label class="form-label">Last Name</label><input class="form-input" id="epLn" value="${u.lastName||''}"></div></div>
   <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="epPh" value="${u.phone||''}"></div>
   <div class="form-group"><label class="form-label">City</label><input class="form-input" id="epCi" value="${u.city||''}"></div>
   <button class="btn-full btn-accent" onclick="saveEP()">Save Profile</button>`;
  document.getElementById('editProfileModal').classList.add('active');
}
function saveEP(){
  const u=S.user;
  u.firstName=document.getElementById('epFn').value.trim();
  u.lastName=document.getElementById('epLn').value.trim();
  u.phone=document.getElementById('epPh').value.trim();
  u.city=document.getElementById('epCi').value.trim();
  localStorage.setItem('ts_user',JSON.stringify(u));
  let accounts=getAccounts().map(a=>a.email===u.email?{...a,...u}:a);
  saveAccounts(accounts);
  closeModal('editProfileModal');
  afterLogin(); renderProfilePage();
  showToast('Updated!','success');
}

/* ════════════════════════════════════════════════════════
   FORUM
   ════════════════════════════════════════════════════════ */
function renderForum(filter='',tab='all'){
  const c=document.getElementById('forumPosts'); if(!c) return;
  let posts=S.forumPosts;
  if(filter) posts=posts.filter(p=>p.title.toLowerCase().includes(filter.toLowerCase())||p.text.toLowerCase().includes(filter.toLowerCase())||p.tags.some(t=>t.toLowerCase().includes(filter.toLowerCase())));
  if(tab!=='all') posts=posts.filter(p=>p.type===tab);
  c.innerHTML=posts.length===0?`<div class="empty-state"><i class="fas fa-comments"></i><p>No posts yet. Be the first!</p></div>`:
   posts.map(p=>`<div class="fp"><div class="fp-hdr"><div class="fp-av" style="background:${p.color}">${p.av}</div><div class="fp-meta"><div class="fp-name">${p.user}</div><div class="fp-time">${p.time}</div></div><span class="fp-cat" style="background:${p.catColor}22;color:${p.catColor}">${p.cat}</span></div><div class="fp-title">${p.title}</div><div class="fp-text">${p.text}</div><div class="fp-tags">${p.tags.map(t=>`<span class="tag-pill">#${t}</span>`).join('')}</div><div class="fp-foot"><button class="fp-act" onclick="likePost(this)"><i class="fas fa-heart"></i>${p.likes}</button><button class="fp-act" onclick="showToast('Opening replies…','info')"><i class="fas fa-comment"></i>${p.replies} replies</button><button class="fp-act" onclick="showToast('Saved!','success')"><i class="fas fa-bookmark"></i></button><button class="fp-act" style="margin-left:auto" onclick="showToast('Link copied!','info')"><i class="fas fa-share"></i></button></div></div>`).join('');
}
function filterForum(val){ renderForum(val||'',S.forumTab); }
function setForumTab(btn,tab){ document.querySelectorAll('.ftab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); S.forumTab=tab; renderForum('',tab); }
function likePost(btn){ const i=btn.querySelector('i'); const liked=i.style.color==='var(--accentr)'; i.style.color=liked?'':'var(--accentr)'; const n=parseInt(btn.textContent.match(/\d+/)[0]); btn.innerHTML=`<i class="fas fa-heart" style="color:${liked?'':'var(--accentr)'}"></i>${liked?n-1:n+1}`; }
function openNewPost(){ if(!S.loggedIn){ openAuth('login'); return; } document.getElementById('postModal').classList.add('active'); }
function submitPost(){
  const title=document.getElementById('postTitle').value.trim();
  const content=document.getElementById('postContent').value.trim();
  const cat=document.getElementById('postCat').value;
  const tags=document.getElementById('postTags').value.split(',').map(t=>t.trim()).filter(Boolean);
  if(!title||!content){ showToast('Fill title and content','error'); return; }
  const u=S.user;
  S.forumPosts.unshift({id:Date.now(),user:getDisplayName(u),av:getInit(u),color:'#14b8c4',time:'Just now',cat,catColor:'#0e7490',title,text:content,likes:0,replies:0,tags:tags.length?tags:[cat],type:'questions'});
  closeModal('postModal'); renderForum();
  document.getElementById('postTitle').value=''; document.getElementById('postContent').value=''; document.getElementById('postTags').value='';
  showToast('Published!','success');
}

/* ════════════════════════════════════════════════════════
   LIVE CLASSES
   ════════════════════════════════════════════════════════ */
function renderLive(tab){
  const c=document.getElementById('liveContent'); if(!c) return;
  const list=LIVE_DATA[tab]||[];
  if(!list.length){ c.innerHTML=`<div class="empty-state"><i class="fas fa-video"></i><p>No sessions right now.</p></div>`; return; }
  c.innerHTML=list.map(lc=>`<div class="lcc"><div class="lc-ico" style="background:${tab==='live'?'#ef4444':'#0e7490'}">${(lc.title||'?').charAt(0)}</div><div style="flex:1">${tab==='live'?'<div class="lc-live"><div class="ldot"></div>LIVE NOW</div>':''}<div style="font-weight:700;font-size:13px">${lc.title}</div><div style="font-size:11px;color:var(--text2);margin-top:2px"><i class="fas fa-user-tie" style="margin-right:3px"></i>${lc.instructor}<i class="fas fa-clock" style="margin:0 3px 0 8px"></i>${lc.time}${lc.attendees?`<i class="fas fa-users" style="margin:0 3px 0 8px"></i>${lc.attendees}`:''}${lc.duration?`<i class="fas fa-film" style="margin:0 3px 0 8px"></i>${lc.duration}`:''}</div></div><button class="btn-enroll" onclick="${lc.link?`window.open('${lc.link}','_blank')`:`showToast('${tab==='live'?'Joining…':tab==='recordings'?'Loading…':'Reminder set!'}','${tab==='live'?'success':'info'}')`}">${tab==='live'?'<i class="fas fa-video"></i> Join':tab==='recordings'?'<i class="fas fa-play"></i> Watch':'<i class="fas fa-bell"></i> Remind'}</button></div>`).join('');
}
function setLiveTab(btn,tab){ document.querySelectorAll('.ltab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); renderLive(tab); }

/* ════════════════════════════════════════════════════════
   ADMIN — secure login + OTP + dashboard
   ════════════════════════════════════════════════════════ */
const ADMIN_CREDS={ username:'admin', password:'Admin@123' };
function adminRequestOtp(){
  const u=document.getElementById('adminUser').value.trim();
  const p=document.getElementById('adminPass').value;
  if(u!==ADMIN_CREDS.username || p!==ADMIN_CREDS.password){ showToast('Invalid admin username or password','error'); return; }
  const code=String(Math.floor(100000+Math.random()*900000));
  S.pendingOtp=code;
  document.getElementById('adminLoginStep').style.display='none';
  document.getElementById('adminOtpStep').style.display='block';
  document.querySelectorAll('#adminOtpStep .otp-box').forEach(b=>b.value='');
  showToast(`Admin OTP (simulated, sent to admin group email): ${code}`,'info');
}
function adminBackToLogin(){
  document.getElementById('adminLoginStep').style.display='block';
  document.getElementById('adminOtpStep').style.display='none';
}
function adminVerifyOtp(){
  const boxes=document.querySelectorAll('#adminOtpStep .otp-box');
  const entered=Array.from(boxes).map(b=>b.value).join('');
  if(entered!==S.pendingOtp){ showToast('Incorrect verification code','error'); return; }
  S.adminAuthed=true;
  document.getElementById('adminGateView').style.display='none';
  document.getElementById('adminDashView').style.display='block';
  renderAdminDashboard();
  showToast('Admin verified — welcome!','success');
}
function adminLogout(){ S.adminAuthed=false; goAdmin(); showToast('Exited admin dashboard','info'); }
function getAllUsersForAdmin(){ return getAccounts(); }
function renderAdminDashboard(){
  const accounts=getAllUsersForAdmin();
  const payments=getPayments();
  const totalStudents=accounts.filter(a=>a.role==='Student').length;
  const totalInstructors=accounts.filter(a=>a.role==='Instructor').length;
  const totalRevenue=payments.reduce((s,p)=>s+(p.status==='Paid'?p.amount:0),0);
  document.getElementById('adminStats').innerHTML=`
   <div class="as-c c1"><i class="fas fa-users as-ci"></i><div class="asv">${accounts.length}</div><div class="asl">Total Users</div><div class="asc">${totalStudents} students · ${totalInstructors} instructors</div></div>
   <div class="as-c c2"><i class="fas fa-book as-ci"></i><div class="asv">${COURSES.length}</div><div class="asl">Active Courses</div><div class="asc">Live catalog</div></div>
   <div class="as-c c3"><i class="fas fa-rupee-sign as-ci"></i><div class="asv">₹${totalRevenue.toLocaleString()}</div><div class="asl">Total Revenue Collected</div><div class="asc">${payments.length} transactions</div></div>
   <div class="as-c c4"><i class="fas fa-chart-line as-ci"></i><div class="asv">${payments.filter(p=>p.status==='Paid').length}</div><div class="asl">Payments Completed</div><div class="asc">${payments.filter(p=>p.status!=='Paid').length} pending</div></div>`;
  const counts=[0,0,0,0,0,0,0];
  accounts.forEach(()=>{ counts[Math.floor(Math.random()*7)]++; });
  const max=Math.max(...counts,1);
  document.getElementById('signupChart').innerHTML=counts.map(v=>`<div class="rev-bar" style="height:${Math.max(6,Math.round(v/max*100))}%" title="${v} signups"></div>`).join('');
  const pendingInstructors=accounts.filter(a=>a.role==='Instructor'&&a.status==='pending');
  document.getElementById('adminPendingInstructors').innerHTML=pendingInstructors.length===0?`<p style="font-size:12px;color:var(--text2)">No pending approvals.</p>`:
   pendingInstructors.map(a=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><div><div style="font-weight:700;font-size:12px">${[a.firstName,a.lastName].filter(Boolean).join(' ')}</div><div style="font-size:10px;color:var(--text2)">${a.email}</div></div><button class="abt ab-g" onclick="adminApproveInstructor('${a.email}')">Approve</button></div>`).join('');
  renderAdminTable();
  document.getElementById('adminPaymentsBody').innerHTML=payments.length===0?`<tr><td colspan="7" style="text-align:center;color:var(--text2);padding:16px">No payments recorded yet.</td></tr>`:
   payments.map(p=>`<tr><td>${p.date} · ${p.time}</td><td style="font-weight:600">${p.accountName}</td><td style="font-size:11px;color:var(--text2)">${p.email}</td><td>${p.course}</td><td style="font-weight:700;color:var(--accent)">₹${p.amount.toLocaleString()}</td><td>${p.mode}</td><td><span class="s-pill ${p.status==='Paid'?'sp-active':'sp-pending'}">${p.status.toUpperCase()}</span></td></tr>`).join('');
}
function adminApproveInstructor(email){
  let accounts=getAccounts().map(a=>a.email===email?{...a,status:'active'}:a);
  saveAccounts(accounts);
  showToast('Instructor approved','success');
  renderAdminDashboard();
}
function renderAdminTable(){
  const tb=document.getElementById('adminTableBody'); if(!tb) return;
  let users=getAllUsersForAdmin();
  if(S.adminFilter) users=users.filter(u=>(`${u.firstName} ${u.lastName}`).toLowerCase().includes(S.adminFilter.toLowerCase())||u.email.toLowerCase().includes(S.adminFilter.toLowerCase()));
  if(S.adminRole) users=users.filter(u=>u.role===S.adminRole);
  const pp=6, total=Math.max(1,Math.ceil(users.length/pp)), page=Math.min(S.adminPage,total);
  const paged=users.slice((page-1)*pp,page*pp);
  tb.innerHTML=paged.length===0?`<tr><td colspan="6" style="text-align:center;color:var(--text2);padding:16px">No users found.</td></tr>`:
   paged.map(u=>{
    const name=[u.firstName,u.lastName].filter(Boolean).join(' ')||u.email;
    const av=name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
    const status=u.status||'active';
    return `<tr><td style="display:flex;align-items:center;gap:7px"><div style="width:28px;height:28px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:800;flex-shrink:0">${av}</div><strong style="font-size:12px">${name}</strong></td><td style="color:var(--text2);font-size:11px">${u.email}</td><td><span style="padding:2px 7px;border-radius:4px;font-size:9px;font-weight:700;background:${u.role==='Instructor'?'rgba(99,102,241,.12)':'rgba(20,184,196,.12)'};color:${u.role==='Instructor'?'var(--accent2)':'var(--accent)'}">${u.role}</span></td><td><span class="s-pill sp-${status}">${status.toUpperCase()}</span></td><td style="font-size:11px">${u.joinedDate||'—'}</td><td><div class="act-btns">${status==='suspended'?`<button class="abt ab-g" onclick="adminSetStatus('${u.email}','active')">Unblock</button>`:`<button class="abt ab-d" onclick="adminSetStatus('${u.email}','suspended')">Suspend</button>`}</div></td></tr>`;
   }).join('');
  const pag=document.getElementById('tablePag');
  if(pag) pag.innerHTML=Array.from({length:total},(_,i)=>`<button class="pg-btn ${i+1===page?'active':''}" onclick="S.adminPage=${i+1};renderAdminTable()">${i+1}</button>`).join('');
}
function filterAdminUsers(val){ if(val!==undefined) S.adminFilter=val; const r=document.getElementById('adminRoleFilter'); if(r) S.adminRole=r.value; S.adminPage=1; renderAdminTable(); }
function adminSetStatus(email,status){
  let accounts=getAccounts().map(a=>a.email===email?{...a,status}:a);
  saveAccounts(accounts);
  showToast(status==='suspended'?'Account suspended':'Account unblocked','success');
  renderAdminTable();
}
function adminPostLive(){
  const title=document.getElementById('lsTitle').value.trim();
  const instructor=document.getElementById('lsInstructor').value.trim();
  const link=document.getElementById('lsLink').value.trim();
  const type=document.getElementById('lsType').value;
  if(!title||!link){ showToast('Title and link are required','error'); return; }
  LIVE_DATA[type].unshift({title,instructor:instructor||'TS Tech Park',time: type==='live'?'LIVE NOW':'Starting soon',attendees:0,link});
  document.getElementById('lsTitle').value=''; document.getElementById('lsInstructor').value=''; document.getElementById('lsLink').value='';
  showToast('Live session published','success');
  renderLive(document.querySelector('.ltab.active')?.textContent.toLowerCase().includes('live')?'live':type);
}

/* ════════════════════════════════════════════════════════
   CHATBOT
   ════════════════════════════════════════════════════════ */
function setChatLang(lang){ S.chatLang=lang; document.getElementById('chatMsgs').innerHTML=''; S.chatWarnings=0; chatWelcome(); }
function chatWelcome(){ const lang=FAQ[S.chatLang]||FAQ.en; addBotMsg(lang.welcome||FAQ.en.welcome); }
function toggleChat(){
  S.chatOpen=!S.chatOpen;
  document.getElementById('chatPanel').classList.toggle('open',S.chatOpen);
  document.getElementById('chatIcon').className=S.chatOpen?'fas fa-times':'fas fa-robot';
  if(S.chatOpen){ document.getElementById('chatUnread').style.display='none'; document.getElementById('chatInput').focus(); }
}
function clearChat(){ document.getElementById('chatMsgs').innerHTML=''; S.chatWarnings=0; chatWelcome(); showToast('Chat cleared','info'); }
function sendChat(){
  const input=document.getElementById('chatInput');
  const msg=input.value.trim(); if(!msg) return;
  input.value=''; input.style.height='';
  document.getElementById('chatSugg').style.display='none';
  const lower=msg.toLowerCase();
  const isBad=BAD.some(w=>lower.includes(w));
  if(isBad){
   S.chatWarnings++; addUserMsg(msg);
   const lang=FAQ[S.chatLang]||FAQ.en;
   const wm=S.chatWarnings===1?lang.warn1:S.chatWarnings===2?lang.warn2:lang.warn3;
   setTimeout(()=>addBotMsg(`<div class="warn-msg"><i class="fas fa-exclamation-triangle"></i>${wm}</div>`),500);
   return;
  }
  addUserMsg(msg);
  const msgs=document.getElementById('chatMsgs');
  const typing=document.createElement('div');
  typing.className='cmr';
  typing.innerHTML=`<div class="msg-av-sm bot-av-sm"><i class="fas fa-robot" style="font-size:8px"></i></div><div class="msg-bubble bot-bub"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
  msgs.appendChild(typing); scrollChat();
  setTimeout(()=>{ typing.remove(); addBotMsg(getBotReply(msg)); },650+Math.random()*400);
}
function sendSugg(text){ document.getElementById('chatInput').value=text; sendChat(); }
function getBotReply(msg){
  const lang=FAQ[S.chatLang]||FAQ.en;
  const m=msg.toLowerCase();
  const faq=lang.faq||{}; const efaq=FAQ.en.faq;
  for(const [k,v] of Object.entries(faq)){ if(m.includes(k)) return v; }
  for(const [k,v] of Object.entries(efaq)){ if(m.includes(k)) return v; }
  if(m.includes('price')||m.includes('cost')||m.includes('கட்டணம்')||m.includes('फीस')) return efaq['fee'];
  if(m.includes('upi')||m.includes('cash')||m.includes('payment mode')) return efaq['payment'];
  if(m.includes('batch')||m.includes('start')||m.includes('when')) return efaq['batch'];
  if(m.includes('placement')||m.includes('job')||m.includes('salary')) return efaq['placement'];
  if(m.includes('cert')) return efaq['certificate'];
  if(m.includes('contact')||m.includes('address')) return efaq['contact'];
  if(m.includes('recommend')||m.includes('best course')) return efaq['recommend'];
  return lang.fallback||FAQ.en.fallback;
}
function addBotMsg(html){
  const msgs=document.getElementById('chatMsgs');
  const d=document.createElement('div'); d.className='cmr';
  d.innerHTML=`<div class="msg-av-sm bot-av-sm"><i class="fas fa-robot" style="font-size:8px"></i></div><div class="msg-bubble bot-bub">${html}</div>`;
  msgs.appendChild(d); scrollChat();
}
function addUserMsg(text){
  const msgs=document.getElementById('chatMsgs');
  const d=document.createElement('div'); d.className='cmr user';
  d.innerHTML=`<div class="msg-bubble user-bub">${escHtml(text)}</div><div class="msg-av-sm user-av-sm">U</div>`;
  msgs.appendChild(d); scrollChat();
}
function scrollChat(){ const m=document.getElementById('chatMsgs'); m.scrollTop=m.scrollHeight; }
function autoResizeChat(el){ el.style.height=''; el.style.height=Math.min(el.scrollHeight,80)+'px'; }
function escHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ════════════════════════════════════════════════════════
   TOASTS
   ════════════════════════════════════════════════════════ */
const TI={success:'fa-check-circle',error:'fa-exclamation-circle',info:'fa-info-circle',warning:'fa-exclamation-triangle'};
function showToast(msg,type='info'){
  const c=document.getElementById('toastContainer');
  const t=document.createElement('div'); t.className=`toast ${type}`;
  t.innerHTML=`<i class="fas ${TI[type]}"></i>${msg}`;
  c.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),280); },4200);
}
