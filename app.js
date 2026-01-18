document.addEventListener('DOMContentLoaded', init);

const DATA_SOURCE = './data.json';

async function init() {
    try {
        const response = await fetch(DATA_SOURCE);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        renderHero(data.profile);
        setupFilters(data.projects);
        renderProjects(data.projects);
        initFooter();

    } catch (error) {
        console.error('CRITICAL SYSTEM FAILURE: Data stream interrupted.', error);
        document.querySelector('main').innerHTML = `<div style="text-align:center; padding:2rem; color:red;">[SYSTEM OFFLINE] CHECK CONSOLE</div>`;
    }
}

function renderHero(profile) {
    const heroContainer = document.getElementById('hero');
    if (!heroContainer || !profile) return;

    heroContainer.innerHTML = `
        <div class="hero-left">
            <h1>${profile.name}</h1>
            <div class="subtitle">${profile.role}</div>
            <p class="tagline">${profile.tagline}</p>
        </div>
        <div class="hero-right">
            <div class="social-links">
                <a href="${profile.github}" target="_blank" class="btn-link">[GITHUB]</a>
                <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono); letter-spacing: 1px;">
                    ${profile.email}
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #3498db; font-family: var(--font-mono); letter-spacing: 1px; font-weight: 700;">
                    ${profile.location}
                </div>
            </div>
        </div>
    `;
}

function setupFilters(projects) {
    const filterContainer = document.getElementById('filters');
    if (!filterContainer) return;

    const allTags = new Set();
    projects.forEach(project => {
        if (Array.isArray(project.tags)) {
            project.tags.forEach(tag => allTags.add(tag));
        }
    });

    const allBtn = createFilterButton('ALL', 'all', true);
    filterContainer.appendChild(allBtn);

    allTags.forEach(tag => {
        filterContainer.appendChild(createFilterButton(tag.toUpperCase(), tag));
    });

    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.dataset.filter;
        renderProjects(projects, filterValue);
    });
}

function createFilterButton(label, value, isActive = false) {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${isActive ? 'active' : ''}`;
    btn.textContent = `[${label}]`;
    btn.dataset.filter = value;
    return btn;
}

function renderProjects(projects, filter = 'all') {
    const grid = document.getElementById('project-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.tags.some(t => t.toLowerCase() === filter.toLowerCase()));

    if (filteredProjects.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim);">NO MODULES FOUND</div>';
        return;
    }

    filteredProjects.forEach((project, index) => {
        const card = document.createElement('article');
        card.className = 'project-card';
        card.style.animationDelay = `${index * 0.08}s`;

        let statusClass = '';
        let actionButton = '';
        let description = project.description;

        if (project.status === 'Public') {
            statusClass = 'status-public';
            actionButton = `<a href="${project.github_link}" target="_blank" class="btn-link">VIEW CODE</a>`;
        } else if (project.status === 'Classified') {
            statusClass = 'status-classified';
            description = '<span style="color:var(--danger); opacity:0.7;">[REDACTED]</span>';
            actionButton = '';
            card.style.borderColor = 'var(--danger)';
        } else {
            statusClass = 'status-unknown';
            actionButton = `<span class="btn-link disabled">OFFLINE</span>`;
        }

        const tagsHtml = project.tags.map(tag => `<span class="tag">[${tag}]</span>`).join('');

        card.innerHTML = `
            <div class="card-header">
                <span class="project-id">ID::${project.id}</span>
                <span class="status-badge ${statusClass}">${project.status}</span>
            </div>
            <h3>${project.title}</h3>
            <p>${description}</p>
            <div class="project-tags">${tagsHtml}</div>
            <div class="project-links">
                ${actionButton}
            </div>
        `;

        grid.appendChild(card);
    });
}

function initFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const startTime = Date.now();

    footer.innerHTML = `
        <div class="status-bar">
            <span class="sys-indicator">SYS_INTEGRITY: <span class="value">100%</span></span>
            <span class="build-info">BUILD: v2.4.1</span>
            <span class="uptime">UPTIME: <span id="uptime">00:00:00</span></span>
        </div>
    `;

    setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        const uptimeEl = document.getElementById('uptime');
        if (uptimeEl) uptimeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}
