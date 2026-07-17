// global-outreach/dashboard.js

// ─── Mode Detection ───────────────────────────────────────────────────────────
// IS_STATIC = true  → GitHub Pages (reads data.json, no Flask needed)
// IS_STATIC = false → local Flask server (uses /api/* endpoints)
const IS_STATIC = (
    window.location.hostname.includes('github.io') ||
    window.location.protocol === 'file:'
);

// Cached no-website CSV string (populated from data.json in static mode)
let _noWebsiteCsv = '';

// Global State
let allLeads  = [];
let configData = {};
let activeTab  = 'overview';

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Adjust UI for static (read-only) mode
    if (IS_STATIC) {
        const scrapeBtn = document.querySelector('[onclick="openScrapeModal()"]');
        if (scrapeBtn) {
            scrapeBtn.title = 'Scraper runs automatically via GitHub Actions';
            scrapeBtn.style.opacity = '0.4';
            scrapeBtn.style.cursor  = 'not-allowed';
            scrapeBtn.onclick = (e) => { e.preventDefault(); alert('Scraper runs automatically every day via GitHub Actions.\nCheck the Actions tab on your repo.'); };
        }
        // Swap CSV link to JS-powered Blob download
        const csvLink = document.getElementById('btn-export-csv');
        if (csvLink) {
            csvLink.removeAttribute('href');
            csvLink.onclick = (e) => { e.preventDefault(); downloadCsvBlob(); };
        }
        // Hide the settings save forms (read-only on Pages)
        const settingsBtn = document.getElementById('btn-tab-settings');
        if (settingsBtn) settingsBtn.style.display = 'none';
    }
    fetchData();
});

// Switch Dashboard Tabs
function switchTab(tabId) {
    activeTab = tabId;
    
    // Deactivate all nav buttons and hide tab contents
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // Activate target nav button and show content
    const navBtn = document.getElementById(`btn-tab-${tabId}`);
    if (navBtn) navBtn.classList.add('active');
    
    // FIX #1: removed dead `tabPane` variable that was queried but never used
    const pageTitle    = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    
    if (tabId === 'overview') {
        document.getElementById('tab-overview').classList.add('active');
        pageTitle.innerText    = "Outreach Overview";
        pageSubtitle.innerText = "Metrics and campaign status across dermatologists and dentists";
        // FIX #10: actually render overview on tab switch
        renderOverview();
    } else if (tabId === 'nowebsite') {
        document.getElementById('tab-nowebsite').classList.add('active');
        pageTitle.innerText = "No-Website Profiles";
        pageSubtitle.innerText = "Leads without websites (downloadable for manual outreach)";
        renderNoWebsiteTable();
    } else if (tabId === 'campaign') {
        document.getElementById('tab-campaign').classList.add('active');
        pageTitle.innerText = "Outreach Queue";
        pageSubtitle.innerText = "Campaign tracker for leads with old/unresponsive websites";
        renderCampaignTable();
    } else if (tabId === 'modern') {
        document.getElementById('tab-modern').classList.add('active');
        pageTitle.innerText = "Filtered Modern Sites";
        pageSubtitle.innerText = "Profiles excluded from campaign (website is modern and secure)";
        renderModernTable();
    } else if (tabId === 'settings') {
        document.getElementById('tab-settings').classList.add('active');
        pageTitle.innerText = "Outreach Settings";
        pageSubtitle.innerText = "Configure campaign limits, templates, and promotional endpoints";
        fetchConfig();
    }
}

