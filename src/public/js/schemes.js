// Enhanced Schemes Browsing - Phase 4
// Handles scheme loading, filtering, search, expandable cards, and eligibility checking

const API_BASE = '/api';
let currentFilters = {};
let currentPage = 1;
let searchDebounceTimer = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the schemes module
    const schemesView = document.getElementById('schemes-enhanced-view');
    if (!schemesView) return;

    initializeSchemes();
});

async function initializeSchemes() {
    await loadFilterOptions();
    await loadSchemes();
    setupEventListeners();
}

// ============================================
// FILTER OPTIONS
// ============================================

async function loadFilterOptions() {
    try {
        const response = await fetch(`${API_BASE}/schemes/filters`);
        const data = await response.json();

        if (data.success) {
            populateFilterDropdowns(data.filters);
        }
    } catch (error) {
        console.error('Error loading filter options:', error);
    }
}

function populateFilterDropdowns(filters) {
    // Populate state filter
    const stateSelect = document.getElementById('filter-state');
    if (stateSelect && filters.states) {
        filters.states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }

    // Populate category filter
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect && filters.categories) {
        filters.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // Populate ministry filter
    const ministrySelect = document.getElementById('filter-ministry');
    if (ministrySelect && filters.ministries) {
        filters.ministries.forEach(ministry => {
            const option = document.createElement('option');
            option.value = ministry;
            option.textContent = ministry;
            ministrySelect.appendChild(option);
        });
    }

    // Populate level filter
    const levelSelect = document.getElementById('filter-level');
    if (levelSelect && filters.levels) {
        filters.levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = level;
            levelSelect.appendChild(option);
        });
    }

    // Populate eligibility modal state dropdown
    const eligStateSelect = document.getElementById('elig-state');
    if (eligStateSelect && filters.states) {
        filters.states.forEach(state => {
            if (state !== 'All India') {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                eligStateSelect.appendChild(option);
            }
        });
    }
}

// ============================================
// LOAD SCHEMES
// ============================================

async function loadSchemes(page = 1) {
    currentPage = page;

    const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...currentFilters
    });

    try {
        const response = await fetch(`${API_BASE}/schemes?${queryParams}`);
        const data = await response.json();

        if (data.success) {
            renderSchemeCards(data.data);
            updatePagination(data.pagination);
            updateResultsCount(data.pagination.total);
        }
    } catch (error) {
        console.error('Error loading schemes:', error);
        showError('Failed to load schemes. Please try again.');
    }
}

function renderSchemeCards(schemes) {
    const grid = document.getElementById('schemes-grid');

    if (!schemes || schemes.length === 0) {
        grid.innerHTML = '<div class="loading-state"><p>No schemes found. Try adjusting your filters.</p></div>';
        return;
    }

    grid.innerHTML = schemes.map(scheme => createSchemeCard(scheme)).join('');
}

