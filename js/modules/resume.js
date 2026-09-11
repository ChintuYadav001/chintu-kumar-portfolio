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

  return `
    <article class="resume-paper" id="resume-document">
      <!-- Document Header -->
      <header class="doc-header">
        <h1 class="doc-name">${personalInfo.name}</h1>
        <div class="doc-subhead">Aspiring Data Analyst | Python | SQL | Power BI | Excel</div>
        <div class="doc-contact-row">
          <a href="${personalInfo.socials.email}">${personalInfo.email}</a>
          <span class="doc-sep">•</span>
          <a href="${personalInfo.socials.phone}">${personalInfo.phone}</a>
          <span class="doc-sep">•</span>
          <a href="${personalInfo.socials.linkedin}" target="_blank" rel="noopener noreferrer">linkedin.com/in/chintu-yadav-767909190</a>
          <span class="doc-sep">•</span>
          <a href="${personalInfo.socials.github}" target="_blank" rel="noopener noreferrer">github.com/ChintuYadav001</a>
          <span class="doc-sep">•</span>
          <span>${personalInfo.location}</span>
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
        <p class="doc-objective-text">${personalInfo.bio}</p>
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
            <span class="doc-skill-values">Power BI (Dashboards, DAX: CALCULATE, SUMX, RANKX), Microsoft Excel (Pivot Tables, VLOOKUP, INDEX-MATCH, Charts)</span>
          </li>
          <li class="doc-skills-row">
            <span class="doc-skill-label">• Database Management:</span>
            <span class="doc-skill-values">MySQL (Joins, Subqueries, Aggregate Functions, Window Functions), Data Modeling, ETL Basics</span>
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
              <span class="doc-item-role">Customer Behavior &amp; RFM Segmentation Analysis</span>
              <span class="doc-sep">|</span>
              <span class="doc-item-tech">Python, Pandas, NumPy, Matplotlib, Seaborn</span>
            </div>
          </div>
          <ul class="doc-bullets">
            <li class="doc-bullet">• Cleaned and analyzed <strong>10,000+ customer transaction records</strong>, engineering RFM (Recency, Frequency, Monetary) features to segment customers into 5 value tiers.</li>
            <li class="doc-bullet">• Identified high-value and at-risk segments (<strong>~20% of customers driving 60%+ of revenue</strong>), surfacing retention opportunities for targeted marketing.</li>
          </ul>
        </div>

        <!-- Project 2 -->
        <div class="doc-item">
          <div class="doc-item-header">
            <div class="doc-item-title-wrap">
              <span class="doc-item-role">Sales Performance Analysis</span>
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
              <span class="doc-item-role">Website Traffic Analysis</span>
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
              <span class="doc-sep">•</span>
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
              <span class="doc-sep">•</span>
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
              <span class="doc-sep">•</span>
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
          <li class="doc-bullet">• <strong>Google Data Analytics Professional Certificate</strong> – Coursera &amp; Google (9-Course Specialization covering SQL, R, Tableau, Spreadsheets; ID: EP3O21XSWB7Z).</li>
          <li class="doc-bullet">• <strong>AI/ML Launchpad Bootcamp</strong> – Physics Wallah &amp; NSDC (Hands-on Machine Learning, Exploratory Data Analysis &amp; Data Pipelines).</li>
          <li class="doc-bullet">• <strong>HackerRank SQL (Basic) Certified &amp; LeetCode</strong> – <strong>100+ complex SQL queries &amp; problems solved</strong> covering joins, aggregations, and window functions.</li>
          <li class="doc-bullet">• <strong>Power BI &amp; Python Specializations</strong> – Power BI Micro Course (Skill Course, ISO 9001:2015) &amp; Python for Data Science (Infosys Springboard).</li>
          <li class="doc-bullet">• <strong>Advance Internet of Things (IoT) &amp; CoE</strong> – Technoledge &amp; IIMT College Centre of Excellence (Cert: T/IOT/711753/25).</li>
        </ul>
      </section>
    </article>
  `;
}

/**
 * Builds clean, ATS-compliant plaintext formatted text for portal pasting
 */
function generateAtsPlainText(data) {
  return `CHINTU KUMAR
Aspiring Data Analyst | Python | SQL | Power BI
${data.personalInfo.email} | ${data.personalInfo.phone} | linkedin.com/in/chintu-yadav-767909190 | github.com/ChintuYadav001
100+ SQL Queries Solved • 10,000+ Records Analyzed • 3 End-to-End Analytics Projects • 50,000+ Raw Rows Cleaned

CAREER OBJECTIVE
${data.personalInfo.bio}

TECHNICAL SKILLS
• Programming Languages: Python, SQL
• Python Libraries: Pandas, NumPy, Matplotlib, Seaborn
• Data Analysis: Exploratory Data Analysis (EDA), Data Cleaning, Data Wrangling, Statistical Analysis
• Data Visualization & BI Tools: Power BI (Dashboards, DAX: CALCULATE, SUMX, RANKX), Microsoft Excel (Pivot Tables, VLOOKUP, INDEX-MATCH, Charts)
• Database Management: MySQL (Joins, Subqueries, Aggregate Functions, Window Functions), Data Modeling, ETL Basics
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
B.Tech, Computer Science (AI & DS) | IIMT Engineering College (AKTU) (2023 – 2027)
CGPA: 7.2 | Roll No: 2302161630036

Class XII (CBSE) | Paramount Academy (2023)
Percentage: 67.6%

Class X (CBSE) | Paramount Academy (2021)
Percentage: 65.4%

ACHIEVEMENTS & CERTIFICATIONS
• Google Data Analytics Professional Certificate – Google & Coursera (ID: EP3O21XSWB7Z, Jun 2026)
• AI/ML Launchpad Bootcamp – Physics Wallah (PW) & NSDC (Cert: f88d59a0-c12b-474b-b0e7-092097a0fbd8, 29th June 2026)
• Power BI Micro Course – Skill Course (ID: SC-B22A7DDD69, ISO 9001:2015, 18/12/2025)
• SQL (Basic) Skill Certification – HackerRank (ID: 967BFB00FD4B, 07 Mar 2026)
• Python for Data Science – Infosys Springboard (27 April 2025)
• Advance Internet of Things (IoT) – IIMT College & Technoledge (T/IOT/712613/25, Sep 2024 – Jan 2025)
• Advance Internet of Things (IoT) [Centre of Excellence] – IIMT College & Technoledge (T/IOT/711753/25)
• Introduction to Python – Infosys Springboard (16 May 2025)
• 100+ SQL queries and problems solved on LeetCode
`;
}
