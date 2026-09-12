/* ==========================================================================
   AUTHENTIC CERTIFICATE VIEWER MODAL MODULE
   Module: certificateModal.js
   Interactive high-resolution document viewer for verified original certificates.
   Supports interactive zoom in/out/reset, rotation, direct PDF launch, and
   credential ID verification.
   ========================================================================== */

import { getIcon } from './icons.js';
import { showToast } from './toast.js';

let modalBackdrop = null;
let modalContentArea = null;
let currentZoom = 1;
let currentRotation = 0;

export function initCertificateModal() {
  modalBackdrop = document.getElementById('certificate-viewer-modal');
  modalContentArea = document.getElementById('cert-modal-content-area');
  const closeBtn = document.getElementById('cert-modal-close-btn');

  if (!modalBackdrop) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', closeCertificateModal);
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeCertificateModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeCertificateModal();
    }
  });
}

export function openCertificateModal(cert) {
  if (!modalBackdrop || !modalContentArea) return;

  currentZoom = 1;
  currentRotation = 0;

  if (cert.hasOriginal && cert.image) {
    // Render High-Resolution Authentic Original Document Viewer
    modalContentArea.innerHTML = `
      <div class="cert-original-viewer-wrap">
        <!-- Top Toolbar -->
        <div class="cert-viewer-toolbar">
          <div class="cert-viewer-title-col">
            <div class="cert-viewer-verified-pill">
              ${getIcon('award')}
              <span>Original Verified Document</span>
            </div>
            <h3 class="cert-viewer-title">${cert.title}</h3>
            <span class="cert-viewer-issuer">${cert.issuer} • ${cert.date}</span>
          </div>

          <!-- Document Zoom & Control Tools -->
          <div class="cert-viewer-tools">
            <button id="cert-zoom-out" class="cert-tool-btn" title="Zoom Out" aria-label="Zoom Out">
              ${getIcon('zoomOut')}
            </button>
            <span id="cert-zoom-level" class="cert-zoom-indicator">100%</span>
            <button id="cert-zoom-in" class="cert-tool-btn" title="Zoom In" aria-label="Zoom In">
              ${getIcon('zoomIn')}
            </button>
            <button id="cert-zoom-reset" class="cert-tool-btn" title="Reset Zoom" aria-label="Reset Zoom">
              ${getIcon('refresh')}
            </button>
            <button id="cert-rotate-btn" class="cert-tool-btn" title="Rotate 90 Degrees" aria-label="Rotate 90 Degrees">
              ${getIcon('external')}
            </button>
          </div>
        </div>

        <!-- Document Viewport -->
        <div class="cert-document-viewport" id="cert-viewport">
          <div class="cert-document-canvas" id="cert-canvas-container">
            <img 
              id="cert-original-img"
              src="${cert.image}" 
              alt="Original ${cert.title} awarded to Chintu Kumar" 
              class="cert-original-image"
              draggable="false"
            />
          </div>
        </div>

        <!-- Footer Meta & Actions Bar -->
        <div class="cert-viewer-footer">
          <div class="cert-viewer-meta-chips">
            ${cert.certId ? `
              <div class="cert-meta-chip">
                <span class="chip-lbl">Credential ID:</span>
                <strong class="chip-val">${cert.certId}</strong>
                <button id="copy-cert-id-btn" class="chip-copy-btn" data-id="${cert.certId}" title="Copy Credential ID">
                  ${getIcon('copy')}
                  <span>Copy</span>
                </button>
              </div>
            ` : ''}

            ${cert.signer ? `
              <div class="cert-meta-chip">
                <span class="chip-lbl">Signer:</span>
                <strong class="chip-val">${cert.signer}</strong>
              </div>
            ` : ''}

            ${cert.rollNo ? `
              <div class="cert-meta-chip">
                <span class="chip-lbl">Roll &amp; Dept:</span>
                <strong class="chip-val">${cert.rollNo} (${cert.department || 'CSE'})</strong>
              </div>
            ` : ''}
          </div>

          <!-- Direct Document Actions -->
          <div class="cert-viewer-actions">
            ${cert.pdfUrl ? `
              <a href="${cert.pdfUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" title="Open raw original PDF in a new browser tab">
                ${getIcon('external')}
                <span>Open Original PDF</span>
              </a>
              <a href="${cert.pdfUrl}" download class="btn btn-secondary" title="Download official original PDF document">
                ${getIcon('download')}
                <span>Download PDF</span>
              </a>
            ` : ''}

            ${cert.verifyUrl && cert.verifyUrl !== '#' ? `
              <a href="${cert.verifyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" title="Verify credential on official portal">
                ${getIcon('award')}
                <span>Verify on Portal</span>
              </a>
            ` : ''}

            <button id="cert-modal-done-btn" class="btn btn-outline">
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Setup Interactive Zoom & Transform Handlers
    const certImg = modalContentArea.querySelector('#cert-original-img');
    const zoomInBtn = modalContentArea.querySelector('#cert-zoom-in');
    const zoomOutBtn = modalContentArea.querySelector('#cert-zoom-out');
    const zoomResetBtn = modalContentArea.querySelector('#cert-zoom-reset');
    const rotateBtn = modalContentArea.querySelector('#cert-rotate-btn');
    const zoomIndicator = modalContentArea.querySelector('#cert-zoom-level');
    const viewport = modalContentArea.querySelector('#cert-viewport');

    function updateTransform() {
      if (!certImg) return;
      certImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
      if (zoomIndicator) {
        zoomIndicator.textContent = `${Math.round(currentZoom * 100)}%`;
      }
    }

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        if (currentZoom < 2.5) {
          currentZoom = Math.min(2.5, currentZoom + 0.25);
          updateTransform();
        }
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > 0.5) {
          currentZoom = Math.max(0.5, currentZoom - 0.25);
          updateTransform();
        }
      });
    }

    if (zoomResetBtn) {
      zoomResetBtn.addEventListener('click', () => {
        currentZoom = 1;
        currentRotation = 0;
        updateTransform();
        if (viewport) {
          viewport.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      });
    }

    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => {
        currentRotation = (currentRotation + 90) % 360;
        updateTransform();
      });
    }

    // Mouse wheel zoom inside viewport
    if (viewport) {
      viewport.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
          e.preventDefault();
          if (e.deltaY < 0 && currentZoom < 2.5) {
            currentZoom = Math.min(2.5, currentZoom + 0.15);
            updateTransform();
          } else if (e.deltaY > 0 && currentZoom > 0.5) {
            currentZoom = Math.max(0.5, currentZoom - 0.15);
            updateTransform();
          }
        }
      }, { passive: false });
    }

  } else {
    // Fallback View for Credentials Pending Upload
    modalContentArea.innerHTML = `
      <div class="cert-sheet-container">
        <div class="cert-document-frame">
          <span class="cert-corner-ornament corner-tl"></span>
          <span class="cert-corner-ornament corner-tr"></span>
          <span class="cert-corner-ornament corner-bl"></span>
          <span class="cert-corner-ornament corner-br"></span>

          <div class="cert-issuer-header">${cert.issuer}</div>
          <h2 class="cert-doc-type">${cert.type || 'Certificate of Accomplishment'}</h2>
          <div class="cert-presented-text">Presented To</div>
          <div class="cert-recipient-name">CHINTU KUMAR</div>
          <div class="cert-fulfillment-text">For successfully completing all evaluation criteria and demonstrating proficiency in</div>
          <div class="cert-title-badge-box">
            <div class="cert-title-box-text">${cert.title}</div>
          </div>
          <p class="cert-details-paragraph">${cert.description}</p>
          <div class="certificate-skills" style="justify-content: center; margin-bottom: 24px;">
            ${cert.skills.map(s => `<span class="certificate-skill-pill">${s}</span>`).join('')}
          </div>
          <div class="cert-meta-footer-grid">
            <div>
              <div class="cert-meta-item-label">Credential ID</div>
              <div class="cert-meta-item-val">${cert.certId || 'N/A'}</div>
            </div>
            <div>
              <div class="cert-meta-item-label">Issue Date / Duration</div>
              <div class="cert-meta-item-val">${cert.date}</div>
            </div>
          </div>
        </div>
        <div class="cert-modal-actions-bar">
          ${cert.verifyUrl && cert.verifyUrl !== '#' ? `
            <a href="${cert.verifyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
              ${getIcon('external')}
              <span>Verify on Official Portal</span>
            </a>
          ` : ''}
          <button id="cert-modal-done-btn" class="btn btn-outline">
            <span>Close Preview</span>
          </button>
        </div>
      </div>
    `;
  }

  // Copy ID button
  const copyBtn = modalContentArea.querySelector('#copy-cert-id-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const id = copyBtn.getAttribute('data-id');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(id).then(() => {
          showToast(`Credential ID copied: ${id}`, 'success');
        }).catch(() => {
          showToast(`ID: ${id}`, 'info');
        });
      } else {
        showToast(`ID: ${id}`, 'info');
      }
    });
  }

  const doneBtn = modalContentArea.querySelector('#cert-modal-done-btn');
  if (doneBtn) {
    doneBtn.addEventListener('click', closeCertificateModal);
  }

  modalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeCertificateModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}
