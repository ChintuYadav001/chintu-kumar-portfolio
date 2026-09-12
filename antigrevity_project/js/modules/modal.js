/* ==========================================================================
   MODAL DIALOG MODULE
   Module: modal.js
   Handles opening, rendering, and closing of the project details popup
   ========================================================================== */

import { getIcon } from './icons.js';

let modalBackdrop = null;
let modalContentContainer = null;

export function initModal() {
  modalBackdrop = document.getElementById('project-modal');
  modalContentContainer = document.getElementById('modal-content-area');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modalBackdrop) return;

  // Close handlers
  if (closeBtn) {
    closeBtn.addEventListener('click', closeProjectModal);
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeProjectModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeProjectModal();
    }
  });
}

export function openProjectModal(project) {
  if (!modalBackdrop || !modalContentContainer) return;

  modalContentContainer.innerHTML = `
    <div class="modal-body">
      <div class="modal-category">${project.categoryLabel.toUpperCase()}</div>
      <h2 class="modal-title">${project.title}</h2>
      <p class="modal-description">${project.details.overview || project.summary}</p>

      ${project.details.architecture ? `
        <h4 class="modal-section-title">Architecture & Approach</h4>
        <p class="modal-description">${project.details.architecture}</p>
      ` : ''}

      ${project.details.keyFeatures && project.details.keyFeatures.length ? `
        <h4 class="modal-section-title">Key Technical Features</h4>
        <ul class="modal-features-list">
          ${project.details.keyFeatures.map(feat => `
            <li class="modal-feature-item">
              <span class="modal-feature-bullet">✓</span>
              <span>${feat}</span>
            </li>
          `).join('')}
        </ul>
      ` : ''}

      <h4 class="modal-section-title">Technologies Used</h4>
      <div class="modal-tech-tags">
        ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
      </div>

      <div class="modal-actions">
        ${project.liveUrl ? `
          <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            ${getIcon('external')}
            <span>Live Demonstration</span>
          </a>
        ` : ''}
        ${project.githubUrl ? `
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
            ${getIcon('github')}
            <span>Source Repository</span>
          </a>
        ` : ''}
      </div>
    </div>
  `;

  modalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeProjectModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}
