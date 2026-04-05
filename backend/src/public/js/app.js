const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Central"
];

// ============================================
// BADGE HELPERS
// ============================================

/**
 * Returns HTML badges based on item data attributes.
 * @param {Object} item - the card data object
 * @param {'tender'|'recruitment'} type
 */
function computeBadges(item, type) {
    const badges = [];
    const now = new Date();

    // NEW badge: created within last 3 days
    if (item.created_at) {
        const createdAt = new Date(item.created_at);
        const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 3) {
            badges.push(`<span class="badge badge-new">NEW</span>`);
        }
    }

    if (type === 'tender') {
        // DEADLINE SOON: closing within 7 days
        const deadline = item.closing_date || item.deadline;
        if (deadline) {
            const deadlineDate = new Date(deadline);
            if (!isNaN(deadlineDate)) {
                const daysLeft = (deadlineDate - now) / (1000 * 60 * 60 * 24);
                if (daysLeft >= 0 && daysLeft <= 7) {
                    badges.push(`<span class="badge badge-deadline">⏰ DEADLINE SOON</span>`);
                } else if (daysLeft < 0) {
                    badges.push(`<span class="badge badge-expired">EXPIRED</span>`);
                }
            }
        }

        // HIGH VALUE: tender_value contains number >= 1 crore
        const valueStr = String(item.tender_value || '');
        const valueMatch = valueStr.match(/[\d,]+/);
        if (valueMatch) {
            const numVal = parseInt(valueMatch[0].replace(/,/g, ''));
            if (numVal >= 10000000) { // 1 crore = 10,000,000
                badges.push(`<span class="badge badge-high-value">💰 HIGH VALUE</span>`);
            }
        }
    }

    if (type === 'recruitment') {
        const lastDate = item.application_end_date || item.last_date;
        if (lastDate) {
            const deadline = new Date(lastDate);
            if (!isNaN(deadline)) {
                const daysLeft = (deadline - now) / (1000 * 60 * 60 * 24);
                if (daysLeft >= 0 && daysLeft <= 7) {
                    badges.push(`<span class="badge badge-deadline">⏰ DEADLINE SOON</span>`);
                } else if (daysLeft < 0) {
                    badges.push(`<span class="badge badge-expired">EXPIRED</span>`);
                }
            }
        }
    }

    return badges.length > 0 ? `<div class="card-badges">${badges.join('')}</div>` : '';
}

// ============================================
// CARD RENDERERS
// ============================================

function renderTenderCard(item) {
    const badges = computeBadges(item, 'tender');
    const tenderUrl = item.url || item.source_url || item.link || '#';
    const dept = item.department || item.organization || 'N/A';
    const location = item.state || item.location || 'N/A';
    const deadline = item.closing_date || 'N/A';
    const refNo = item.reference_number || item.tender_id || 'N/A';
    const value = item.tender_value || 'Not Disclosed';
    const title = item.tender_name || item.tender_title || 'Untitled Tender';

    return `
        <div class="item-card tender-card">
            ${badges}
            <h3 class="card-title">${title}</h3>
            <div class="item-meta">
                ${dept !== 'N/A' ? `<span><i class="fas fa-building"></i> ${dept}</span>` : ''}
                ${location !== 'N/A' ? `<span><i class="fas fa-map-marker-alt"></i> ${location}</span>` : ''}
                ${refNo !== 'N/A' ? `<span><i class="fas fa-hashtag"></i> Ref: ${refNo}</span>` : ''}
                <span class="deadline-chip ${isDeadlineSoon(deadline) ? 'soon' : ''}">
                    <i class="fas fa-clock"></i> Closes: ${deadline}
                </span>
            </div>
            <div class="card-details-row">
                ${value !== 'Not Disclosed' ? `<span class="detail-chip value-chip"><i class="fas fa-rupee-sign"></i> ${value}</span>` : ''}
                ${item.tender_type ? `<span class="detail-chip"><i class="fas fa-tag"></i> ${item.tender_type}</span>` : ''}
                ${item.emd_amount && item.emd_amount !== 'Not Specified' ? `<span class="detail-chip"><i class="fas fa-shield-alt"></i> EMD: ${item.emd_amount}</span>` : ''}
            </div>
            ${item.description ? `<p class="card-description">${item.description.substring(0, 160)}${item.description.length > 160 ? '…' : ''}</p>` : ''}
            <a href="${tenderUrl}" target="_blank" rel="noopener" class="btn-link btn-link-green">
                View Tender <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
    `;
}

