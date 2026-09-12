/* ==========================================================================
   STATISTICS COUNTER MODULE
   Module: statsCounter.js
   Animates numeric counters with 3D tilt depth and analytical indicator icons
   ========================================================================== */

import { getIcon } from './icons.js';
import { initAbout3DIcons } from './about3dIcons.js';

const statIconMap = ['database', 'chart', 'layers', 'award'];

export function initStatsCounter(statsData) {
  const statsContainer = document.getElementById('stats-container');
  if (!statsContainer || !statsData) return;

  // Render the stat cards with interactive 3D WebGL visual viewports
  statsContainer.innerHTML = statsData.map((stat, idx) => `
    <div class="stat-card glow-border-3d" data-tilt data-tilt-max="8" data-tilt-scale="1.02">
      <div class="stat-3d-viewport" data-index="${idx}" title="Interactive 3D Visual - Move mouse or click to rotate">
        <canvas class="stat-3d-canvas" id="stat-3d-canvas-${idx}"></canvas>
        <span class="stat-3d-hint-tag">3D Interactive</span>
      </div>
      <div class="stat-number" data-target="${stat.value}" data-suffix="${stat.suffix || ''}">0${stat.suffix || ''}</div>
      <div class="stat-label">${stat.label}</div>
    </div>
  `).join('');

  // Initialize interactive 3D WebGL models for each card
  try {
    initAbout3DIcons();
  } catch (e) {
    console.warn('Failed to initialize 3D icons in about section', e);
  }

  // Set up intersection observer to trigger counter
  let animated = false;
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && !animated) {
      animated = true;
      animateCounters();
      observer.disconnect();
    }
  }, { threshold: 0.25 });

  observer.observe(statsContainer);
}

function animateCounters() {
  const numberElements = document.querySelectorAll('.stat-number');
  const duration = 1800; // ms

  numberElements.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * target);

      el.textContent = `${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = `${target}${suffix}`;
      }
    }

    requestAnimationFrame(updateCounter);
  });
}
