/* ==========================================================================
   TIMELINE MODULE (EXPERIENCE & EDUCATION)
   Module: timeline.js
   Renders and toggles career and education milestone timelines
   ========================================================================== */

export function initTimeline(timelineData) {
  const container = document.getElementById('timeline-items-container');
  const tabs = document.querySelectorAll('.timeline-tab-btn');

  if (!container || !timelineData) return;

  let currentTab = 'experience';

  function renderTimeline(type) {
    const items = timelineData[type] || [];

    container.innerHTML = items.map((item, index) => `
      <div class="timeline-item reveal reveal-delay-${(index % 4) + 1}">
        <div class="timeline-dot"></div>
        <div class="timeline-card glow-border-3d" data-tilt data-tilt-max="4" data-tilt-scale="1.01">
          <!-- Top Executive Header -->
          <div class="timeline-header">
            <div class="timeline-header-main">
              <div class="timeline-role-row">
                <div class="timeline-role-icon-wrap">
                  ${type === 'experience' 
                    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
                    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
                  }
                </div>
                <div>
                  <h3 class="timeline-role">${item.role}</h3>
                  <div class="timeline-org-row">
                    <span class="timeline-organization">${item.organization}</span>
                    ${item.location ? `<span class="timeline-location-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> ${item.location}</span>` : ''}
                  </div>
                </div>
              </div>
            </div>

            <div class="timeline-header-meta">
              <span class="timeline-period">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                ${item.period}
              </span>
              ${item.badge ? `
                <span class="timeline-status-pill">
                  <span class="timeline-status-dot"></span>
                  ${item.badge}
                </span>
              ` : ''}
              ${item.grade ? `
                <span class="timeline-grade-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                  ${item.grade}
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Impact KPI Metric Strip (if available) -->
          ${item.kpis ? `
            <div class="timeline-kpis-strip">
              ${item.kpis.map(k => `
                <div class="timeline-kpi-block">
                  <div class="timeline-kpi-val">${k.value}</div>
                  <div class="timeline-kpi-lbl">${k.label}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Structured Key Responsibilities & Highlights -->
          ${item.highlights ? `
            <div class="timeline-highlights-section">
              <div class="timeline-highlights-heading">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                <span>${type === 'experience' ? 'Key Contributions & Business Impact' : 'Key Focus Areas & Academic Scope'}</span>
              </div>
              <ul class="timeline-highlights-list">
                ${item.highlights.map(h => `
                  <li class="timeline-highlight-point">
                    <span class="timeline-point-arrow">▹</span>
                    <span class="timeline-point-text">${h}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : `<p class="timeline-description">${item.description || ''}</p>`}

          <!-- Skills & Toolset Chips -->
          ${item.skills ? `
            <div class="timeline-skills-section">
              <div class="timeline-skills-title">Core Competencies &amp; Tools</div>
              <div class="timeline-skills-list">
                ${item.skills.map(s => `<span class="timeline-skill-pill">${s}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    // Trigger reveal classes if already in view
    requestAnimationFrame(() => {
      container.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    });
  }

  // Initial render
  renderTimeline(currentTab);

  // Tab switching event handlers
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-tab');
      renderTimeline(currentTab);
    });
  });
}