function renderRecruitmentCard(item) {
    const badges = computeBadges(item, 'recruitment');
    const applyUrl = item.apply_link || item.official_notification || item.source_url || item.url || '#';
    const org = item.organization || item.department || 'N/A';
    const location = item.job_location || item.state || 'N/A';
    const lastDate = item.application_end_date || item.last_date || 'N/A';
    const qualification = item.qualification || 'N/A';
    const salary = item.salary || 'As per norms';
    const vacancies = item.vacancy_count || item.number_of_posts || item.vacancies || null;
    const postName = item.post_name || item.job_title || 'Untitled Post';

    return `
        <div class="item-card recruitment-card">
            ${badges}
            <h3 class="card-title">${postName}</h3>
            <div class="item-meta">
                ${org !== 'N/A' ? `<span><i class="fas fa-university"></i> ${org}</span>` : ''}
                ${location !== 'N/A' ? `<span><i class="fas fa-map-marker-alt"></i> ${location}</span>` : ''}
                ${vacancies ? `<span><i class="fas fa-users"></i> ${vacancies} Vacancies</span>` : ''}
                <span class="deadline-chip ${isDeadlineSoon(lastDate) ? 'soon' : ''}">
                    <i class="fas fa-calendar-check"></i> Last Date: ${lastDate}
                </span>
            </div>
            <div class="card-details-row">
                ${qualification !== 'N/A' ? `<span class="detail-chip"><i class="fas fa-graduation-cap"></i> ${qualification.substring(0, 60)}${qualification.length > 60 ? '…' : ''}</span>` : ''}
                ${salary !== 'N/A' && salary !== 'As per norms' ? `<span class="detail-chip salary-chip"><i class="fas fa-rupee-sign"></i> ${salary.substring(0, 50)}</span>` : ''}
                ${item.age_limit ? `<span class="detail-chip"><i class="fas fa-birthday-cake"></i> Age: ${item.age_limit}</span>` : ''}
            </div>
            <a href="${applyUrl}" target="_blank" rel="noopener" class="btn-link btn-link-purple">
                Apply Now <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
    `;
}

function isDeadlineSoon(dateStr) {
    if (!dateStr || dateStr === 'N/A') return false;
    const d = new Date(dateStr);
    if (isNaN(d)) return false;
    const daysLeft = (d - new Date()) / (1000 * 60 * 60 * 24);
    return daysLeft >= 0 && daysLeft <= 7;
}

// ============================================
// CENTRALIZED APPLICATION STATE
// ============================================

const appState = {
    activeSection: 'home',
    selectedState: null,
    currentPage: 1,
    currentSearch: '',
    currentSort: 'latest',
    schemesData: [],
    tendersData: [],
    recruitmentsData: []
};

// Expose appState globally so schemes.js can update it
window.appState = appState;

window.switchModule = (module) => {
    const navItem = document.querySelector(`.nav-item[data-module="${module}"]`);
    if (navItem) navItem.click();
};

const moduleConfigs = {
    home: {
        title: 'Unified Government Portal',
        description: 'Explore all government services in one place.',
        api: '/api/stats'
    },
    schemes: {
        title: 'Government Schemes',
        description: 'Empowering citizens through various welfare programs.',
        api: '/api/schemes'
    },
    tenders: {
        title: 'Latest Tenders',
        description: 'Explore business opportunities with the government.',
        api: '/api/tenders',
        filtersApi: '/api/tenders/filters',
        renderItem: renderTenderCard
    },
    recruitments: {
        title: 'Government Recruitments',
        description: 'Build your career in the public sector.',
        api: '/api/recruitments',
        filtersApi: '/api/recruitments/filters',
        renderItem: renderRecruitmentCard
    }
};

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    setupEventListeners();
    loadStats();
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (data.success) {
            document.getElementById('scheme-count').innerText = `${data.schemesCount}+`;
            document.getElementById('tender-count').innerText = `${data.tendersCount}+`;
            document.getElementById('recruitment-count').innerText = `${data.recruitmentsCount}+`;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ============================================
// LEGACY LOAD DATA (Tenders + Recruitments)
// ============================================

async function loadData() {
    const config = moduleConfigs[appState.activeSection];
    const itemsList = document.getElementById('items-list');
    if (!itemsList) return;

    itemsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const url = new URL(config.api, window.location.origin);
        if (appState.selectedState) url.searchParams.append('state', appState.selectedState);
        if (appState.currentSearch) url.searchParams.append('search', appState.currentSearch);
        if (appState.currentSort) url.searchParams.append('sort', appState.currentSort);

        if (appState.activeSection === 'tenders') {
            const dept = document.getElementById('tender-filter-dept')?.value;
            const status = document.getElementById('tender-filter-status')?.value;
            if (dept) url.searchParams.append('department', dept);
            if (status) url.searchParams.append('status', status);
        } else if (appState.activeSection === 'recruitments') {
            const org = document.getElementById('job-filter-org')?.value;
            const qual = document.getElementById('job-filter-qual')?.value;
            if (org) url.searchParams.append('organization', org);
            if (qual) url.searchParams.append('qualification', qual);
        }

        url.searchParams.append('page', appState.currentPage);
        url.searchParams.append('limit', 20);

        const response = await fetch(url);
        const result = await response.json();

        console.log(`${appState.activeSection} API response:`, result);

        if (appState.activeSection === 'tenders') appState.tendersData = result.data || [];
        if (appState.activeSection === 'recruitments') appState.recruitmentsData = result.data || [];

        if (result.success && result.data && result.data.length > 0) {
            itemsList.innerHTML = result.data.map(item => config.renderItem(item)).join('');
            renderPagination(result.pagination);
        } else {
            itemsList.innerHTML = '<div class="no-data"><i class="fas fa-search"></i><p>No records found. Try adjusting filters or selecting a different state.</p></div>';
            const paginationDiv = document.getElementById('pagination');
            if (paginationDiv) paginationDiv.innerHTML = '';
        }
    } catch (error) {
        console.error('Error loading data:', error);
        itemsList.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i> Failed to load data. Please try again later.</div>';
    }
}