// Fetch Leads & Stats — auto-detects GitHub Pages vs local Flask
async function fetchData() {
    const refreshIcon = document.getElementById('refresh-icon');
    if (refreshIcon) refreshIcon.classList.add('spinning');
    
    try {
        let stats;

        if (IS_STATIC) {
            // ── GitHub Pages mode: single fetch of data.json ──────────────
            const res = await fetch('data.json?t=' + Date.now()); // cache-bust
            if (!res.ok) throw new Error(`data.json fetch failed: HTTP ${res.status}`);
            const data = await res.json();

            allLeads      = data.leads  || [];
            stats         = data.stats  || {};
            _noWebsiteCsv = data.no_website_csv || '';

            // Show last-updated timestamp
            if (data.generated_at) {
                const ts = new Date(data.generated_at);
                const el = document.getElementById('page-subtitle');
                if (el) el.innerText += `  ·  Last updated: ${formatDate(data.generated_at)}`;
            }
        } else {
            // ── Local Flask mode: parallel API calls ──────────────────────
            const [leadsRes, statsRes] = await Promise.all([
                fetch('/api/leads'),
                fetch('/api/stats')
            ]);
            if (!leadsRes.ok || !statsRes.ok) {
                throw new Error(`API error: leads=${leadsRes.status} stats=${statsRes.status}`);
            }
            allLeads = await leadsRes.json();
            stats    = await statsRes.json();
        }

        // Update KPI cards
        document.getElementById('kpi-total').innerText      = stats.total      ?? 0;
        document.getElementById('kpi-no-website').innerText = stats.no_website ?? 0;
        document.getElementById('kpi-old-website').innerText = stats.old_website ?? 0;
        document.getElementById('kpi-sent').innerText       = stats.sent       ?? 0;
        document.getElementById('kpi-replied').innerText    = stats.replied    ?? 0;
        document.getElementById('kpi-conversion').innerText = (stats.conversion_rate ?? 0) + '%';

        // Update sidebar badges
        document.getElementById('badge-count-nowebsite').innerText = stats.no_website ?? 0;
        document.getElementById('badge-count-campaign').innerText  = stats.old_website ?? 0;

        // Render current tab
        if      (activeTab === 'overview')   renderOverview();
        else if (activeTab === 'nowebsite')  renderNoWebsiteTable();
        else if (activeTab === 'campaign')   renderCampaignTable();
        else if (activeTab === 'modern')     renderModernTable();

    } catch (err) {
        console.error('Dashboard data error:', err);
        if (IS_STATIC) {
            alert('Could not load data.json.\nMake sure GitHub Actions has run at least once to generate it.');
        } else {
            alert('Could not connect to local server. Make sure run_dashboard.py is running.');
        }
    } finally {
        if (refreshIcon) {
            setTimeout(() => refreshIcon.classList.remove('spinning'), 600);
        }
    }
}

// Render Overview page widgets
function renderOverview() {
    const listContainer = document.getElementById('recent-leads-list');
    if (!allLeads || allLeads.length === 0) {
        listContainer.innerHTML = '<p class="placeholder-text">No leads scraped yet. Trigger the scraper to start collecting!</p>';
        return;
    }
    
    // Get 5 most recent leads
    const recentLeads = allLeads.slice(0, 5);
    listContainer.innerHTML = '';
    
    recentLeads.forEach(lead => {
        const item = document.createElement('div');
        item.className = 'recent-lead-item';
        
        let statusTagClass = 'tag-no-web';
        if (lead.status === 'Old Website') statusTagClass = 'tag-old-web';
        if (lead.status === 'No Booking/AI') statusTagClass = 'tag-no-booking';
        if (lead.status === 'Modern Website') statusTagClass = 'tag-modern-web';
        
        item.innerHTML = `
            <div class="lead-info-main">
                <h4>${escapeHtml(lead.name)}</h4>
                <p>${escapeHtml(lead.query)} in ${escapeHtml(lead.location)} | Scraped ${formatDate(lead.scraped_at)}</p>
            </div>
            <span class="lead-status-tag ${statusTagClass}">${escapeHtml(lead.status)}</span>
        `;
        listContainer.appendChild(item);
    });
}

