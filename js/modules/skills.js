/* ==========================================================================
   SKILLS MODULE
   Module: skills.js
   Renders categorized skills grid, handles tab filters, and animates progress bars
   ========================================================================== */

import { getIcon } from './icons.js';

export function initSkills(skillsData) {
  const container = document.getElementById('skills-grid');
  const filterBtns = document.querySelectorAll('.skills-filter-btn');

  if (!container || !skillsData) return;

  let activeCategory = 'all';

  function renderSkills(category) {
    const filtered = category === 'all'
      ? skillsData
      : skillsData.filter(s => s.category === category);

    container.innerHTML = filtered.map((skill, index) => `
      <div class="skill-card reveal reveal-delay-${(index % 4) + 1}">
        <div class="skill-header">
          <div class="skill-meta">
            <div class="skill-icon-wrap" aria-hidden="true">
              ${getIcon(skill.icon || 'code')}
            </div>
            <div class="skill-name">${skill.name}</div>
          </div>
          <span class="skill-level-badge">${skill.level}%</span>
        </div>
        <div class="skill-bar-container" role="progressbar" aria-valuenow="${skill.level}" aria-valuemin="0" aria-valuemax="100">
          <div class="skill-bar-fill" style="width: 0%" data-width="${skill.level}%"></div>
        </div>
      </div>
    `).join('');

    // Trigger reveal & progress bar fill animation
    requestAnimationFrame(() => {
      container.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
      setTimeout(() => {
        container.querySelectorAll('.skill-bar-fill').forEach(bar => {
          bar.style.width = bar.getAttribute('data-width');
        });
      }, 100);
    });
  }

  // Initial render
  renderSkills(activeCategory);

  // Category filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderSkills(activeCategory);
    });
  });
}
