/**
 * Master Application State and Navigation Engine Context
 */
class AppManager {
    constructor() {
        this.currentTheme = 'dark';
        this.activePage = 'hero-page';
        this.notifications = [];
        this.currentUser = null;
    }

    init() {
        console.log("Initializing TS Tech Park LMS Execution Terminal...");
        // Hydrate public marketplace dynamic assets
        courses.renderCatalog();
        this.syncDashboardInitialState();
    }

    /**
     * View navigation router framework
     * @param {string} pageId Target Page section reference
     */
    navigateTo(pageId) {
        document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        
        if (targetPage) {
            targetPage.classList.add('active');
            this.activePage = pageId;
            window.scrollTo(0, 0);
        }

        // Toggle navigation active markers
        document.querySelectorAll('.nav-link').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(pageId)) {
                btn.classList.add('active');
            }
        });
    }

    /**
     * Inverts the user interface theme from dark to light mode contexts
     */
    toggleTheme() {
        const docHtml = document.documentElement;
        const icon = document.querySelector('#themeToggle i');
        
        if (this.currentTheme === 'dark') {
            docHtml.setAttribute('data-theme', 'light');
            this.currentTheme = 'light';
            icon.className = 'fas fa-sun';
        } else {
            docHtml.setAttribute('data-theme', 'dark');
            this.currentTheme = 'dark';
            icon.className = 'fas fa-moon';
        }
    }

    toggleNotifications() {
        const panel = document.getElementById('notifPanel');
        panel.classList.toggle('hidden');
    }

    /**
     * Complies with requirements to purge pre-existing structural dashboard logs
     */
    syncDashboardInitialState() {
        const enrolledContainer = document.getElementById('enrolledCoursesDashboardContainer');
        if (enrolledContainer) {
            enrolledContainer.innerHTML = `
                <div class="empty-dashboard-notice" style="grid-column: 1/-1; padding: 3rem; text-align: center; border: 1px dashed var(--border); border-radius: var(--radius);">
                    <i class="fas fa-folder-open" style="font-size: 2.5rem; color: var(--text2); margin-bottom: 1rem; display: block;"></i>
                    <h4>No courses enrolled yet.</h4>
                    <p style="color: var(--text2); font-size: 13px; margin-top: 4px;">Explore our catalog environment to join live validation programs.</p>
                    <button class="btn-sm btn-primary" style="margin-top: 1rem;" onclick="app.navigateTo('courses-page')">Browse Content Domains</button>
                </div>
            `;
        }
    }

    dispatchToast(message, type = 'info') {
        console.log(`[LMS Toast Alert - ${type.toUpperCase()}]: ${message}`);
        alert(message); // Standard replacement for complex custom modal arrays
    }
}

// Global Core Ingestion Execution Setup
const app = new AppManager();
document.addEventListener('DOMContentLoaded', () => app.init());
