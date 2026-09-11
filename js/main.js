/* ==========================================================================
   APPLICATION ENTRY POINT
   Module: main.js
   Orchestrates all isolated modules and populates the portfolio DOM
   ========================================================================== */

import { portfolioData } from './data/portfolioData.js';
import { getIcon } from './modules/icons.js';
import { initTheme } from './modules/theme.js';
import { initNavigation } from './modules/navigation.js';
import { initTypewriter } from './modules/typing.js';
import { initStatsCounter } from './modules/statsCounter.js';
import { initTimeline } from './modules/timeline.js';
import { initSkills } from './modules/skills.js';
import { initProjects } from './modules/projects.js';
import { initCertificates } from './modules/certificates.js';
import { initCertificateModal } from './modules/certificateModal.js';
import { initResume } from './modules/resume.js';
import { initTilt3D } from './modules/tilt3d.js';
import { initBackground3D } from './modules/background3d.js';
import { initHero3DScene } from './modules/scene3d.js';
import { initModal } from './modules/modal.js';
import { initToast } from './modules/toast.js';
import { initContactForm } from './modules/contactForm.js';
import { initScrollReveal } from './modules/scrollReveal.js';
import { initChatbot } from './modules/chatbot.js';
import { initVisitorAlert } from './modules/visitorAlert.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Populate Personal Information into DOM elements
  populatePersonalInfo(portfolioData.personalInfo);

  // 2. Initialize Theme Switcher (Dark/Light mode)
  initTheme();

  // 3. Initialize Sticky Navigation & Mobile Drawer
  initNavigation();

  // 4. Initialize Typewriter dynamic role cycling in Hero
  initTypewriter(portfolioData.personalInfo.typewriterRoles, 'typewriter-text');

  // 5. Initialize Stats Counter
  initStatsCounter(portfolioData.stats);

  // 6. Initialize Timeline (Experience & Education)
  initTimeline(portfolioData.timeline);

  // 7. Initialize Skills Grid & Category Filtering
  initSkills(portfolioData.skills);

  // 8. Initialize Projects Grid & Filters
  initProjects(portfolioData.projects);

  // 9. Initialize Certificates & Achievements Grid
  initCertificates(portfolioData.certificates);

  // 10. Initialize Certificate Viewer Modal
  initCertificateModal();

  // 11. Initialize Interactive ATS Resume Section & Fullscreen Controls
  initResume(portfolioData);

  const safeInit = (name, fn) => {
    try {
      fn();
    } catch (err) {
      console.warn(`[Antigravity] ${name} initialized with fallback:`, err);
    }
  };

  // 12. Initialize Ambient 3D WebGL Particle Constellation Background
  safeInit('Background3D', () => initBackground3D());

  // 13. Initialize Interactive 3D Hero Cyber Data Core
  safeInit('Hero3DScene', () => initHero3DScene());

  // 14. Initialize Interactive 3D Physics Tilt & Specular Highlights
  safeInit('Tilt3D', () => initTilt3D());

  // 15. Initialize Project Detail Modal
  safeInit('Modal', () => initModal());

  // 17. Initialize Toast Notifications
  safeInit('Toast', () => initToast());

  // 18. Initialize Interactive Contact Form
  safeInit('ContactForm', () => initContactForm());

  // 19. Initialize Scroll Reveal Animations
  safeInit('ScrollReveal', () => initScrollReveal());

  // 20. Initialize AI Portfolio Assistant Chatbot (Bottom-Right Widget)
  safeInit('Chatbot', () => initChatbot());

  // 21. Initialize Real-Time Visitor Alert Notification System
  safeInit('VisitorAlert', () => initVisitorAlert(portfolioData.visitorAlert));
});

/**
 * Injects dynamic personal info from portfolioData into the page
 */
function populatePersonalInfo(info) {
  // Name & Titles
  const heroNameEl = document.getElementById('hero-name');
  if (heroNameEl) heroNameEl.textContent = info.name;

  const heroBioEl = document.getElementById('hero-bio');
  if (heroBioEl) heroBioEl.textContent = info.heroBio || info.bio;

  const heroBadgeEl = document.getElementById('hero-status-text');
  if (heroBadgeEl) heroBadgeEl.textContent = info.badge;

  const aboutBioEl = document.getElementById('about-bio');
  if (aboutBioEl) aboutBioEl.innerHTML = info.bio;

  // Contact info elements
  const contactEmailVal = document.getElementById('contact-email-value');
  if (contactEmailVal) contactEmailVal.textContent = info.email;

  const contactPhoneVal = document.getElementById('contact-phone-value');
  if (contactPhoneVal && info.phone) contactPhoneVal.textContent = info.phone;

  const contactLocationVal = document.getElementById('contact-location-value');
  if (contactLocationVal) contactLocationVal.textContent = info.location;

  const copyEmailCard = document.getElementById('copy-email-card');
  if (copyEmailCard) copyEmailCard.setAttribute('data-email', info.email);

  const copyPhoneCard = document.getElementById('copy-phone-card');
  if (copyPhoneCard && info.phone) copyPhoneCard.setAttribute('data-phone', info.phone);

  // About highlights
  const highlightsContainer = document.getElementById('about-highlights');
  if (highlightsContainer && info.highlights) {
    highlightsContainer.innerHTML = info.highlights.map(item => `
      <li class="highlight-item">
        <span class="highlight-icon">${getIcon('check')}</span>
        <span>${item}</span>
      </li>
    `).join('');
  }

  // Populate Social Links
  const socialsContainers = document.querySelectorAll('.dynamic-socials');
  socialsContainers.forEach(container => {
    container.innerHTML = `
      <a href="${info.socials.github}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="GitHub">
        ${getIcon('github')}
      </a>
      <a href="${info.socials.linkedin}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn">
        ${getIcon('linkedin')}
      </a>
      ${info.socials.whatsapp ? `
        <a href="${info.socials.whatsapp}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="WhatsApp Chat">
          ${getIcon('whatsapp')}
        </a>
      ` : ''}
      <a href="${info.socials.email}" class="social-link" aria-label="Direct Email">
        ${getIcon('email')}
      </a>
      ${info.socials.phone ? `
        <a href="${info.socials.phone}" class="social-link" aria-label="Call Phone">
          ${getIcon('phone')}
        </a>
      ` : ''}
    `;
  });
}
