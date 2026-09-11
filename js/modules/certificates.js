/* ==========================================================================
   CERTIFICATES & ACHIEVEMENTS MODULE
   Module: certificates.js
   Matches the exact aesthetic, structure, and elegance of the Project Cards
   with banner previews, category badges, high-contrast titles, clean tags,
   and "View Credential ->" action buttons.
   ========================================================================== */

import { getIcon } from './icons.js';
import { showToast } from './toast.js';
import { openCertificateModal } from './certificateModal.js';
import { initTilt3D } from './tilt3d.js';

export function initCertificates(certificatesData) {
  const container = document.getElementById('certificates-grid');
  const filterBtns = document.querySelectorAll('.cert-filter-btn');

  if (!container || !certificatesData) return;

  let activeCategory = 'all';

  function renderCertificates(category) {
    const filtered = category === 'all'
      ? certificatesData
      : certificatesData.filter(c => c.category === category);

    container.innerHTML = filtered.map((cert, index) => {
      if (cert.isPlaceholder) {
        return `
          <article class="project-card certificate-card certificate-card-placeholder glow-border-3d reveal reveal-delay-${(index % 3) + 1}" data-cert-id="${cert.id}" tabindex="0" role="button" aria-label="${cert.title}">
            <div class="project-banner placeholder-banner">
              <div class="cert-placeholder-center">
                <div class="cert-placeholder-icon">${getIcon('plus')}</div>
                <span class="cert-placeholder-text">Reserved Credential Slot</span>
              </div>
              <span class="project-category-badge">Reserved Slot</span>
            </div>
            <div class="project-content">
              <h3 class="project-title">${cert.title}</h3>
              <p class="project-summary">${cert.description}</p>
              <div class="project-tags">
                ${cert.skills.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
              </div>
              <div class="project-actions">
                <span class="project-action-link" style="color: var(--text-muted); cursor: default;">
                  <span>${cert.issuer}</span>
                </span>
                <button class="project-details-btn cert-details-btn" data-cert-id="${cert.id}">
                  <span>Add Details</span>
                  ${getIcon('arrowRight')}
                </button>
              </div>
            </div>
          </article>
        `;
      }

      const categoryLabel = cert.category === 'sql' 
        ? 'SQL / Database' 
        : (cert.category === 'python' 
          ? 'Python / Data Science' 
          : (cert.category === 'ai' 
            ? 'AI & Machine Learning' 
            : (cert.category === 'iot' ? 'IoT / Telemetry' : 'BI / Analytics')));

      return `
        <article class="project-card certificate-card glow-border-3d reveal reveal-delay-${(index % 3) + 1}" data-cert-id="${cert.id}" tabindex="0" role="button" aria-label="View credential for ${cert.title}" data-tilt data-tilt-max="6" data-tilt-scale="1.02">
          
          <!-- Top Banner Preview matching Project Card format -->
          <div class="project-banner cert-banner-frame">
            ${getCertificateBannerMarkup(cert)}
            <span class="project-category-badge">${categoryLabel}</span>
          </div>

          <!-- Card Content Body -->
          <div class="project-content">
            <h3 class="project-title" title="${cert.title}">${cert.title}</h3>
            <p class="project-summary">${cert.description}</p>
            
            <!-- Skill Tags exactly matching Project Cards -->
            <div class="project-tags">
              ${cert.skills.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
            </div>

            <!-- Action Bar matching Project Cards (Left Link + Right Arrow Button) -->
            <div class="project-actions">
              ${cert.pdfUrl ? `
                <a href="${cert.pdfUrl}" target="_blank" rel="noopener noreferrer" class="project-action-link" title="Open original verified PDF document">
                  ${getIcon('fileText')}
                  <span>Original PDF</span>
                </a>
              ` : (cert.certId && cert.certId !== 'PENDING-CREDENTIAL' ? `
                <span class="project-action-link" title="Credential ID: ${cert.certId}">
                  ${getIcon('award')}
                  <span>ID: ${cert.certId}</span>
                </span>
              ` : `
                <span class="project-action-link">
                  <span>${cert.date}</span>
                </span>
              `)}

              <button class="project-details-btn cert-details-btn" data-cert-id="${cert.id}">
                <span>View Credential</span>
                ${getIcon('arrowRight')}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Trigger reveal classes & 3D tilt
    requestAnimationFrame(() => {
      container.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
      initTilt3D(container);
    });

    // Attach click listeners on whole card and "View Credential" button
    container.querySelectorAll('.certificate-card').forEach(card => {
      const certId = card.getAttribute('data-cert-id');
      const cert = certificatesData.find(c => c.id === certId);

      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        if (cert) {
          if (cert.isPlaceholder) {
            showToast("This slot is reserved for your next certificate! Update portfolioData.js anytime.", "info", 4500);
          } else {
            openCertificateModal(cert);
          }
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('a')) return;
          e.preventDefault();
          if (cert) {
            if (cert.isPlaceholder) {
              showToast("Reserved slot for future credentials.", "info");
            } else {
              openCertificateModal(cert);
            }
          }
        }
      });
    });

    container.querySelectorAll('.cert-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const certId = btn.getAttribute('data-cert-id');
        const cert = certificatesData.find(c => c.id === certId);
        if (cert) openCertificateModal(cert);
      });
    });
  }

  // Initial render
  renderCertificates(activeCategory);

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderCertificates(activeCategory);
    });
  });
}

/**
 * Returns clean banner markup: high-res scanned image if available,
 * or an executive dark analytics SVG graphic matching the Project Cards.
 */
function getCertificateBannerMarkup(cert) {
  if (cert.image) {
    return `
      <div class="cert-img-container">
        <img 
          src="${cert.image}" 
          alt="Certificate: ${cert.title}" 
          class="project-banner-img cert-banner-preview" 
          loading="lazy" 
        />
        <div class="cert-banner-scrim"></div>
      </div>
    `;
  }

  if (cert.category === 'sql') {
    return `
      <svg class="project-banner-svg" viewBox="0 0 400 210" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0a0f1d"/>
        <g opacity="0.15">
          <line x1="0" y1="52" x2="400" y2="52" stroke="#38bdf8" stroke-width="1"/>
          <line x1="0" y1="105" x2="400" y2="105" stroke="#38bdf8" stroke-width="1"/>
          <line x1="0" y1="158" x2="400" y2="158" stroke="#38bdf8" stroke-width="1"/>
          <line x1="100" y1="0" x2="100" y2="210" stroke="#38bdf8" stroke-width="1"/>
          <line x1="200" y1="0" x2="200" y2="210" stroke="#38bdf8" stroke-width="1"/>
          <line x1="300" y1="0" x2="300" y2="210" stroke="#38bdf8" stroke-width="1"/>
        </g>
        <rect x="28" y="32" width="344" height="146" rx="10" fill="#0f172a" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1.5"/>
        <text x="48" y="70" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="bold">SELECT user_id, COUNT(*) AS solved</text>
        <text x="48" y="98" fill="#94a3b8" font-family="monospace" font-size="12">FROM leetcode_practice</text>
        <text x="48" y="126" fill="#94a3b8" font-family="monospace" font-size="12">GROUP BY user_id HAVING solved &gt;= 100;</text>
        <rect x="48" y="146" width="140" height="22" rx="4" fill="rgba(52, 211, 153, 0.15)" stroke="#34d399" stroke-width="1"/>
        <text x="56" y="161" fill="#34d399" font-family="monospace" font-size="11" font-weight="bold">✓ 100+ QUERIES PASSED</text>
      </svg>
    `;
  }

  // Generic/Analytics SVG Banner
  return `
    <svg class="project-banner-svg" viewBox="0 0 400 210" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0a0f1d"/>
      <rect x="28" y="30" width="344" height="150" rx="10" fill="#0f172a" stroke="rgba(129, 140, 248, 0.25)" stroke-width="1.5"/>
      <text x="48" y="68" fill="#e2e8f0" font-family="sans-serif" font-size="14" font-weight="bold">${cert.issuer}</text>
      <text x="48" y="92" fill="#94a3b8" font-family="monospace" font-size="11">Specialization Curriculum &amp; Assessment</text>
      <line x1="48" y1="108" x2="352" y2="108" stroke="#334155" stroke-width="1"/>
      <circle cx="60" cy="140" r="16" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="1.5"/>
      <path d="M54 140 L58 144 L66 136" stroke="#38bdf8" stroke-width="2" fill="none"/>
      <text x="86" y="138" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="bold">Credential Verified</text>
      <text x="86" y="154" fill="#64748b" font-family="monospace" font-size="10">${cert.date}</text>
    </svg>
  `;
}
