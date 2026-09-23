/* ==========================================================================
   RESUME MODULE - MODAL VIEWER & PDF DOWNLOAD CONTROLLER
   Module: resume.js
   Full-screen interactive ATS resume lightbox, zoom controls, print-to-PDF,
   and official PDF download management.
   ========================================================================== */

import { getIcon } from './icons.js';
import { showToast } from './toast.js';
import { openProjectModal } from './modal.js';
import { openCertificateModal } from './certificateModal.js';

let currentZoom = 1;
let modalBackdrop = null;
let modalContentWrap = null;
let zoomLevelDisplay = null;
let cachedResumeHTML = '';

export function openResumeModal() {
  if (!modalBackdrop) {
    modalBackdrop = document.getElementById('resume-viewer-modal');
  }
  if (!modalContentWrap) {
    modalContentWrap = document.getElementById('resume-modal-sheet-wrap');
  }
  if (modalContentWrap && cachedResumeHTML) {
    modalContentWrap.innerHTML = cachedResumeHTML;
  }
  currentZoom = 1;
  applyZoom();
  if (modalBackdrop) {
    modalBackdrop.classList.add('open');
  }
  document.body.style.overflow = 'hidden';
}

export function closeResumeModal() {
  if (!modalBackdrop) {
    modalBackdrop = document.getElementById('resume-viewer-modal');
  }
  if (modalBackdrop) {
    modalBackdrop.classList.remove('open');
  }
  if (window.location.hash === '#resume') {
    history.pushState(null, '', window.location.pathname + window.location.search);
  }
  document.body.style.overflow = '';
}

function applyZoom() {
  if (modalContentWrap) {
    modalContentWrap.style.transform = `scale(${currentZoom})`;
  }
  if (zoomLevelDisplay) {
    zoomLevelDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
  }
}

export function initResume(portfolioData) {
  modalBackdrop = document.getElementById('resume-viewer-modal');
  modalContentWrap = document.getElementById('resume-modal-sheet-wrap');
  const closeViewerBtn = document.getElementById('close-resume-viewer-btn');
  const zoomInBtn = document.getElementById('resume-zoom-in-btn');
  const zoomOutBtn = document.getElementById('resume-zoom-out-btn');
  const zoomResetBtn = document.getElementById('resume-zoom-reset-btn');
  zoomLevelDisplay = document.getElementById('resume-zoom-level-text');
  const modalPrintBtn = document.getElementById('modal-print-resume-btn');
  const modalCopyAtsBtn = document.getElementById('modal-copy-ats-btn');
  const modalDownloadTxtBtn = document.getElementById('modal-download-txt-btn');

  if (!modalBackdrop || !portfolioData) return;

  cachedResumeHTML = generateResumeHTML(portfolioData);

  // 1. Fullscreen Modal Trigger Handlers (Buttons in About Section, Hero CTA, etc.)
  const triggerButtons = document.querySelectorAll('.trigger-resume-modal');

  triggerButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openResumeModal();
    });
  });

  // Support direct anchor navigation #resume
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#resume') {
      openResumeModal();
    }
  });
  if (window.location.hash === '#resume') {
    openResumeModal();
  }

  if (closeViewerBtn) {
    closeViewerBtn.addEventListener('click', closeResumeModal);
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeResumeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeResumeModal();
    }
  });

  // 2. Interactive Delegates inside the Resume Document
  if (modalContentWrap) {
    modalContentWrap.addEventListener('click', (e) => {
      // Interactive Certificate Preview
      const certLink = e.target.closest('.doc-cert-trigger');
      if (certLink) {
        e.preventDefault();
        const certId = certLink.dataset.certId;
        const foundCert = portfolioData.certificates?.find(c => c.id === certId);
        if (foundCert) {
          closeResumeModal();
          openCertificateModal(foundCert);
        }
        return;
      }

      // Interactive Project Case Study Preview
      const projLink = e.target.closest('.doc-proj-trigger');
      if (projLink) {
        e.preventDefault();
        const projId = projLink.dataset.projId;
        const foundProj = portfolioData.projects?.find(p => p.id === projId);
        if (foundProj) {
          closeResumeModal();
          openProjectModal(foundProj);
        }
        return;
      }

      // Copy Value Trigger (Email / Phone)
      const copyTrigger = e.target.closest('.doc-copy-trigger');
      if (copyTrigger) {
        const val = copyTrigger.dataset.copyVal;
        if (val && navigator.clipboard) {
          navigator.clipboard.writeText(val).then(() => {
            showToast(`Copied ${val} to clipboard!`, 'success');
          }).catch(() => {});
        }
      }
    });
  }

  // 3. Zoom Controls

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      if (currentZoom < 1.4) {
        currentZoom += 0.1;
        applyZoom();
      }
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      if (currentZoom > 0.7) {
        currentZoom -= 0.1;
        applyZoom();
      }
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => {
      currentZoom = 1;
      applyZoom();
    });
  }

  const zoomFitBtn = document.getElementById('resume-fit-page-btn');
  if (zoomFitBtn) {
    zoomFitBtn.addEventListener('click', fitResumeToOnePage);
  }

  function fitResumeToOnePage() {
    if (!modalContentWrap || !modalBackdrop) return;
    const paperEl = document.getElementById('original-pdf-paper-card') || document.getElementById('resume-document');
    if (!paperEl) return;
    const docHeight = paperEl.offsetHeight || 1050;
    const availableHeight = window.innerHeight - 110;
    if (availableHeight > 250) {
      currentZoom = Math.min(1, Math.max(0.35, +(availableHeight / docHeight).toFixed(2)));
      applyZoom();
      modalBackdrop.scrollTop = 0;
      showToast(`Fit 1-Page View (${Math.round(currentZoom * 100)}%)`, 'info');
    }
  }

  // Toggle between Authentic Paper View and Native PDF Embed
  const toggleViewBtn = document.getElementById('resume-toggle-view-btn');
  const toggleViewText = document.getElementById('resume-toggle-view-text');
  let isNativePdfMode = false;

  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      isNativePdfMode = !isNativePdfMode;
      const paperCard = document.getElementById('original-pdf-paper-card');
      const embedCard = document.getElementById('original-pdf-embed-card');

      if (isNativePdfMode) {
        if (paperCard) paperCard.style.display = 'none';
        if (embedCard) embedCard.style.display = 'block';
        if (toggleViewText) toggleViewText.textContent = 'Paper View';
        showToast('Switched to Native PDF Embed View', 'info');
      } else {
        if (embedCard) embedCard.style.display = 'none';
        if (paperCard) paperCard.style.display = 'block';
        if (toggleViewText) toggleViewText.textContent = 'PDF Embed';
        showToast('Switched to Authentic Paper View', 'info');
      }
    });
  }

  if (modalPrintBtn) {
    modalPrintBtn.addEventListener('click', () => {
      const printWin = window.open('assets/Chintu_Kumar_Data_Analyst_Resume.pdf', '_blank');
      if (printWin) {
        printWin.focus();
      } else {
        window.print();
      }
    });
  }

  // 4. Plaintext ATS Copying & Downloading
  const plainTextAts = generateAtsPlainText(portfolioData);

  if (modalCopyAtsBtn) {
    modalCopyAtsBtn.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(plainTextAts).then(() => {
          showToast('ATS Plain Text Resume copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Please use Download PDF to get your file.', 'info');
        });
      } else {
        showToast('Please use Download PDF to get your file.', 'info');
      }
    });
  }

  if (modalDownloadTxtBtn) {
    modalDownloadTxtBtn.addEventListener('click', () => {
      const blob = new Blob([plainTextAts], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Chintu_Kumar_Data_Analyst_Resume.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded Chintu_Kumar_Data_Analyst_Resume.txt', 'success');
    });
  }
}

