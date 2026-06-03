// Data Structure mapping your exact course details
const coursesData = [
    { name: "C Programming", price: "₹1,000", hours: 40, mode: "English/Tamil", type: "software" },
    { name: "Power BI", price: "₹1,000", hours: 30, mode: "English", type: "software" },
    { name: "Python", price: "₹15,000", hours: 50, mode: "English/Tamil", type: "software" },
    { name: "Java", price: "₹18,000", hours: 60, mode: "English", type: "software" },
    { name: "Embedded Systems", price: "₹50,000 + 18% GST", hours: 120, mode: "English/Tamil", type: "embedded" },
    { name: "Automotive Embedded", price: "₹60,000 + 18% GST", hours: 130, mode: "English/Tamil", type: "embedded" },
    { name: "Edge AI", price: "₹70,000 + 18% GST", hours: 100, mode: "English", type: "embedded" },
    { name: "IoT & Robotics", price: "₹55,000 + 18% GST", hours: 110, mode: "English/Tamil", type: "embedded" },
    { name: "Cloud Computing", price: "₹25,000", hours: 50, mode: "English", type: "software" },
    { name: "Data Science", price: "₹40,000", hours: 80, mode: "English/Tamil", type: "software" },
    { name: "Machine Learning", price: "₹45,000", hours: 90, mode: "English", type: "software" },
    { name: "AI", price: "₹50,000", hours: 100, mode: "English", type: "software" },
    { name: "Cybersecurity", price: "₹35,000", hours: 70, mode: "English", type: "software" },
    { name: "Web Development", price: "₹20,000", hours: 60, mode: "English/Tamil", type: "software" }
];

// Runtime Local Simulation States (Acts as our client DB memory)
let appState = {
    currentUser: null,  // Holds logged-in user object data
    registeredCourses: [], // Data mapping user_id to booked item courses
    payments: [] // Data mapping tracking logs
};

// Selection DOM Element Hooks
const navLinks = document.querySelectorAll('.nav-links li, [data-target]');
const panels = document.querySelectorAll('.panel');
const themeToggle = document.getElementById('theme-toggle');
const coursesGrid = document.getElementById('courses-grid-container');

// Active App Views Lifecycle initialization 
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    renderCourseGrid(coursesData);
    setupNavigationRouting();
    setupAuthActions();
    setupExtraFunctionalFeatures();
});

// Dynamic Digital System Clock Utility
function initClock() {
    const updateClock = () => {
        const now = new Date();
        document.getElementById('date-time-display').textContent = now.toLocaleString();
    };
    setInterval(updateClock, 1000);
    updateClock();
}

// Light & Dark Theme Context Engine Switcher
themeToggle.addEventListener('click', () => {
    const body = document.body;
    if(body.classList.contains('light-theme')) {
        body.classList.replace('light-theme', 'dark-theme');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        body.classList.replace('dark-theme', 'light-theme');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
});

// Router navigation simulation engine
function setupNavigationRouting() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetPaneId = link.getAttribute('data-target');
            if(!targetPaneId) return;

            // Protection validation filter rules 
            if(['mycourses', 'payment'].includes(targetPaneId) && !appState.currentUser) {
                alert("Access Denied! Authenticated User Session needed. Redirecting to Login view context.");
                switchActivePanel('login');
                return;
            }

            switchActivePanel(targetPaneId);
        });
    });

    document.getElementById('hero-enroll-btn').addEventListener('click', () => {
        switchActivePanel(appState.currentUser ? 'courses' : 'login');
    });
}

function switchActivePanel(panelId) {
    panels.forEach(p => p.classList.remove('active'));
    const targetedDomNode = document.getElementById(`${panelId}-panel`);
    if(targetedDomNode) targetedDomNode.classList.add('active');

    // Sync menu tabs dynamic classes highlighters
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
        if(li.getAttribute('data-target') === panelId) li.classList.add('active');
    });
}

