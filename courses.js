/**
 * Handles Global Content Domain Catalogs and Rendering Templates
 */
class CourseCatalog {
    constructor() {
        // Formatted structured definitions replacing legacy placeholder emojis
        this.courses = [
            {
                id: 'ds-01',
                title: 'DATA SCIENCE BY TS TECH PARK',
                category: 'data-science',
                desc: 'Complete engineering telemetry pipelines, data analysis matrix configurations, and modern machine learning integration frameworks.',
                price: '₹4,999',
                premium: true
            },
            {
                id: 'emb-02',
                title: 'EMBEDDED SYSTEMS BY TS TECH PARK',
                category: 'embedded',
                desc: 'Microcontroller register parsing, structural firmware development optimization, and hardware abstract logic validation.',
                price: '₹5,499',
                premium: true
            },
            {
                id: 'wd-03',
                title: 'WEB DEVELOPMENT BY TS TECH PARK',
                category: 'web-dev',
                desc: 'Constructing robust corporate data hubs, building scalable multi-role interfaces, and deploying cloud tracking architectures.',
                price: '₹3,999',
                premium: false
            },
            {
                id: 'cs-04',
                title: 'CYBER SECURITY BY TS TECH PARK',
                category: 'cyber',
                desc: 'Securing server entry endpoints, network packet tracing audits, cryptographic signature validation frameworks.',
                price: '₹6,000',
                premium: true
            }
        ];
        this.currentTypeFilter = 'all';
    }

    renderCatalog() {
        const grid = document.getElementById('publicCoursesGridContainer');
        const countTxt = document.getElementById('catalogResultsCount');
        if (!grid) return;

        const searchVal = document.getElementById('courseSearchInput')?.value.toLowerCase() || '';
        const categoryVal = document.getElementById('categoryFilterSelect')?.value || 'all';

        // Filter compilation steps
        const matches = this.courses.filter(c => {
            const matchSearch = c.title.toLowerCase().includes(searchVal) || c.desc.toLowerCase().includes(searchVal);
            const matchCat = (categoryVal === 'all') || (c.category === categoryVal);
            const matchType = (this.currentTypeFilter === 'all') || (this.currentTypeFilter === 'premium' && c.premium);
            return matchSearch && matchCat && matchType;
        });

        countTxt.textContent = `Showing ${matches.length} calibrated technical programs`;
        grid.innerHTML = '';

        if (matches.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text2);">No technical tracking profiles match the query fields.</div>`;
            return;
        }

        matches.forEach(course => {
            const card = document.createElement('div');
            card.className = 'cc';
            card.innerHTML = `
                <div class="cc-thumb">
                    <i class="${this.getCategoryIcon(course.category)}"></i>
                </div>
                <div class="cc-body">
                    <div class="cc-cat">${course.category.replace('-', ' ')}</div>
                    <h4 class="cc-title">${course.title}</h4>
                    <p class="cc-desc">${course.desc}</p>
                    <div class="cc-footer">
                        <div class="cc-price">${course.price}</div>
                        <button class="btn-sm btn-primary" onclick="courses.triggerPurchaseFlow('${course.id}')">Enroll Matrix</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    getCategoryIcon(cat) {
        switch(cat) {
            case 'data-science': return 'fas fa-chart-network';
            case 'embedded': return 'fas fa-microchip';
            case 'web-dev': return 'fas fa-code';
            default: return 'fas fa-shield-halved';
        }
    }

    setFilterType(type) {
        this.currentTypeFilter = type;
        document.querySelectorAll('.filter-buttons .fbtn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`filter-${type}-btn`)?.classList.add('active');
        this.renderCatalog();
    }

    filterCatalog() {
        this.renderCatalog();
    }

    triggerPurchaseFlow(id) {
        const target = this.courses.find(c => c.id === id);
        app.dispatchToast(`Initializing payment router framework for ${target.title}. Directing token parameters to transaction pipelines...`, 'info');
    }
}

const courses = new CourseCatalog();