/**
 * Generates the authentic original PDF resume document view
 */
function generateResumeHTML(data) {
  const { personalInfo } = data;
  const resumeEmail = personalInfo.resumeEmail || 'chintukumaredu00@gmail.com';
  const resumeLinkedin = personalInfo.resumeLinkedin || 'https://linkedin.com/in/chintu-kumar-767909190';
  const phone = personalInfo.phone || '+91 7763917713';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  return `
    <div class="original-resume-container" id="resume-document">
      <!-- High-Resolution Authentic Original Paper Document (Default, 100% responsive on all mobile/desktop devices) -->
      <div class="original-pdf-paper-card" id="original-pdf-paper-card">
        <img 
          src="assets/Chintu_Kumar_Data_Analyst_Resume_Page1.png" 
          alt="Chintu Kumar - Aspiring Data Analyst Resume (Original PDF)" 
          class="original-pdf-img" 
          id="original-pdf-img"
          loading="eager"
        />
        <!-- Direct Clickable Hotspots mapped directly over header links -->
        <a href="mailto:${resumeEmail}" class="pdf-hotspot hotspot-email" title="Email: ${resumeEmail}" aria-label="Email ${resumeEmail}"></a>
        <a href="tel:${cleanPhone}" class="pdf-hotspot hotspot-phone" title="Phone: ${phone}" aria-label="Call ${phone}"></a>
        <a href="${resumeLinkedin}" target="_blank" rel="noopener noreferrer" class="pdf-hotspot hotspot-linkedin" title="LinkedIn: linkedin.com/in/chintu-kumar-767909190" aria-label="LinkedIn Profile"></a>
        <a href="https://github.com/ChintuYadav001" target="_blank" rel="noopener noreferrer" class="pdf-hotspot hotspot-github" title="GitHub: github.com/ChintuYadav001" aria-label="GitHub Profile"></a>
      </div>

      <!-- Native PDF Iframe Embed Card (Active when toggled on desktop) -->
      <div class="original-pdf-embed-card" id="original-pdf-embed-card" style="display: none;">
        <iframe 
          id="original-pdf-iframe" 
          src="assets/Chintu_Kumar_Data_Analyst_Resume.pdf#toolbar=1&view=FitH" 
          title="Chintu Kumar Original PDF Resume" 
          class="original-pdf-iframe"
        ></iframe>
      </div>
    </div>
  `;
}

