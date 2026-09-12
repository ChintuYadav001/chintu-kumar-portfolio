/* ==========================================================================
   PROJECTS MODULE - WITH ENHANCED ANALYTICS VISUALS
   Module: projects.js
   Renders filterable project cards, creates authentic data analytics previews, and triggers modals
   ========================================================================== */

import { getIcon } from './icons.js';
import { openProjectModal } from './modal.js';

export function initProjects(projectsData) {
  const container = document.getElementById('projects-grid');
  const filterBtns = document.querySelectorAll('.projects-filter-btn');

  if (!container || !projectsData) return;

  let activeCategory = 'all';

  function renderProjects(category) {
    const filtered = category === 'all'
      ? projectsData
      : projectsData.filter(p => p.category === category);

    container.innerHTML = filtered.map((project, index) => `
      <article class="project-card reveal reveal-delay-${(index % 3) + 1}" data-id="${project.id}">
        <div class="project-banner">
          ${getAnalyticsProjectBannerSVG(project)}
          <span class="project-category-badge">${project.categoryLabel}</span>
        </div>
        <div class="project-content">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-summary">${project.summary}</p>
          <div class="project-tags">
            ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
          </div>
          <div class="project-actions">
            ${project.liveUrl ? `
              <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="project-action-link" title="Repository / Documentation">
                ${getIcon('github')}
                <span>GitHub Repo</span>
              </a>
            ` : ''}
            <button class="project-details-btn" data-project-id="${project.id}">
              <span>View Case Study</span>
              ${getIcon('arrowRight')}
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Trigger reveal classes
    requestAnimationFrame(() => {
      container.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    });

    // Attach click listeners for "Case Study" buttons
    container.querySelectorAll('.project-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const projectId = btn.getAttribute('data-project-id');
        const project = projectsData.find(p => p.id === projectId);
        if (project) {
          openProjectModal(project);
        }
      });
    });
  }

  // Initial render
  renderProjects(activeCategory);

  // Category filter handlers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderProjects(activeCategory);
    });
  });
}

/**
 * Generates specialized data analytics artwork banners (RFM Cluster Plot, Power BI Dashboard, Traffic Funnel)
 */
function getAnalyticsProjectBannerSVG(project) {
  // 1. RFM Customer Segmentation Scatter & Cluster Matrix
  if (project.id === 'project-rfm') {
    return `
      <svg class="project-banner-svg" viewBox="0 0 400 210" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0a0f1d"/>
        <!-- Background Grid -->
        <g stroke="rgba(255,255,255,0.06)" stroke-width="1">
          <line x1="40" y1="30" x2="370" y2="30"/>
          <line x1="40" y1="75" x2="370" y2="75"/>
          <line x1="40" y1="120" x2="370" y2="120"/>
          <line x1="40" y1="165" x2="370" y2="165"/>
          <line x1="120" y1="20" x2="120" y2="175"/>
          <line x1="200" y1="20" x2="200" y2="175"/>
          <line x1="280" y1="20" x2="280" y2="175"/>
          <line x1="360" y1="20" x2="360" y2="175"/>
        </g>
        <!-- Axes -->
        <line x1="40" y1="175" x2="370" y2="175" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
        <line x1="40" y1="20" x2="40" y2="175" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
        <text x="310" y="195" fill="#94a3b8" font-family="monospace" font-size="9">Recency (Days) →</text>
        <text x="15" y="25" fill="#94a3b8" font-family="monospace" font-size="9" transform="rotate(-90 15,25)">Monetary ($) →</text>
        
        <!-- Cluster 1: Champions (Top Left) -->
        <rect x="50" y="30" width="100" height="60" rx="8" fill="rgba(52, 211, 153, 0.12)" stroke="#34d399" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="58" y="46" fill="#34d399" font-family="monospace" font-size="10" font-weight="bold">Champions (60% Rev)</text>
        <circle cx="70" cy="65" r="5" fill="#34d399" opacity="0.9"/>
        <circle cx="95" cy="55" r="7" fill="#34d399" opacity="0.8"/>
        <circle cx="120" cy="70" r="6" fill="#34d399" opacity="0.9"/>
        <circle cx="85" cy="78" r="4.5" fill="#34d399" opacity="0.8"/>

        <!-- Cluster 2: Loyal Customers -->
        <circle cx="160" cy="95" r="5.5" fill="#38bdf8" opacity="0.9"/>
        <circle cx="185" cy="85" r="6.5" fill="#38bdf8" opacity="0.85"/>
        <circle cx="210" cy="105" r="5" fill="#38bdf8" opacity="0.9"/>
        <text x="160" y="78" fill="#38bdf8" font-family="monospace" font-size="9">Loyalists</text>

        <!-- Cluster 3: At-Risk / Churn Risk (Far Right) -->
        <rect x="260" y="90" width="100" height="75" rx="8" fill="rgba(244, 63, 94, 0.12)" stroke="#f43f5e" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="270" y="106" fill="#f43f5e" font-family="monospace" font-size="10" font-weight="bold">At Risk (Hibernating)</text>
        <circle cx="280" cy="130" r="4" fill="#f43f5e" opacity="0.8"/>
        <circle cx="310" cy="120" r="5.5" fill="#f43f5e" opacity="0.85"/>
        <circle cx="335" cy="145" r="4.5" fill="#f43f5e" opacity="0.9"/>
        <circle cx="295" cy="150" r="5" fill="#f43f5e" opacity="0.8"/>
      </svg>
    `;
  }

  // 2. Sales Performance & Power BI Interactive Dashboard
  if (project.id === 'project-sales') {
    return `
      <svg class="project-banner-svg" viewBox="0 0 400 210" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0e1322"/>
        <!-- Power BI Dashboard Header Bar -->
        <rect x="15" y="12" width="370" height="24" rx="4" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.4)"/>
        <text x="25" y="28" fill="#fbbf24" font-family="monospace" font-size="10" font-weight="bold">Power BI Executive Sales Overview (Superstore 9,800+ Records)</text>
        
        <!-- KPI Card 1: Total Sales -->
        <rect x="15" y="44" width="115" height="48" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)"/>
        <text x="23" y="58" fill="#94a3b8" font-family="monospace" font-size="8">TOTAL SALES</text>
        <text x="23" y="78" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold">$2,297,201</text>

        <!-- KPI Card 2: Total Profit -->
        <rect x="142" y="44" width="115" height="48" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)"/>
        <text x="150" y="58" fill="#94a3b8" font-family="monospace" font-size="8">TOTAL PROFIT</text>
        <text x="150" y="78" fill="#34d399" font-family="sans-serif" font-size="16" font-weight="bold">$286,397</text>

        <!-- KPI Card 3: Profit Margin -->
        <rect x="270" y="44" width="115" height="48" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)"/>
        <text x="278" y="58" fill="#94a3b8" font-family="monospace" font-size="8">PROFIT MARGIN</text>
        <text x="278" y="78" fill="#818cf8" font-family="sans-serif" font-size="16" font-weight="bold">12.47%</text>

        <!-- Regional Sales Breakdown Bar Chart -->
        <rect x="15" y="100" width="220" height="98" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        <text x="23" y="115" fill="#e2e8f0" font-family="monospace" font-size="9" font-weight="bold">Regional Sales Breakdown</text>
        
        <!-- West -->
        <text x="23" y="133" fill="#94a3b8" font-family="monospace" font-size="8">West</text>
        <rect x="65" y="125" width="145" height="10" rx="3" fill="#38bdf8"/>
        <!-- East -->
        <text x="23" y="151" fill="#94a3b8" font-family="monospace" font-size="8">East</text>
        <rect x="65" y="143" width="125" height="10" rx="3" fill="#818cf8"/>
        <!-- Central -->
        <text x="23" y="169" fill="#94a3b8" font-family="monospace" font-size="8">Central</text>
        <rect x="65" y="161" width="95" height="10" rx="3" fill="#34d399"/>
        <!-- South -->
        <text x="23" y="187" fill="#94a3b8" font-family="monospace" font-size="8">South</text>
        <rect x="65" y="179" width="70" height="10" rx="3" fill="#f43f5e"/>

        <!-- Donut / Category Distribution Mini Visual -->
        <rect x="245" y="100" width="140" height="98" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        <text x="253" y="115" fill="#e2e8f0" font-family="monospace" font-size="9" font-weight="bold">Category Share</text>
        <circle cx="315" cy="155" r="28" fill="none" stroke="#38bdf8" stroke-width="12" stroke-dasharray="80 180"/>
        <circle cx="315" cy="155" r="28" fill="none" stroke="#818cf8" stroke-width="12" stroke-dasharray="55 180" stroke-dashoffset="-80"/>
        <circle cx="315" cy="155" r="28" fill="none" stroke="#34d399" stroke-width="12" stroke-dasharray="45 180" stroke-dashoffset="-135"/>
      </svg>
    `;
  }

  // 3. Website Traffic & Conversion Funnel Analysis
  return `
    <svg class="project-banner-svg" viewBox="0 0 400 210" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0c111e"/>
      <text x="20" y="24" fill="#38bdf8" font-family="monospace" font-size="10" font-weight="bold">User Journey Funnel &amp; Session Duration Analysis</text>
      
      <!-- Stage 1: All Sessions -->
      <path d="M 40 40 L 360 40 L 325 75 L 75 75 Z" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="1.2"/>
      <text x="145" y="60" fill="#ffffff" font-family="monospace" font-size="10" font-weight="bold">Total Sessions: 45,200 (100%)</text>

      <!-- Stage 2: Product Views -->
      <path d="M 75 80 L 325 80 L 290 115 L 110 115 Z" fill="rgba(129, 140, 248, 0.25)" stroke="#818cf8" stroke-width="1.2"/>
      <text x="140" y="100" fill="#ffffff" font-family="monospace" font-size="10" font-weight="bold">Product Page Views: 22,100 (48.9%)</text>

      <!-- Stage 3: Add to Cart -->
      <path d="M 110 120 L 290 120 L 255 155 L 145 155 Z" fill="rgba(52, 211, 153, 0.25)" stroke="#34d399" stroke-width="1.2"/>
      <text x="155" y="140" fill="#ffffff" font-family="monospace" font-size="10" font-weight="bold">Add to Cart: 7,420 (16.4%)</text>

      <!-- Stage 4: Completed Conversions -->
      <path d="M 145 160 L 255 160 L 235 195 L 165 195 Z" fill="rgba(245, 158, 11, 0.35)" stroke="#fbbf24" stroke-width="1.2"/>
      <text x="168" y="180" fill="#fbbf24" font-family="monospace" font-size="10" font-weight="bold">Conversions: 2,150 (4.7%)</text>

      <!-- KPI Pills on side -->
      <rect x="305" y="165" width="80" height="28" rx="4" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e"/>
      <text x="312" y="182" fill="#f43f5e" font-family="monospace" font-size="8.5" font-weight="bold">Bounce: 38.4%</text>
    </svg>
  `;
}