// Populating and rendering catalog template blocks 
function renderCourseGrid(list) {
    coursesGrid.innerHTML = '';
    list.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-btn-card';
        card.innerHTML = `
            <h4>${course.name}</h4>
            <p class="price-tag">${course.price}</p>
            <p style="font-size:0.8rem; margin-top:0.4rem; opacity:0.7;"><i class="fa-regular fa-clock"></i> ${course.hours} Hrs allocation</p>
        `;
        card.addEventListener('click', () => triggerCourseModalFlow(course));
        coursesGrid.appendChild(card);
    });
}

// Integrated Interactive Modal Operations Box with price parsers
let contextSelectedCourse = null;
function triggerCourseModalFlow(course) {
    if(!appState.currentUser) {
        alert("Authentication Required! Access can only be processed upon setting context identity credentials.");
        switchActivePanel('login');
        return;
    }

    contextSelectedCourse = course;
    document.getElementById('modal-course-name').textContent = course.name;
    document.getElementById('modal-course-price').textContent = course.price;
    document.getElementById('modal-course-hours').textContent = course.hours;
    document.getElementById('modal-course-mode').textContent = course.mode;

    // Advanced dynamic parsing mathematical calculator features logic
    let numbersFound = course.price.replace(/[^0-9]/g, '');
    let realBaseVal = parseFloat(numbersFound) || 0;
    let computedTax = course.price.includes('GST') ? (realBaseVal * 0.18) : 0;
    let netCompoundTotal = realBaseVal + computedTax;

    document.getElementById('modal-calc-tax').textContent = `₹${computedTax.toLocaleString()}`;
    document.getElementById('modal-calc-total').textContent = `₹${netCompoundTotal.toLocaleString()}`;

    document.getElementById('course-modal').classList.add('open');
}

// Dismiss modal window mappings
document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('course-modal').classList.remove('open');
});

// Confirm Registration event capturing and mapping transactions standard logs
document.getElementById('modal-enroll-confirm').addEventListener('click', () => {
    if(!contextSelectedCourse) return;

    const chosenGateway = document.getElementById('modal-payment-select').value;
    
    // Check if user is already enrolled to prevent double registration (Extra Feature)
    const alreadyEnrolled = appState.registeredCourses.some(
        c => c.userId === appState.currentUser.id && c.name === contextSelectedCourse.name
    );
    if (alreadyEnrolled) {
        alert(`You are already enrolled in ${contextSelectedCourse.name}!`);
        document.getElementById('course-modal').classList.remove('open');
        return;
    }

    // Save simulation registration
    appState.registeredCourses.push({
        userId: appState.currentUser.id,
        name: contextSelectedCourse.name,
        mode: contextSelectedCourse.mode,
        status: 'Active Live Module'
    });

    // Extract numbers to pass to payments structure state
    let numericAmountValue = document.getElementById('modal-calc-total').textContent;

    appState.payments.push({
        userId: appState.currentUser.id,
        name: contextSelectedCourse.name,
        amount: numericAmountValue,
        gateway: chosenGateway,
        txnRef: 'TXN-' + Math.floor(100000 + Math.random() * 900000)
    });

    alert(`Successfully Registered for ${contextSelectedCourse.name}! Status is now set to active.`);
    document.getElementById('course-modal').classList.remove('open');
    
    // Refresh panels elements
    syncUserSecureDashboards();
});