/**
 * Builds clean, ATS-compliant plaintext formatted text for portal pasting
 */
function generateAtsPlainText(data) {
  const { personalInfo } = data;
  const resumeEmail = personalInfo.resumeEmail || 'chintukumaredu00@gmail.com';
  const phone = personalInfo.phone || '+91 7763917713';

  return `CHINTU KUMAR
Aspiring Data Analyst | Python | SQL | Power BI
${resumeEmail} | ${phone} | linkedin.com/in/chintu-kumar-767909190 | github.com/ChintuYadav001
100+ SQL Problems Solved • 10,000+ Records Analyzed • 3 End-to-End Analytics Projects

CAREER OBJECTIVE
B.Tech Computer Science (AI & DS) student with a strong foundation in Python, SQL, Excel, and Power BI. Skilled in data cleaning, exploratory data analysis (EDA), data visualization, and dashboard development. Seeking a Data Analyst opportunity to apply analytical skills, solve business problems, and contribute to data-driven decision-making.

TECHNICAL SKILLS
• Programming Languages: Python, SQL
• Python Libraries: Pandas, NumPy, Matplotlib, Seaborn
• Data Analysis: Exploratory Data Analysis (EDA), Data Cleaning, Data Wrangling, Statistical Analysis
• Data Visualization & BI Tools: Power BI (Dashboards, DAX basics: CALCULATE, SUMX, RANKX), Microsoft Excel (Pivot Tables, VLOOKUP, INDEX-MATCH, Charts)
• Database Management: MySQL (Joins, Subqueries, Aggregate Functions, Window Functions), Data Modeling, ETL Basics
• Business Analytics: KPI Analysis, Business Intelligence, Dashboarding, Statistical Analysis, Data Interpretation
• Tools & Technologies: Jupyter Notebook, Excel, Power BI, Git/GitHub
• Core Strengths: Problem Solving, Analytical Thinking, Communication, Team Collaboration

EXPERIENCE
Data Analyst Intern | Alfido Tech (Remote) Aug 2026 – Oct 2026
• Cleaned and preprocessed 5+ raw datasets (50,000+ rows total) using Python (Pandas, NumPy), fixing missing values, duplicates, and outliers to improve data quality by an estimated 30%.
• Performed feature engineering and exploratory data analysis (EDA) across 5 business datasets to identify KPIs, trends, and actionable insights, presented to a 4-person project team.
• Built 10+ visualizations and summary reports using Matplotlib and Seaborn, translating raw data into clear, decision-ready insights for stakeholders.
• Automated repetitive data-cleaning steps with reusable Python functions, cutting manual processing time by roughly 40%.

PROJECTS
Customer Behavior & RFM Segmentation Analysis | Python, Pandas, NumPy, Matplotlib, Seaborn
• Cleaned and analyzed 10,000+ customer transaction records, engineering RFM (Recency, Frequency, Monetary) features to segment customers into 5 value tiers.
• Identified high-value and at-risk segments (~20% of customers driving 60%+ of revenue), surfacing retention opportunities for targeted marketing.

Sales Performance Analysis | Python, SQL, Pandas, Matplotlib, Seaborn, Power BI
• Wrote SQL queries (joins, aggregations, window functions) to extract and summarize sales, revenue, and profit across regions and categories using the Superstore dataset (9,800+ records).
• Built an interactive Power BI dashboard (5+ visuals) highlighting top products and seasonal trends, surfacing 3+ actionable improvement areas.

Website Traffic Analysis | Python, Pandas, NumPy, Matplotlib, Seaborn
• Cleaned and analyzed website traffic data spanning thousands of sessions, covering users, bounce rate, and average session duration.
• Identified top 5 landing/exit pages and referral sources, recommending changes projected to improve conversion and engagement.

EDUCATION
B.Tech, Computer Science (AI & DS) | IIMT Engineering College (AKTU) 2023 – 2027
CGPA: 7.2
XII (CBSE) | Paramount Academy 2023
Percentage: 67.6%
X (CBSE) | Paramount Academy 2021
Percentage: 65.4%

ACHIEVEMENTS & CERTIFICATIONS
• Completed the Google Data Analytics Professional Certificate (Coursera), with hands-on projects in EDA, data cleaning, and visualization.
• Solved 100+ SQL problems on LeetCode, strengthening query writing and analytical thinking.
• Earned SQL certification from HackerRank, validating database and query skills.
• Built interactive dashboards in Power BI through a hands-on micro-course.
• Completed Python for Data Science (Infosys Springboard), applying Pandas and NumPy to real datasets.
`;
}