// Load filter options from API and populate dropdowns
async function loadFilterOptions(section) {
    const config = moduleConfigs[section];
    if (!config?.filtersApi) return;

    try {
        const response = await fetch(config.filtersApi);
        const result = await response.json();
        if (!result.success) return;

        if (section === 'tenders' && result.filters?.departments) {
            const deptSelect = document.getElementById('tender-filter-dept');
            if (deptSelect) {
                // Clear existing options except first
                while (deptSelect.options.length > 1) deptSelect.remove(1);
                result.filters.departments.slice(0, 50).forEach(dept => {
                    const opt = document.createElement('option');
                    opt.value = dept;
                    opt.textContent = dept.substring(0, 60);
                    deptSelect.appendChild(opt);
                });
            }
        }

        if (section === 'recruitments') {
            if (result.filters?.organizations) {
                const orgSelect = document.getElementById('job-filter-org');
                if (orgSelect) {
                    while (orgSelect.options.length > 1) orgSelect.remove(1);
                    result.filters.organizations.slice(0, 50).forEach(org => {
                        const opt = document.createElement('option');
                        opt.value = org;
                        opt.textContent = org.substring(0, 60);
                        orgSelect.appendChild(opt);
                    });
                }
            }
            if (result.filters?.qualifications) {
                const qualSelect = document.getElementById('job-filter-qual');
                if (qualSelect) {
                    while (qualSelect.options.length > 1) qualSelect.remove(1);
                    result.filters.qualifications.slice(0, 30).forEach(qual => {
                        const opt = document.createElement('option');
                        opt.value = qual;
                        opt.textContent = qual.substring(0, 60);
                        qualSelect.appendChild(opt);
                    });
                }
            }
        }
    } catch (err) {
        console.warn('Could not load filter options:', err.message);
    }
}

function renderPagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv || !pagination) return;

    let html = '';
    if (pagination.totalPages > 1) {
        if (pagination.page > 1) {
            html += `<button class="page-btn" onclick="changePage(${pagination.page - 1})">Previous</button>`;
        }
        const start = Math.max(1, pagination.page - 2);
        const end = Math.min(pagination.totalPages, pagination.page + 2);
        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === pagination.page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
        if (pagination.page < pagination.totalPages) {
            html += `<button class="page-btn" onclick="changePage(${pagination.page + 1})">Next</button>`;
        }
    }
    paginationDiv.innerHTML = html;
}

window.changePage = (page) => {
    appState.currentPage = page;
    loadData();
    window.scrollTo(0, 0);
};

// State selection
window.selectState = (state) => {
    appState.selectedState = state;
    appState.currentPage = 1;

    const statesGrid = document.getElementById('states-grid');
    const dataView = document.getElementById('data-view');
    if (statesGrid) {
        statesGrid.classList.add('hidden');
        statesGrid.style.display = 'none';
    }
    if (dataView) {
        dataView.classList.remove('hidden');
        dataView.style.display = '';
    }

    loadData();
};

// Render state cards into the states-grid element
function populateStatesGrid(container) {
    container.innerHTML = states.map(state => `
        <div class="state-card" onclick="selectState('${state}')">
            <i class="fas fa-map-marker-alt"></i>
            <span>${state}</span>
        </div>
    `).join('');
}