// Render No-Website Table with Filters & Search
function renderNoWebsiteTable() {
    const searchVal = document.getElementById('search-nowebsite').value.toLowerCase().trim();
    const tbody = document.getElementById('body-nowebsite');
    
    // Filter
    const filtered = allLeads.filter(lead => {
        if (lead.status !== 'No Website') return false;
        
        if (searchVal) {
            const nameMatch = lead.name.toLowerCase().includes(searchVal);
            const cityMatch = lead.location.toLowerCase().includes(searchVal);
            const phoneMatch = (lead.phone || '').toLowerCase().includes(searchVal);
            const addressMatch = (lead.address || '').toLowerCase().includes(searchVal);
            return nameMatch || cityMatch || phoneMatch || addressMatch;
        }
        return true;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="placeholder-text">${searchVal ? 'No matching profiles found.' : 'No profiles in this category.'}</td></tr>`;
        return;
    }
    
    tbody.innerHTML = '';
    filtered.forEach(lead => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(lead.name)}</strong></td>
            <td>${escapeHtml(lead.phone || 'N/A')}</td>
            <td>${escapeHtml(lead.address || 'N/A')}</td>
            <td>${escapeHtml(lead.query)}</td>
            <td>${escapeHtml(lead.location)}</td>
            <td>${formatDate(lead.scraped_at)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Campaign Table
function renderCampaignTable() {
    const searchVal = document.getElementById('search-campaign').value.toLowerCase().trim();
    const emailFilter = document.getElementById('filter-email-status').value;
    const tbody = document.getElementById('body-campaign');
    
    // Filter
    const filtered = allLeads.filter(lead => {
        if (lead.status !== 'Old Website' && lead.status !== 'No Booking/AI') return false;
        if (!lead.email || lead.email.trim() === '') return false;
        
        if (emailFilter !== 'ALL') {
            if (lead.email_status !== emailFilter) return false;
        }
        
        if (searchVal) {
            const nameMatch = lead.name.toLowerCase().includes(searchVal);
            const emailMatch = (lead.email || '').toLowerCase().includes(searchVal);
            const cityMatch = lead.location.toLowerCase().includes(searchVal);
            const noteMatch = (lead.website_notes || '').toLowerCase().includes(searchVal);
            return nameMatch || emailMatch || cityMatch || noteMatch;
        }
        return true;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="placeholder-text">${searchVal || emailFilter !== 'ALL' ? 'No matching campaign profiles found.' : 'No campaigns in queue.'}</td></tr>`;
        return;
    }
    
    tbody.innerHTML = '';
    filtered.forEach(lead => {
        const tr = document.createElement('tr');
        
        let statusTag = 'tag-email-not-sent';
        if (lead.email_status === 'Sent') statusTag = 'tag-email-sent';
        if (lead.email_status === 'Sent (Dry Run)') statusTag = 'tag-email-sent';
        if (lead.email_status === 'Replied') statusTag = 'tag-email-replied';
        if (lead.email_status === 'Failed') statusTag = 'tag-email-failed';
        
        tr.innerHTML = `
            <td><strong>${escapeHtml(lead.name)}</strong><br><span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(lead.location)}</span></td>
            <td><a href="${escapeHtml(lead.website)}" target="_blank" class="truncate">${escapeHtml(lead.website)}</a></td>
            <td><code>${escapeHtml(lead.email)}</code></td>
            <td><span class="lead-status-tag ${statusTag}">${escapeHtml(lead.email_status)}</span></td>
            <td>${lead.sent_at ? formatDate(lead.sent_at) : '—'}</td>
            <td>${lead.email_status === 'Replied' ? '<strong style="color: var(--color-success);">Replied! Check Inbox</strong>' : escapeHtml(lead.website_notes || '')}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Filtered Modern Table
function renderModernTable() {
    const searchVal = document.getElementById('search-modern').value.toLowerCase().trim();
    const tbody = document.getElementById('body-modern');
    
    // Filter
    const filtered = allLeads.filter(lead => {
        if (lead.status !== 'Modern Website') return false;
        
        if (searchVal) {
            const nameMatch = lead.name.toLowerCase().includes(searchVal);
            const webMatch = (lead.website || '').toLowerCase().includes(searchVal);
            const cityMatch = lead.location.toLowerCase().includes(searchVal);
            return nameMatch || webMatch || cityMatch;
        }
        return true;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="placeholder-text">${searchVal ? 'No matching profiles found.' : 'No profiles in this category.'}</td></tr>`;
        return;
    }
    
    tbody.innerHTML = '';
    filtered.forEach(lead => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(lead.name)}</strong></td>
            <td><a href="${escapeHtml(lead.website)}" target="_blank">${escapeHtml(lead.website)}</a></td>
            <td>${lead.website_viewport === 1 ? '<span style="color: var(--color-success);">Responsive (Viewport meta)</span>' : '<span style="color: var(--color-danger);">Non-Responsive</span>'}</td>
            <td>${lead.website_ssl === 1 ? '<span style="color: var(--color-success);">Secure (HTTPS)</span>' : '<span style="color: var(--color-danger);">HTTP Only</span>'}</td>
            <td>${lead.website_copyright_year || 'Unknown'}</td>
            <td>${escapeHtml(lead.location)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Search Filter Handlers
function filterTable(type) {
    if (type === 'nowebsite') renderNoWebsiteTable();
    if (type === 'campaign') renderCampaignTable();
    if (type === 'modern') renderModernTable();
}

// Fetch config from server for settings page
async function fetchConfig() {
    try {
        const res = await fetch('/api/config');
        if (!res.ok) throw new Error('Failed to load configuration');
        
        configData = await res.json();
        
        // Populate form fields
        document.getElementById('config-limit').value = configData.daily_email_limit;
        document.getElementById('config-promo-dental').value = configData.promo_urls.dental;
        document.getElementById('config-promo-derm').value = configData.promo_urls.derm;
        
        // Load initial templates niche
        loadTemplateNiche();
        
    } catch (err) {
        console.error('Error fetching settings config:', err);
    }
}

// Toggle niche selection inside template editor
// FIX #7: guard against configData being empty (called before fetchConfig resolves)
function loadTemplateNiche() {
    if (!configData || !configData.email_templates) return;
    const niche    = document.getElementById('template-niche').value;
    const template = configData.email_templates[niche];
    if (!template) return;
    document.getElementById('template-subject').value = template.subject || '';
    document.getElementById('template-body').value    = template.body    || '';
}

// Save Config Form
async function saveConfig(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save-config');
    btn.innerText = "Saving...";
    btn.disabled = true;
    
    configData.daily_email_limit = parseInt(document.getElementById('config-limit').value);
    configData.promo_urls.dental = document.getElementById('config-promo-dental').value.trim();
    configData.promo_urls.derm = document.getElementById('config-promo-derm').value.trim();
    
    try {
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(configData)
        });
        
        if (!res.ok) throw new Error('Save API request failed');
        alert('Configuration settings saved successfully.');
    } catch (err) {
        console.error('Error saving config settings:', err);
        alert('Failed to save configuration settings.');
    } finally {
        btn.innerText = "Save Configuration";
        btn.disabled = false;
    }
}

// Save Templates Form
async function saveTemplates(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save-templates');
    btn.innerText = "Saving Template...";
    btn.disabled = true;
    
    const niche = document.getElementById('template-niche').value;
    configData.email_templates[niche] = {
        subject: document.getElementById('template-subject').value.trim(),
        body: document.getElementById('template-body').value.trim()
    };
    
    try {
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(configData)
        });
        
        if (!res.ok) throw new Error('Save template request failed');
        alert('Email campaign template saved.');
    } catch (err) {
        console.error('Error saving campaign template:', err);
        alert('Failed to save template.');
    } finally {
        btn.innerText = "Save Template";
        btn.disabled = false;
    }
}