// Simulated Authentication Engine
function setupAuthActions() {
    // Signup process handling 
    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const userObj = {
            id: Date.now(),
            name: document.getElementById('signup-name').value,
            email: document.getElementById('signup-email').value,
            username: document.getElementById('signup-username').value.trim()
        };

        appState.currentUser = userObj;
        alert(`Account created successfully! Welcome onboard, ${userObj.name}`);
        toggleBodyAuthUIState(true);
        switchActivePanel('home');
        document.getElementById('signup-form').reset();
    });

    // Login configuration profile validation matches
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fallbackName = document.getElementById('login-username').value.trim();

        appState.currentUser = {
            id: 777, // Simulated mock identifier profile mapping keys
            name: fallbackName,
            username: fallbackName
        };

        alert(`Access granted! Session initialized for user context: ${fallbackName}`);
        toggleBodyAuthUIState(true);
        switchActivePanel('home');
        document.getElementById('login-form').reset();
    });

    // Logging destruction tracking loop mappings resets 
    document.getElementById('logout-btn').addEventListener('click', () => {
        appState.currentUser = null;
        toggleBodyAuthUIState(false);
        alert("Session cleared safely. Resetting access permissions to baseline security standards.");
        switchActivePanel('home');
    });
}

function toggleBodyAuthUIState(isLoggedIn) {
    if(isLoggedIn) {
        document.body.classList.add('logged-in');
        document.getElementById('nav-login-btn').classList.add('hidden');
        document.getElementById('nav-signup-btn').classList.add('hidden');
        document.getElementById('user-profile').classList.remove('hidden');
        document.getElementById('username-span').textContent = appState.currentUser.name;
        syncUserSecureDashboards();
    } else {
        document.body.classList.remove('logged-in');
        document.getElementById('nav-login-btn').classList.remove('hidden');
        document.getElementById('nav-signup-btn').classList.remove('hidden');
        document.getElementById('user-profile').classList.add('hidden');
        document.getElementById('my-courses-tbody').innerHTML = '';
        document.getElementById('payments-tbody').innerHTML = '';
        document.getElementById('course-count-badge').textContent = '0 Modules';
    }
}

// Data synchronization logic mapping arrays to secure dynamic grid view layouts templates rows
function syncUserSecureDashboards() {
    if(!appState.currentUser) return;

    // Filter dynamic datasets context items scopes sets keys identifiers profiles
    const userModules = appState.registeredCourses.filter(item => item.userId === appState.currentUser.id);
    const userPayments = appState.payments.filter(item => item.userId === appState.currentUser.id);

    // Render registered item cards lists rows inside the structural target panels views elements elements
    const coursesBody = document.getElementById('my-courses-tbody');
    coursesBody.innerHTML = '';
    userModules.forEach((mod, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><strong>${mod.name}</strong></td>
            <td>${mod.mode}</td>
            <td><span class="badge" style="background:#10b981;">${mod.status}</span></td>
        `;
        coursesBody.appendChild(tr);
    });
    document.getElementById('course-count-badge').textContent = `${userModules.length} Modules`;

    const payBody = document.getElementById('payments-tbody');
    payBody.innerHTML = '';
    userPayments.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.name}</td>
            <td><strong>${p.amount}</strong></td>
            <td><i class="fa-solid fa-shield-halved"></i> ${p.gateway}</td>
            <td><code style="background:rgba(0,0,0,0.06); padding:0.2rem; border-radius:3px;">${p.txnRef}</code></td>
        `;
        payBody.appendChild(tr);
    });
}

// Extra Features: Live Course Catalog Search and Categorization Filters Functionality
function setupExtraFunctionalFeatures() {
    const searchBar = document.getElementById('course-search');
    const filterSelect = document.getElementById('course-filter');

    const runFiltering = () => {
        const textQuery = searchBar.value.toLowerCase().trim();
        const selectedType = filterSelect.value;

        const dynamicFilteredResultList = coursesData.filter(course => {
            const matchesSearch = course.name.toLowerCase().includes(textQuery);
            const matchesType = (selectedType === 'all') || (course.type === selectedType);
            return matchesSearch && matchesType;
        });

        renderCourseGrid(dynamicFilteredResultList);
    };

    searchBar.addEventListener('input', runFiltering);
    filterSelect.addEventListener('change', runFiltering);

    // Mock intercept submission handler on the query contact forms view interface context rules mappings
    document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Thank you! Your query statement ticket profile submission has been securely routed directly to our admissions team desk.");
        document.getElementById('contact-form').reset();
    });
}