function createSchemeCard(scheme) {
    const levelClass = scheme.level === 'State' ? 'state' : '';
    const tags = scheme.tags || [];
    const states = Array.isArray(scheme.applicable_states) ? scheme.applicable_states : [];

    return `
        <div class="scheme-card" data-slug="${scheme.slug}">
            <div class="card-header">
                <h3>${scheme.title}</h3>
                <span class="scheme-level ${levelClass}">${scheme.level || 'Central'}</span>
            </div>
            <div class="card-body">
                <p class="scheme-description">${scheme.description || 'No description available.'}</p>
                <div class="scheme-meta">
                    <span><i class="fas fa-building"></i> ${scheme.ministry || 'N/A'}</span>
                    <span><i class="fas fa-tag"></i> ${scheme.category || 'N/A'}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${states.slice(0, 2).join(', ')}${states.length > 2 ? '...' : ''}</span>
                </div>
                ${tags.length > 0 ? `
                    <div class="scheme-tags">
                        ${tags.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="card-footer">
                <button class="btn-expand" onclick="toggleCard('${scheme.slug}')">
                    <i class="fas fa-chevron-down"></i> View Details
                </button>
            </div>
            <div class="card-expanded" style="display: none;">
                <div class="expanded-content">
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading details...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// EXPANDABLE CARD
// ============================================

window.toggleCard = async function (slug) {
    const card = document.querySelector(`[data-slug="${slug}"]`);
    const expanded = card.querySelector('.card-expanded');
    const button = card.querySelector('.btn-expand');

    if (expanded.style.display === 'none') {
        // Expand
        expanded.style.display = 'block';
        button.classList.add('expanded');
        button.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Details';

        // Load details if not already loaded
        if (!card.dataset.loaded) {
            await loadSchemeDetails(slug);
            card.dataset.loaded = 'true';
        }
    } else {
        // Collapse
        expanded.style.display = 'none';
        button.classList.remove('expanded');
        button.innerHTML = '<i class="fas fa-chevron-down"></i> View Details';
    }
};

async function loadSchemeDetails(slug) {
    try {
        const response = await fetch(`${API_BASE}/schemes/${slug}`);
        const data = await response.json();

        if (data.success) {
            populateExpandedSection(slug, data.data);
        }
    } catch (error) {
        console.error('Error loading scheme details:', error);
    }
}

function populateExpandedSection(slug, scheme) {
    const card = document.querySelector(`[data-slug="${slug}"]`);
    const content = card.querySelector('.expanded-content');

    let html = '';

    // Benefits
    if (scheme.benefits && scheme.benefits.length > 0) {
        html += `
            <section class="benefits-section">
                <h4><i class="fas fa-gift"></i> Benefits</h4>
                <ul>
                    ${scheme.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
            </section>
        `;
    }

    // Eligibility
    if (scheme.eligibility) {
        html += `
            <section class="eligibility-section">
                <h4><i class="fas fa-user-check"></i> Eligibility Criteria</h4>
                <div>
                    ${formatEligibility(scheme.eligibility)}
                </div>
            </section>
        `;
    }

    // Application Process
    if (scheme.application_process) {
        html += `
            <section class="application-section">
                <h4><i class="fas fa-clipboard-list"></i> How to Apply</h4>
                <div>
                    ${formatApplicationProcess(scheme.application_process)}
                </div>
            </section>
        `;
    }

    // Documents Required
    if (scheme.documents_required && scheme.documents_required.length > 0) {
        html += `
            <section class="documents-section">
                <h4><i class="fas fa-file-alt"></i> Required Documents</h4>
                <ul>
                    ${scheme.documents_required.map(doc => `<li>${doc}</li>`).join('')}
                </ul>
            </section>
        `;
    }

    // FAQs
    if (scheme.faqs && scheme.faqs.length > 0) {
        html += `
            <section class="faqs-section">
                <h4><i class="fas fa-question-circle"></i> Frequently Asked Questions</h4>
                ${scheme.faqs.map(faq => `
                    <div style="margin-bottom: 1rem;">
                        <strong style="color: var(--primary-color);">Q: ${faq.question}</strong>
                        <p style="margin-top: 0.5rem;">${faq.answer}</p>
                    </div>
                `).join('')}
            </section>
        `;
    }

    // Contact Info
    if (scheme.contact_info) {
        html += `
            <section class="contact-section">
                <h4><i class="fas fa-phone"></i> Contact Information</h4>
                <div>
                    ${formatContactInfo(scheme.contact_info)}
                </div>
            </section>
        `;
    }

    content.innerHTML = html || '<p>No additional details available.</p>';
}

function formatEligibility(eligibility) {
    let html = '<ul style="list-style: disc; padding-left: 1.5rem;">';

    if (eligibility.age) {
        html += `<li>Age: ${eligibility.age.min || 0} - ${eligibility.age.max || 'No limit'} years</li>`;
    }
    if (eligibility.income) {
        html += `<li>Annual Income: Up to ₹${eligibility.income.max?.toLocaleString() || 'N/A'}</li>`;
    }
    if (eligibility.category) {
        const categories = Array.isArray(eligibility.category) ? eligibility.category.join(', ') : eligibility.category;
        html += `<li>Category: ${categories}</li>`;
    }
    if (eligibility.gender) {
        html += `<li>Gender: ${eligibility.gender}</li>`;
    }

    html += '</ul>';
    return html;
}

function formatApplicationProcess(process) {
    let html = '';

    if (process.online_url) {
        html += `<p><strong>Apply Online:</strong> <a href="${process.online_url}" target="_blank" style="color: var(--primary-color);">${process.online_url}</a></p>`;
    }

    if (process.steps && process.steps.length > 0) {
        html += '<ol style="padding-left: 1.5rem;">';
        process.steps.forEach(step => {
            html += `<li>${step}</li>`;
        });
        html += '</ol>';
    }

    if (process.offline_process) {
        html += `<p><strong>Offline Process:</strong> ${process.offline_process}</p>`;
    }

    return html || '<p>Application process details not available.</p>';
}

function formatContactInfo(contact) {
    let html = '<div style="line-height: 1.8;">';

    if (contact.phone) html += `<p><i class="fas fa-phone"></i> ${contact.phone}</p>`;
    if (contact.email) html += `<p><i class="fas fa-envelope"></i> ${contact.email}</p>`;
    if (contact.website) html += `<p><i class="fas fa-globe"></i> <a href="${contact.website}" target="_blank" style="color: var(--primary-color);">${contact.website}</a></p>`;
    if (contact.address) html += `<p><i class="fas fa-map-marker-alt"></i> ${contact.address}</p>`;

    html += '</div>';
    return html;
}

// ============================================
// SEARCH
// ============================================

function setupSearch() {
    const searchInput = document.getElementById('scheme-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            searchSchemes(e.target.value);
        }, 300);
    });
}