// ============================================
// NAVIGATION
// ============================================

function setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const module = item.dataset.module;

            resetNavigation();
            appState.activeSection = module;

            document.querySelectorAll('.nav-item a').forEach(link => link.classList.remove('active'));
            item.querySelector('a').classList.add('active');

            renderActiveSection();
        });
    });

    // Search
    const mainSearch = document.getElementById('main-search');
    if (mainSearch) {
        let searchTimer;
        mainSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                appState.currentSearch = e.target.value;
                appState.currentPage = 1;
                if (appState.selectedState) loadData();
            }, 300);
        });
    }

    // Sort
    const mainSort = document.getElementById('main-sort');

    if (mainSort) {
        mainSort.addEventListener('change', (e) => {
            appState.currentSort = e.target.value;
            appState.currentPage = 1;
            if (appState.selectedState) loadData();
        });
    }

    // Custom filters
    ['tender-filter-dept', 'tender-filter-status', 'job-filter-org', 'job-filter-qual'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                appState.currentPage = 1;
                if (appState.selectedState) loadData();
            });
        }
    });

    // Back button
    const backBtn = document.getElementById('back-to-states');
    if (backBtn) backBtn.addEventListener('click', backToStates);
}

function renderActiveSection() {
    const module = appState.activeSection;

    // Hide all views
    const dashboardView = document.getElementById('dashboard-view');
    const stateNavView = document.getElementById('state-navigation');
    const schemesEnhancedView = document.getElementById('schemes-enhanced-view');
    const legacyElements = document.querySelectorAll('.legacy-view');

    if (dashboardView) dashboardView.classList.add('hidden');
    if (stateNavView) stateNavView.classList.add('hidden');
    if (schemesEnhancedView) schemesEnhancedView.style.display = 'none';
    legacyElements.forEach(el => el.style.display = 'none');

    if (module === 'home') {
        if (dashboardView) dashboardView.classList.remove('hidden');
        loadStats();

    } else if (module === 'schemes') {
        if (stateNavView) stateNavView.classList.remove('hidden');
        if (schemesEnhancedView) schemesEnhancedView.style.display = '';

        if (window.initializeSchemes) {
            window.initializeSchemes();
        }

    } else {
        // Tenders and Recruitments — legacy list view
        if (stateNavView) stateNavView.classList.remove('hidden');

        const moduleTitle = document.getElementById('module-title');
        const moduleDesc = document.getElementById('module-description');
        if (moduleTitle) moduleTitle.textContent = moduleConfigs[module].title;
        if (moduleDesc) moduleDesc.textContent = moduleConfigs[module].description;

        // Show legacy wrapper elements (search bar, grid) but NOT data-view yet
        legacyElements.forEach(el => {
            if (!el.classList.contains('data-view')) {
                el.style.display = '';
            }
        });

        // Toggle filter panels
        const tenderFilters = document.getElementById('tender-filters');
        const jobFilters = document.getElementById('job-filters');
        if (tenderFilters) tenderFilters.style.display = module === 'tenders' ? 'flex' : 'none';
        if (jobFilters) jobFilters.style.display = module === 'recruitments' ? 'flex' : 'none';

        // Load filter options for dropdowns
        loadFilterOptions(module);

        // Show states grid first
        const statesGrid = document.getElementById('states-grid');
        const dataView = document.getElementById('data-view');
        if (dataView) dataView.classList.add('hidden');
        if (statesGrid) {
            statesGrid.classList.remove('hidden');
            statesGrid.style.display = '';
            populateStatesGrid(statesGrid);
        }
    }
}

function resetNavigation() {
    appState.selectedState = null;
    appState.currentPage = 1;
    appState.currentSearch = '';
    appState.currentSort = 'latest';
    appState.schemesData = [];
    appState.tendersData = [];
    appState.recruitmentsData = [];

    const itemsList = document.getElementById('items-list');
    if (itemsList) itemsList.innerHTML = '';

    const pagination = document.getElementById('pagination');
    if (pagination) pagination.innerHTML = '';

    const searchInput = document.getElementById('main-search');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('main-sort');
    if (sortSelect) sortSelect.value = 'latest';
}

function backToStates() {
    appState.selectedState = null;
    appState.currentPage = 1;

    const statesGrid = document.getElementById('states-grid');
    const dataView = document.getElementById('data-view');
    if (statesGrid) {
        statesGrid.classList.remove('hidden');
        statesGrid.style.display = '';
    }
    if (dataView) {
        dataView.classList.add('hidden');
        dataView.style.display = 'none';
    }
}
