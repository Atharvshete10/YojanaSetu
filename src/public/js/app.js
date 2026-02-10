const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Central"
];

let currentModule = 'home';
let currentState = null;
let currentPage = 1;
let currentSearch = '';
let currentSort = 'latest';

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
        api: '/api/schemes',
        renderItem: (item) => `
            <div class="item-card">
                <h3>${item.title}</h3>
                <div class="item-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${item.state}</span>
                    <span><i class="fas fa-tag"></i> ${item.category}</span>
                    <span><i class="fas fa-calendar-alt"></i> Ends: ${item.end_date || 'N/A'}</span>
                </div>
                <p>${item.description}</p>
                <div style="margin-top: 1rem;">
                    <strong>Eligibility:</strong> ${item.eligibility_criteria}
                </div>
                <a href="${item.source_url}" target="_blank" class="btn-link" style="display:inline-block; margin-top: 1rem; color: var(--accent-color); text-decoration: none; font-weight: 600;">View Details <i class="fas fa-external-link-alt"></i></a>
            </div>
        `
    },
    tenders: {
        title: 'Latest Tenders',
        description: 'Explore business opportunities with the government.',
        api: '/api/tenders',
        renderItem: (item) => `
            <div class="item-card" style="border-left-color: #28a745;">
                <h3>${item.tender_name}</h3>
                <div class="item-meta">
                    <span><i class="fas fa-id-card"></i> ${item.tender_id}</span>
                    <span><i class="fas fa-building"></i> ${item.department}</span>
                    <span><i class="fas fa-clock"></i> Closes: ${item.closing_date}</span>
                </div>
                <p>${item.description || 'No description available.'}</p>
                <div style="margin-top: 1rem;">
                    <strong>Type:</strong> ${item.tender_type} | <strong>Fee:</strong> ${item.fee_details}
                </div>
                <a href="${item.source_url}" target="_blank" class="btn-link" style="display:inline-block; margin-top: 1rem; color: #28a745; text-decoration: none; font-weight: 600;">View Tender <i class="fas fa-external-link-alt"></i></a>
            </div>
        `
    },
    recruitments: {
        title: 'Government Recruitments',
        description: 'Build your career in the public sector.',
        api: '/api/recruitments',
        renderItem: (item) => `
            <div class="item-card" style="border-left-color: #6f42c1;">
                <h3>${item.post_name}</h3>
                <div class="item-meta">
                    <span><i class="fas fa-university"></i> ${item.organization}</span>
                    <span><i class="fas fa-users"></i> Vacancies: ${item.vacancy_count}</span>
                    <span><i class="fas fa-calendar-check"></i> Deadline: ${item.application_end_date}</span>
                </div>
                <div style="margin-top: 1rem;">
                    <strong>Qualification:</strong> ${item.qualification} | <strong>Age Limit:</strong> ${item.age_limit}
                </div>
                <a href="${item.source_url}" target="_blank" class="btn-link" style="display:inline-block; margin-top: 1rem; color: #6f42c1; text-decoration: none; font-weight: 600;">Apply Now <i class="fas fa-external-link-alt"></i></a>
            </div>
        `
    }
};

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    renderStates();
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

function renderStates() {
    const statesGrid = document.getElementById('states-grid');
    statesGrid.innerHTML = states.map(state => `
        <div class="state-card" onclick="selectState('${state}')">
            <i class="fas fa-map-location-dot"></i>
            <h3>${state}</h3>
        </div>
    `).join('');
}

window.selectState = (state) => {
    currentState = state;
    currentPage = 1;
    document.getElementById('states-grid').classList.add('hidden');
    document.getElementById('data-view').classList.remove('hidden');
    loadData();
};

async function loadData() {
    const config = moduleConfigs[currentModule];
    const itemsList = document.getElementById('items-list');

    itemsList.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const url = new URL(config.api, window.location.origin);
        if (currentState) url.searchParams.append('state', currentState);
        if (currentSearch) url.searchParams.append('search', currentSearch);
        if (currentSort) url.searchParams.append('sort', currentSort);
        url.searchParams.append('page', currentPage);

        const response = await fetch(url);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            itemsList.innerHTML = result.data.map(item => config.renderItem(item)).join('');
            renderPagination(result.pagination);
        } else {
            itemsList.innerHTML = '<div class="no-data">No records found for this selection.</div>';
            document.getElementById('pagination').innerHTML = '';
        }
    } catch (error) {
        itemsList.innerHTML = '<div class="error">Failed to load data. Please try again later.</div>';
    }
}

function renderPagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    let html = '';

    if (pagination.totalPages > 1) {
        for (let i = 1; i <= pagination.totalPages; i++) {
            html += `<button class="page-btn ${i === pagination.page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
    }

    paginationDiv.innerHTML = html;
}

window.changePage = (page) => {
    currentPage = page;
    loadData();
    window.scrollTo(0, 0);
};

function setupEventListeners() {
    // Module switching
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const module = item.dataset.module;

            // Update active state
            document.querySelectorAll('.nav-item a').forEach(link => link.classList.remove('active'));
            item.querySelector('a').classList.add('active');

            // Hide all sections
            document.getElementById('dashboard-view').classList.add('hidden');
            document.getElementById('state-navigation').classList.add('hidden');

            if (module === 'home') {
                document.getElementById('dashboard-view').classList.remove('hidden');
                loadStats(); // Changed from loadDashboardStats to loadStats as per existing function
            } else {
                // For schemes, tenders and recruitments, use legacy view
                document.getElementById('state-navigation').classList.remove('hidden');
                document.getElementById('module-title').textContent = moduleConfigs[module].title;
                document.getElementById('module-description').textContent = moduleConfigs[module].description;

                // Hide enhanced schemes view, show legacy views
                if (document.getElementById('schemes-enhanced-view')) {
                    document.getElementById('schemes-enhanced-view').style.display = 'none';
                }
                document.querySelectorAll('.legacy-view').forEach(el => el.style.display = '');

                currentModule = module;
                renderStates();
            }
        });
    });

    // Search and Sort
    document.getElementById('main-search').addEventListener('input', (e) => {
        currentSearch = e.target.value;
        currentPage = 1;
        if (currentState) loadData();
    });

    document.getElementById('main-sort').addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        if (currentState) loadData();
    });

    // Back button
    document.getElementById('back-to-states').addEventListener('click', backToStates);
}

function backToStates() {
    currentState = null;
    currentPage = 1;
    document.getElementById('states-grid').classList.remove('hidden');
    document.getElementById('data-view').classList.add('hidden');
}