// Modal Controllers
function openScrapeModal() {
    document.getElementById('modal-scrape').classList.add('active');
}

function closeScrapeModal() {
    document.getElementById('modal-scrape').classList.remove('active');
}

// Submit manual scraper background job
async function submitScrapeJob(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('btn-submit-scrape');
    submitBtn.innerText = "Starting Job...";
    submitBtn.disabled = true;
    
    const keyword = document.getElementById('scrape-keyword').value;
    const city = document.getElementById('scrape-city').value.trim();
    const limit = document.getElementById('scrape-limit').value;
    const dryRun = document.getElementById('scrape-dryrun').checked;
    
    try {
        const res = await fetch('/api/trigger-scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                limit: parseInt(limit),
                keyword: keyword || null,
                city: city || null,
                dry_run: dryRun
            })
        });
        
        if (!res.ok) throw new Error('Job execution trigger failed');
        
        const payload = await res.json();
        alert(payload.message || 'Scraper background job started.');
        closeScrapeModal();
        
        // Refresh data in a few seconds to see changes
        setTimeout(fetchData, 4000);
        
    } catch (err) {
        console.error('Error triggering scrape job:', err);
        alert('Failed to trigger background scrape job. Make sure the backend server is running.');
    } finally {
        submitBtn.innerText = "Start Scraper Job";
        submitBtn.disabled = false;
    }
}

// CSV Blob download (used in static / GitHub Pages mode)
function downloadCsvBlob() {
    if (!_noWebsiteCsv) {
        alert('No No-Website leads to export yet.');
        return;
    }
    const blob = new Blob([_noWebsiteCsv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'no_website_leads.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Helper: Escape HTML to prevent injection
function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Helper: Format Date String
function formatDate(isoStr) {
    if (!isoStr) return '—';
    try {
        const date = new Date(isoStr);
        // Simple human readable layout e.g. "Jul 16, 2026, 13:00"
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + ', ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (e) {
        return isoStr;
    }
}
