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
    const docEl = document.getElementById('resume-document');
    if (!docEl) return;
    const docHeight = docEl.offsetHeight || 980;
    const availableHeight = window.innerHeight - 110;
    if (availableHeight > 250) {
      currentZoom = Math.min(1, Math.max(0.4, +(availableHeight / docHeight).toFixed(2)));
      applyZoom();
      modalBackdrop.scrollTop = 0;
      showToast(`Fit 1-Page View (${Math.round(currentZoom * 100)}%)`, 'info');
    }
  }

  if (modalPrintBtn) {
    modalPrintBtn.addEventListener('click', () => {
      window.print();
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
 * Generates the authentic single-page ATS-compliant resume document HTML
 */
function generateResumeHTML(data) {
  const { personalInfo } = data;
  const resumeEmail = personalInfo.resumeEmail || 'chintukumaredu00@gmail.com';
  const resumeLinkedin = personalInfo.resumeLinkedin || 'https://linkedin.com/in/chintu-kumar-767909190';
  const phone = personalInfo.phone || '+91 7763917713';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  return `
    <article class="resume-paper" id="resume-document">
      <!-- Document Header -->
      <header class="doc-header">
        <h1 class="doc-name">CHINTU KUMAR</h1>
        <div class="doc-subhead">Data Analyst | Python | SQL | Power BI | Excel</div>
        <div class="doc-contact-row">
          <a href="mailto:${resumeEmail}" class="doc-copy-trigger" data-copy-val="${resumeEmail}" title="Copy email">${resumeEmail}</a>
          <span class="doc-sep">|</span>
          <a href="tel:${cleanPhone}" class="doc-copy-trigger" data-copy-val="${phone}" title="Copy phone">${phone}</a>
          <span class="doc-sep">|</span>
          <a href="${resumeLinkedin}" target="_blank" rel="noopener noreferrer" title="View LinkedIn Profile">${getIcon('external')} linkedin.com/in/chintu-kumar-767909190</a>
          <span class="doc-sep">|</span>
          <a href="https://github.com/ChintuYadav001" target="_blank" rel="noopener noreferrer" title="View GitHub Profile">${getIcon('external')} github.com/ChintuYadav001</a>
        </div>
        <div class="doc-metrics-bar">
          <span>100+ SQL Queries Solved</span>
          <span class="doc-sep">•</span>
          <span>10,000+ Records Analyzed</span>
          <span class="doc-sep">•</span>
          <span>3 End-to-End Analytics Projects</span>
          <span class="doc-sep">•</span>
          <span>50,000+ Raw Rows Cleaned</span>
        </div>
      </header>

      <!-- Career Objective -->
      <section class="doc-section">
        <h2 class="doc-section-title">${getIcon('fileText')} CAREER OBJECTIVE</h2>
        <p class="doc-objective-text">B.Tech Computer Science (AI &amp; DS) student with a strong foundation in Python, SQL, Excel, and Power BI. Skilled in data cleaning, exploratory data analysis (EDA), data visualization, and dashboard development. Seeking a Data Analyst opportunity to apply analytical skills, solve business problems, and contribute to data-driven decision-making.</p>
      </section>

      <!-- Technical Skills -->
      <section class="doc-section">
        <h2 class="doc-section-title">${getIcon('code')} TECHNICAL SKILLS</h2>
        <ul class="doc-skills-list">
          <li class="doc-skills-row">
            <span class="doc-skill-label">• Programming Languages:</span>
            <span class="doc-skill-values">Python, SQL</span>
          </li>
          <li class="doc-skills-row">
            <span class="doc-skill-label">• Python Libraries:</span>
            <span class="doc-skill-values">Pandas, NumPy, Matplotlib, Seaborn</span>
          </li>
          <li class="doc-skills-row">
            <span class="doc-skill-label">• Data Analysis:</span>
            <span class="doc-skill-values">Exploratory Data Analysis (EDA), Data Cleaning, Data Wrangling, Statistical Analysis</span>
          </li>
          <li class="doc-skills-row">
            <span class="doc-skill-label">• Data Visualization &amp; BI:</span>
            <span class="doc-skill-values">Power BI (Dashboards, DAX: CALCULATE, SUMX, RANKX), MS Excel (Pivot Tables, VLOOKUP, INDEX-MATCH)</span>
          </li>
          <li class="doc-skills-row">
            <span class="doc-skill-label">• Database Management:</span>
            <span class="doc-skill-values">MySQL, PostgreSQL (Joins, Subqueries, Aggregate Functions, Window Functions), Data Modeling, ETL Basics</span>
          </li>
          <li class="doc-skills-row">
            <span class="doc-skill-label">• Business Analytics:</span>
            <span class="doc-skill-values">KPI Analysis, Business Intelligence, Dashboarding, Statistical Analysis, Data Interpretation</span>
          </li>
          <li class="doc-skills-row">
            <span class="doc-skill-label">• Tools &amp; Technologies:</span>
            <span class="doc-skill-values">Jupyter Notebook, Excel, Power BI, Git/GitHub</span>
          </li>
          <li class="doc-skills-row">
            <span class="doc-skill-label">• Core Strengths:</span>
            <span class="doc-skill-values">Problem Solving, Analytical Thinking, Communication, Team Collaboration</span>
          </li>
        </ul>
      </section>

      <!-- Professional Experience -->
      <section class="doc-section">
        <h2 class="doc-section-title">${getIcon('layers')} EXPERIENCE</h2>
        <div class="doc-item">
          <div class="doc-item-header">
            <div class="doc-item-title-wrap">
              <span class="doc-item-role">Data Analyst Intern</span>
              <span class="doc-sep">|</span>
              <span class="doc-item-org">Alfido Tech (Remote)</span>
            </div>
            <span class="doc-item-date">Aug 2026 – Oct 2026</span>
          </div>
          <ul class="doc-bullets">
            <li class="doc-bullet">• Cleaned and preprocessed <strong>5+ raw datasets (50,000+ rows total)</strong> using Python (Pandas, NumPy), fixing missing values, duplicates, and outliers to improve data quality by an estimated 30%.</li>
            <li class="doc-bullet">• Performed feature engineering and exploratory data analysis (EDA) across 5 business datasets to identify KPIs, trends, and actionable insights, presented to a 4-person project team.</li>
            <li class="doc-bullet">• Built <strong>10+ visualizations and summary reports</strong> using Matplotlib and Seaborn, translating raw data into clear, decision-ready insights for stakeholders.</li>
            <li class="doc-bullet">• Automated repetitive data-cleaning steps with reusable Python functions, cutting manual processing time by roughly <strong>40%</strong>.</li>
          </ul>
        </div>
      </section>

      <!-- Projects -->
      <section class="doc-section">
        <h2 class="doc-section-title">${getIcon('chart')} PROJECTS</h2>
        
        <!-- Project 1 -->
        <div class="doc-item">
          <div class="doc-item-header">
            <div class="doc-item-title-wrap">
              <a href="#projects" class="doc-item-role doc-proj-trigger" data-proj-id="project-rfm">Customer Behavior &amp; RFM Segmentation Analysis (End-to-End)</a>
              <span class="doc-sep">|</span>
              <span class="doc-item-tech">Python, Pandas, NumPy, Matplotlib, Seaborn, Power BI</span>
            </div>
          </div>
          <ul class="doc-bullets">
            <li class="doc-bullet">• Cleaned and analyzed <strong>10,000+ customer transaction records</strong>, engineering RFM (Recency, Frequency, Monetary) features to segment customers into 5 value tiers.</li>
            <li class="doc-bullet">• Identified high-value and at-risk segments (<strong>~20% of customers driving 60%+ of revenue</strong>), surfacing retention opportunities for targeted marketing.</li>
            <li class="doc-bullet">• Built an interactive <strong>Power BI dashboard</strong> to visualize customer segments and RFM scores, enabling stakeholders to track retention and revenue trends at a glance.</li>
          </ul>
        </div>

        <!-- Project 2 -->
        <div class="doc-item">
          <div class="doc-item-header">
            <div class="doc-item-title-wrap">
              <a href="#projects" class="doc-item-role doc-proj-trigger" data-proj-id="project-sales">Sales Performance Analysis (End-to-End)</a>
              <span class="doc-sep">|</span>
              <span class="doc-item-tech">Python, SQL, Pandas, Matplotlib, Seaborn, Power BI</span>
            </div>
          </div>
          <ul class="doc-bullets">
            <li class="doc-bullet">• Wrote complex SQL queries (joins, aggregations, window functions) to extract and summarize sales, revenue, and profit across regions and categories using the <strong>Superstore dataset (9,800+ records)</strong>.</li>
            <li class="doc-bullet">• Built an interactive <strong>Power BI dashboard (5+ visuals)</strong> highlighting top products and seasonal trends, surfacing 3+ actionable improvement areas.</li>
          </ul>
        </div>

        <!-- Project 3 -->
        <div class="doc-item">
          <div class="doc-item-header">
            <div class="doc-item-title-wrap">
              <a href="#projects" class="doc-item-role doc-proj-trigger" data-proj-id="project-traffic">Website Traffic Analysis (End-to-End)</a>
              <span class="doc-sep">|</span>
              <span class="doc-item-tech">Python, Pandas, NumPy, Matplotlib, Seaborn</span>
            </div>
          </div>
          <ul class="doc-bullets">
            <li class="doc-bullet">• Cleaned and analyzed website traffic data spanning thousands of sessions, covering users, bounce rate, and average session duration.</li>
            <li class="doc-bullet">• Identified top 5 landing/exit pages and referral sources, recommending changes projected to improve conversion and engagement.</li>
          </ul>
        </div>
      </section>

      <!-- Education -->
      <section class="doc-section">
        <h2 class="doc-section-title">${getIcon('server')} EDUCATION</h2>
        <div class="doc-item">
          <div class="doc-item-header">
            <div class="doc-item-title-wrap">
              <span class="doc-item-role">B.Tech, Computer Science (AI &amp; DS)</span>
              <span class="doc-sep">|</span>
              <span class="doc-item-org">IIMT Engineering College (AKTU)</span>
              <span class="doc-sep">—</span>
              <span class="doc-item-tech">CGPA: <strong>7.2</strong></span>
            </div>
            <span class="doc-item-date">2023 – 2027</span>
          </div>
        </div>

        <div class="doc-item">
          <div class="doc-item-header">
            <div class="doc-item-title-wrap">
              <span class="doc-item-role">Class XII (CBSE)</span>
              <span class="doc-sep">|</span>
              <span class="doc-item-org">Paramount Academy</span>
              <span class="doc-sep">—</span>
              <span class="doc-item-tech">Percentage: <strong>67.6%</strong></span>
            </div>
            <span class="doc-item-date">2023</span>
          </div>
        </div>

        <div class="doc-item">
          <div class="doc-item-header">
            <div class="doc-item-title-wrap">
              <span class="doc-item-role">Class X (CBSE)</span>
              <span class="doc-sep">|</span>
              <span class="doc-item-org">Paramount Academy</span>
              <span class="doc-sep">—</span>
              <span class="doc-item-tech">Percentage: <strong>65.4%</strong></span>
            </div>
            <span class="doc-item-date">2021</span>
          </div>
        </div>
      </section>

      <!-- Achievements & Certifications -->
      <section class="doc-section">
        <h2 class="doc-section-title">${getIcon('award')} ACHIEVEMENTS &amp; CERTIFICATIONS</h2>
        <ul class="doc-bullets">
          <li class="doc-bullet">• <a href="https://coursera.org/verify/professional-cert/EP3O21XSWB7Z" target="_blank" rel="noopener noreferrer" class="doc-cert-link doc-cert-trigger" data-cert-id="cert-google-data-analytics" title="Preview Certificate">${getIcon('external')} <strong>Google Data Analytics Professional Certificate</strong></a> – Google &amp; Coursera (ID: EP3O21XSWB7Z, Jun 2026).</li>
          <li class="doc-bullet">• <a href="https://www.pw.live" target="_blank" rel="noopener noreferrer" class="doc-cert-link doc-cert-trigger" data-cert-id="cert-pw-aiml-bootcamp" title="Preview Certificate">${getIcon('external')} <strong>AI/ML Launchpad Bootcamp</strong></a> – Physics Wallah (PW) &amp; NSDC (Cert: f88d59a0-c12b-474b-b0e7-092097a0fbd8, Jun 2026).</li>
          <li class="doc-bullet">• <a href="https://www.skillcourse.in" target="_blank" rel="noopener noreferrer" class="doc-cert-link doc-cert-trigger" data-cert-id="cert-skillcourse-powerbi" title="Preview Certificate">${getIcon('external')} <strong>Power BI Micro Course</strong></a> – Skill Course (ID: SC-B22A7DDD69, ISO 9001:2015, Completed: 18/12/2025).</li>
          <li class="doc-bullet">• <a href="https://www.hackerrank.com/certificates/967bfb00fd4b" target="_blank" rel="noopener noreferrer" class="doc-cert-link doc-cert-trigger" data-cert-id="cert-hackerrank-sql" title="Preview Certificate">${getIcon('external')} <strong>SQL (Basic) Skill Certification</strong></a> – HackerRank (Earned: 07 Mar 2026).</li>
          <li class="doc-bullet">• <a href="https://verify.onwingspan.com" target="_blank" rel="noopener noreferrer" class="doc-cert-link doc-cert-trigger" data-cert-id="cert-infosys-datascience" title="Preview Certificate">${getIcon('external')} <strong>Python for Data Science</strong></a> – Infosys Springboard (Issued: April 27, 2025, verify.onwingspan.com).</li>
          <li class="doc-bullet">• <a href="https://iimtindia.net" target="_blank" rel="noopener noreferrer" class="doc-cert-link doc-cert-trigger" data-cert-id="cert-iimt-iot" title="Preview Certificate">${getIcon('external')} <strong>Advance Internet of Things (IoT)</strong></a> – IIMT College of Engineering &amp; Technoledge (Cert: T/IOT/712613/25).</li>
          <li class="doc-bullet">• Solved <strong>100+ SQL queries and challenges on LeetCode &amp; HackerRank</strong>, strengthening query optimization.</li>
        </ul>
      </section>
    </article>
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
Data Analyst | Python | SQL | Power BI | Excel
${resumeEmail} | ${phone} | linkedin.com/in/chintu-kumar-767909190 | github.com/ChintuYadav001
100+ SQL Queries Solved • 10,000+ Records Analyzed • 3 End-to-End Analytics Projects • 50,000+ Raw Rows Cleaned

CAREER OBJECTIVE
B.Tech Computer Science (AI & DS) student with a strong foundation in Python, SQL, Excel, and Power BI. Skilled in data cleaning, exploratory data analysis (EDA), data visualization, and dashboard development. Seeking a Data Analyst opportunity to apply analytical skills, solve business problems, and contribute to data-driven decision-making.

TECHNICAL SKILLS
• Programming Languages: Python, SQL
• Python Libraries: Pandas, NumPy, Matplotlib, Seaborn
• Data Analysis: Exploratory Data Analysis (EDA), Data Cleaning, Data Wrangling, Statistical Analysis
• Data Visualization & BI: Power BI (Dashboards, DAX: CALCULATE, SUMX, RANKX), MS Excel (Pivot Tables, VLOOKUP, INDEX-MATCH)
• Database Management: MySQL, PostgreSQL (Joins, Subqueries, Aggregate Functions, Window Functions), Data Modeling, ETL Basics
• Business Analytics: KPI Analysis, Business Intelligence, Dashboarding, Statistical Analysis, Data Interpretation
• Tools & Technologies: Jupyter Notebook, Excel, Power BI, Git/GitHub
• Core Strengths: Problem Solving, Analytical Thinking, Communication, Team Collaboration

EXPERIENCE
Data Analyst Intern | Alfido Tech (Remote)
Aug 2026 – Oct 2026
• Cleaned and preprocessed 5+ raw datasets (50,000+ rows total) using Python (Pandas, NumPy), fixing missing values, duplicates, and outliers to improve data quality by an estimated 30%.
• Performed feature engineering and exploratory data analysis (EDA) across 5 business datasets to identify KPIs, trends, and actionable insights, presented to a 4-person project team.
• Built 10+ visualizations and summary reports using Matplotlib and Seaborn, translating raw data into clear, decision-ready insights for stakeholders.
• Automated repetitive data-cleaning steps with reusable Python functions, cutting manual processing time by roughly 40%.

PROJECTS
Customer Behavior & RFM Segmentation Analysis (End-to-End) | Python, Pandas, NumPy, Matplotlib, Seaborn, Power BI
• Cleaned and analyzed 10,000+ customer transaction records, engineering RFM (Recency, Frequency, Monetary) features to segment customers into 5 value tiers.
• Identified high-value and at-risk segments (~20% of customers driving 60%+ of revenue), surfacing retention opportunities for targeted marketing.
• Built an interactive Power BI dashboard to visualize customer segments and RFM scores, enabling stakeholders to track retention and revenue trends at a glance.

Sales Performance Analysis (End-to-End) | Python, SQL, Pandas, Matplotlib, Seaborn, Power BI
• Wrote complex SQL queries (joins, aggregations, window functions) to extract and summarize sales, revenue, and profit across regions and categories using the Superstore dataset (9,800+ records).
• Built an interactive Power BI dashboard (5+ visuals) highlighting top products and seasonal trends, surfacing 3+ actionable improvement areas.

Website Traffic Analysis (End-to-End) | Python, Pandas, NumPy, Matplotlib, Seaborn
• Cleaned and analyzed website traffic data spanning thousands of sessions, covering users, bounce rate, and average session duration.
• Identified top 5 landing/exit pages and referral sources, recommending changes projected to improve conversion and engagement.

EDUCATION
B.Tech, Computer Science (AI & DS) | IIMT Engineering College (AKTU) — CGPA: 7.2 2023 – 2027
Class XII (CBSE) | Paramount Academy — Percentage: 67.6% 2023
Class X (CBSE) | Paramount Academy — Percentage: 65.4% 2021

ACHIEVEMENTS & CERTIFICATIONS
• Google Data Analytics Professional Certificate – Google & Coursera (ID: EP3O21XSWB7Z, Jun 2026).
• AI/ML Launchpad Bootcamp – Physics Wallah (PW) & NSDC (Cert: f88d59a0-c12b-474b-b0e7-092097a0fbd8, Jun 2026).
• Power BI Micro Course – Skill Course (ID: SC-B22A7DDD69, ISO 9001:2015, Completed: 18/12/2025).
• SQL (Basic) Skill Certification – HackerRank (Earned: 07 Mar 2026).
• Python for Data Science – Infosys Springboard (Issued: April 27, 2025, verify.onwingspan.com).
• Advance Internet of Things (IoT) – IIMT College of Engineering & Technoledge (Cert: T/IOT/712613/25).
• Solved 100+ SQL queries and challenges on LeetCode & HackerRank, strengthening query optimization.
`;
}