async function searchSchemes(query) {
    if (!query || query.trim() === '') {
        delete currentFilters.q;
        await loadSchemes(1);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/schemes/search?q=${encodeURIComponent(query)}&limit=12`);
        const data = await response.json();

        if (data.success) {
            renderSchemeCards(data.data);
            updateResultsCount(data.pagination.total);
        }
    } catch (error) {
        console.error('Error searching schemes:', error);
    }
}

// ============================================
// FILTERS
// ============================================

function setupFilters() {
    const filterSelects = ['filter-state', 'filter-category', 'filter-ministry', 'filter-level'];

    filterSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.addEventListener('change', handleFilterChange);
        }
    });

    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }
}

function handleFilterChange(e) {
    const filterName = e.target.id.replace('filter-', '');
    const value = e.target.value;

    if (value) {
        currentFilters[filterName] = value;
    } else {
        delete currentFilters[filterName];
    }

    loadSchemes(1);
}

function clearFilters() {
    currentFilters = {};

    document.getElementById('filter-state').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-ministry').value = '';
    document.getElementById('filter-level').value = '';

    loadSchemes(1);
}

// ============================================
// PAGINATION
// ============================================

function updatePagination(pagination) {
    const paginationDiv = document.getElementById('schemes-pagination');
    if (!paginationDiv || !pagination) return;

    if (pagination.totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `<button class="page-btn" ${pagination.page === 1 ? 'disabled' : ''} onclick="loadSchemes(${pagination.page - 1})">Previous</button>`;

    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === pagination.page) {
            html += `<button class="page-btn active">${i}</button>`;
        } else if (i === 1 || i === pagination.totalPages || (i >= pagination.page - 2 && i <= pagination.page + 2)) {
            html += `<button class="page-btn" onclick="loadSchemes(${i})">${i}</button>`;
        } else if (i === pagination.page - 3 || i === pagination.page + 3) {
            html += `<button class="page-btn" disabled>...</button>`;
        }
    }

    // Next button
    html += `<button class="page-btn" ${pagination.page === pagination.totalPages ? 'disabled' : ''} onclick="loadSchemes(${pagination.page + 1})">Next</button>`;

    paginationDiv.innerHTML = html;
}

function updateResultsCount(total) {
    const countEl = document.getElementById('results-count');
    if (countEl) {
        countEl.textContent = `Showing ${total} scheme${total !== 1 ? 's' : ''}`;
    }
}

// ============================================
// ELIGIBILITY CHECKER
// ============================================

window.showEligibilityModal = function () {
    document.getElementById('eligibility-modal').style.display = 'block';
};

window.closeEligibilityModal = function () {
    document.getElementById('eligibility-modal').style.display = 'none';
    document.getElementById('eligibility-results').style.display = 'none';
    document.getElementById('eligibility-form').reset();
};

function setupEligibilityChecker() {
    const btn = document.getElementById('check-eligibility-btn');
    if (btn) {
        btn.addEventListener('click', showEligibilityModal);
    }

    const form = document.getElementById('eligibility-form');
    if (form) {
        form.addEventListener('submit', handleEligibilityCheck);
    }
}

async function handleEligibilityCheck(e) {
    e.preventDefault();

    const formData = {
        age: parseInt(document.getElementById('elig-age').value),
        gender: document.getElementById('elig-gender').value,
        state: document.getElementById('elig-state').value,
        category: document.getElementById('elig-category').value,
        annual_income: parseInt(document.getElementById('elig-income').value) || 0,
        employment_status: document.getElementById('elig-employment').value,
        has_bank_account: document.getElementById('elig-bank-account').checked
    };

    try {
        const response = await fetch(`${API_BASE}/eligibility/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            displayEligibilityResults(data);
        }
    } catch (error) {
        console.error('Error checking eligibility:', error);
        showError('Failed to check eligibility. Please try again.');
    }
}

function displayEligibilityResults(data) {
    const resultsDiv = document.getElementById('eligibility-results');

    if (data.eligible_count === 0) {
        resultsDiv.innerHTML = '<h3 style="color: #f59e0b;">No matching schemes found</h3><p>Try adjusting your criteria.</p>';
    } else {
        resultsDiv.innerHTML = `
            <h3>You are eligible for ${data.eligible_count} scheme${data.eligible_count !== 1 ? 's' : ''}!</h3>
            <div class="eligible-schemes">
                ${data.schemes.map(scheme => `
                    <div class="eligible-scheme-card">
                        <h4>${scheme.title}</h4>
                        <div class="match-score">
                            <span>Match Score: ${scheme.match_score}%</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${scheme.match_score}%"></div>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="viewSchemeFromEligibility('${scheme.slug}')">
                            View Details
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    resultsDiv.style.display = 'block';
}

window.viewSchemeFromEligibility = function (slug) {
    closeEligibilityModal();
    // Scroll to the scheme card
    const card = document.querySelector(`[data-slug="${slug}"]`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toggleCard(slug);
    }
};

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    setupSearch();
    setupFilters();
    setupEligibilityChecker();
}

// ============================================
// UTILITY
// ============================================

function showError(message) {
    const grid = document.getElementById('schemes-grid');
    if (grid) {
        grid.innerHTML = `<div class="loading-state"><p style="color: #e74c3c;">${message}</p></div>`;
    }
}

// Export for use in app.js
window.initializeSchemes = initializeSchemes;
