/* ==========================================================================
   PORTFOLIO DATA STORE - CHINTU KUMAR
   Module: portfolioData.js
   Centralized data layer with authentic resume and verified certificates data.
   ========================================================================== */

export const portfolioData = {
  personalInfo: {
    name: "Chintu Kumar",
    title: "Aspiring Data Analyst | Python | SQL | Power BI",
    badge: "Available for Data Analyst Roles",
    typewriterRoles: [
      "Aspiring Data Analyst",
      "Python & SQL Specialist",
      "Power BI Dashboard Designer",
      "EDA & Business Intelligence"
    ],
    heroBio: "B.Tech Computer Science (AI & DS) student with a strong foundation in Python, SQL, Excel, and Power BI. Skilled in data cleaning, exploratory data analysis (EDA), data visualization, and dashboard development. Seeking a Data Analyst opportunity to apply analytical skills, solve business problems, and contribute to data-driven decision-making.",
    bio: "B.Tech Computer Science (AI & DS) student with a strong foundation in Python, SQL, Excel, and Power BI. Skilled in data cleaning, exploratory data analysis (EDA), data visualization, and dashboard development. Seeking a Data Analyst opportunity to apply analytical skills, solve business problems, and contribute to data-driven decision-making.",
    careerObjective: "B.Tech Computer Science (AI & DS) student with a strong foundation in Python, SQL, Excel, and Power BI. Skilled in data cleaning, exploratory data analysis (EDA), data visualization, and dashboard development. Seeking a Data Analyst opportunity to apply analytical skills, solve business problems, and contribute to data-driven decision-making.",
    location: "Greater Noida / Delhi NCR, India (Open to Remote & Relocation)",
    email: "yadavchintu0012@gmail.com",
    resumeEmail: "chintukumaredu00@gmail.com",
    resumeLinkedin: "https://linkedin.com/in/chintu-kumar-767909190",
    phone: "+91 7763917713",
    whatsapp: "+91 7763917713",
    whatsappUrl: "https://wa.me/917763917713",
    resumeUrl: "#resume",
    socials: {
      github: "https://github.com/ChintuYadav001",
      linkedin: "https://linkedin.com/in/chintu-kumar-767909190",
      whatsapp: "https://wa.me/917763917713",
      email: "mailto:yadavchintu0012@gmail.com",
      phone: "tel:+917763917713"
    },
    highlights: [
      "SQL: CTEs, Window Funcs & Joins",
      "Python: Pandas, NumPy & IQR EDA",
      "Power BI: DAX, Star Schema & KPIs",
      "Pipelines: 50,000+ Cleaned Rows"
    ]
  },

  stats: [
    { label: "SQL Problems Solved", value: 100, suffix: "+" },
    { label: "Records Analyzed", value: 10000, suffix: "+" },
    { label: "Analytics Projects", value: 3, suffix: " End-to-End" },
    { label: "Raw Rows Preprocessed", value: 50000, suffix: "+" }
  ],

  timeline: {
    experience: [
      {
        role: "Data Analyst Intern",
        organization: "Alfido Tech (Remote)",
        location: "Remote",
        period: "Aug 2026 – Oct 2026",
        badge: "Completed Internship",
        kpis: [
          { label: "Raw Records Cleaned", value: "50,000+" },
          { label: "Data Quality Lift", value: "30%" },
          { label: "Time Saved via Functions", value: "40%" },
          { label: "Visualizations Built", value: "10+" }
        ],
        highlights: [
          "Cleaned and preprocessed 5+ raw datasets (50,000+ rows total) using Python (Pandas, NumPy), fixing missing values, duplicates, and outliers to improve data quality by an estimated 30%.",
          "Performed feature engineering and exploratory data analysis (EDA) across 5 business datasets to identify KPIs, trends, and actionable insights, presented to a 4-person project team.",
          "Built 10+ visualizations and summary reports using Matplotlib and Seaborn, translating raw data into clear, decision-ready insights for stakeholders.",
          "Automated repetitive data-cleaning steps with reusable Python functions, cutting manual processing time by roughly 40%."
        ],
        skills: ["Python", "Pandas", "NumPy", "EDA", "Data Cleaning", "Matplotlib", "Seaborn", "Feature Engineering"]
      }
    ],
    education: [
      {
        role: "B.Tech, Computer Science (AI & DS)",
        organization: "IIMT Engineering College (AKTU)",
        location: "Greater Noida, UP",
        period: "2023 – 2027",
        badge: "Pursuing (3rd Year)",
        grade: "CGPA: 7.2",
        highlights: [
          "Specializing in Artificial Intelligence and Data Science with deep focus on algorithmic problem solving, relational databases, and predictive modeling.",
          "Completed comprehensive coursework in Database Management Systems (DBMS), SQL querying, Python data structures, probability & statistics, and machine learning architectures.",
          "Actively building production-grade data analytics pipelines, RFM customer segmentation models, and interactive executive dashboards."
        ],
        skills: ["CGPA: 7.2", "Roll No: 2302161630036", "Python", "SQL", "Data Science", "Machine Learning", "Data Structures", "DBMS"]
      },
      {
        role: "Class XII (CBSE)",
        organization: "Paramount Academy",
        location: "Bihar, India",
        period: "2023",
        badge: "CBSE Board",
        grade: "Percentage: 67.6%",
        highlights: [
          "Completed Senior Secondary Education with core concentrations in Mathematics, Physics, and Chemistry, establishing strong quantitative reasoning and analytical problem-solving skills."
        ],
        skills: ["Percentage: 67.6%", "Mathematics", "Science", "Quantitative Analysis"]
      },
      {
        role: "Class X (CBSE)",
        organization: "Paramount Academy",
        location: "Bihar, India",
        period: "2021",
        badge: "CBSE Board",
        grade: "Percentage: 65.4%",
        highlights: [
          "Completed High School Secondary Education under the Central Board of Secondary Education (CBSE) with strong foundations in science and mathematics."
        ],
        skills: ["Percentage: 65.4%", "General Sciences", "Mathematics"]
      }
    ]
  },

  skills: [
    // Programming & Core Libraries
    { name: "Python", category: "frontend", level: 90, icon: "code" },
    { name: "SQL", category: "frontend", level: 92, icon: "database" },
    { name: "Pandas & NumPy", category: "frontend", level: 88, icon: "layers" },
    { name: "Matplotlib & Seaborn", category: "frontend", level: 86, icon: "chart" },

    // Data Visualization & BI Tools
    { name: "Power BI (Dashboards & Reports)", category: "backend", level: 90, icon: "layout" },
    { name: "DAX (CALCULATE, SUMX, RANKX)", category: "backend", level: 82, icon: "zap" },
    { name: "Microsoft Excel (Pivot Tables, VLOOKUP)", category: "backend", level: 92, icon: "table" },
    { name: "INDEX-MATCH & Business Charts", category: "backend", level: 88, icon: "chart" },

    // Database Management & ETL
    { name: "MySQL & PostgreSQL (Joins, Subqueries)", category: "devops", level: 90, icon: "database" },
    { name: "SQL Window & Aggregate Functions", category: "devops", level: 88, icon: "server" },
    { name: "Data Modeling & Normalization", category: "devops", level: 84, icon: "network" },
    { name: "ETL Fundamentals", category: "devops", level: 80, icon: "box" },

    // Analytics & Tools
    { name: "Exploratory Data Analysis (EDA)", category: "tools", level: 92, icon: "gauge" },
    { name: "Data Cleaning & Wrangling", category: "tools", level: 94, icon: "tool" },
    { name: "KPI & Business Intelligence", category: "tools", level: 86, icon: "chart" },
    { name: "Jupyter Notebook & Git/GitHub", category: "tools", level: 90, icon: "terminal" }
  ],

  projects: [
    {
      id: "project-rfm",
      title: "Customer Behavior & RFM Segmentation Analysis (End-to-End)",
      category: "fullstack",
      categoryLabel: "Python / Power BI",
      summary: "Cleaned and analyzed 10,000+ customer transaction records, engineering RFM features to segment customers into 5 tiers and built an interactive Power BI dashboard.",
      tags: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Power BI"],
      liveUrl: "https://github.com/ChintuYadav001",
      githubUrl: "https://github.com/ChintuYadav001",
      details: {
        overview: "An end-to-end customer segmentation analysis engineered to uncover purchasing behavior, customer lifetime value distributions, and churn vulnerabilities.",
        architecture: "Data cleansing with Pandas & NumPy, RFM scoring into 5 value tiers, and interactive Power BI dashboard modeling for executive KPI visibility.",
        keyFeatures: [
          "Cleaned and analyzed 10,000+ customer transaction records, engineering RFM (Recency, Frequency, Monetary) features to segment customers into 5 value tiers.",
          "Identified high-value and at-risk segments (~20% of customers driving 60%+ of revenue), surfacing retention opportunities for targeted marketing.",
          "Built an interactive Power BI dashboard to visualize customer segments and RFM scores, enabling stakeholders to track retention and revenue trends at a glance."
        ]
      }
    },
    {
      id: "project-sales",
      title: "Sales Performance Analysis (End-to-End)",
      category: "frontend",
      categoryLabel: "SQL / Power BI",
      summary: "Wrote complex SQL queries (joins, aggregations, window functions) to extract and summarize sales across regions and built an interactive Power BI dashboard.",
      tags: ["Python", "SQL", "Pandas", "Matplotlib", "Seaborn", "Power BI"],
      liveUrl: "https://github.com/ChintuYadav001",
      githubUrl: "https://github.com/ChintuYadav001",
      details: {
        overview: "Comprehensive sales and profitability analysis conducted across regions, customer segments, and product categories using the Superstore dataset.",
        architecture: "SQL data aggregation pipelines feeding cleaned tables into Power BI for DAX measure calculations and dynamic multi-page visualizations.",
        keyFeatures: [
          "Wrote complex SQL queries (joins, aggregations, window functions) to extract and summarize sales, revenue, and profit across regions and categories using the Superstore dataset (9,800+ records).",
          "Built an interactive Power BI dashboard (5+ visuals) highlighting top products and seasonal trends, surfacing 3+ actionable improvement areas."
        ]
      }
    },
    {
      id: "project-traffic",
      title: "Website Traffic Analysis (End-to-End)",
      category: "ai",
      categoryLabel: "Python / EDA",
      summary: "Cleaned and analyzed website traffic data spanning thousands of sessions, covering users, bounce rate, and average session duration.",
      tags: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn"],
      liveUrl: "https://github.com/ChintuYadav001",
      githubUrl: "https://github.com/ChintuYadav001",
      details: {
        overview: "A digital analytics study dissecting user journey funnels, device performance, bounce rates, and traffic acquisition channels.",
        architecture: "Data wrangling in Jupyter Notebook, session duration outlier handling, and correlation analysis between referral channels and session metrics.",
        keyFeatures: [
          "Cleaned and analyzed website traffic data spanning thousands of sessions, covering users, bounce rate, and average session duration.",
          "Identified top 5 landing/exit pages and referral sources, recommending changes projected to improve conversion and engagement."
        ]
      }
    }
  ],

  // Complete Verified Certifications Store with Official IDs & Dates
  certificates: [
    {
      id: "cert-google-data-analytics",
      title: "Google Data Analytics Professional Certificate",
      issuer: "Google & Coursera",
      signer: "Amanda Brophy (Global Director of Google Career Certificates)",
      date: "Jun 30, 2026",
      certId: "EP3O21XSWB7Z",
      verifyUrl: "https://coursera.org/verify/professional-cert/EP3O21XSWB7Z",
      category: "analytics",
      badge: "Google Career Certificate (9 Courses)",
      type: "Professional Certificate",
      image: "assets/certificates/google_data_analytics_professional.png",
      pdfUrl: "assets/certificates/google_data_analytics_professional.pdf",
      hasOriginal: true,
      description: "Rigorous 9-course professional specialization developed by Google. Validates end-to-end competencies in data cleaning, exploratory analysis, SQL querying, spreadsheets, Tableau visualization, Python for analytics, and capstone case study completion.",
      skills: ["Google Data Analytics", "SQL", "Python", "Tableau", "Spreadsheets", "Data Cleaning", "Data Visualization"],
      isPlaceholder: false
    },
    {
      id: "cert-pw-aiml-bootcamp",
      title: "AI/ML Launchpad Bootcamp",
      issuer: "Physics Wallah (PW) & NSDC",
      signer: "Mr. Alakh Pandey (Founder, Physics Wallah)",
      date: "29th June 2026",
      certId: "f88d59a0-c12b-474b-b0e7-092097a0fbd8",
      verifyUrl: "https://www.pw.live",
      category: "ai",
      badge: "PW & NSDC Accredited",
      type: "Bootcamp Certification",
      image: "assets/certificates/pw_aiml_launchpad_bootcamp.png",
      pdfUrl: "assets/certificates/pw_aiml_launchpad_bootcamp.pdf",
      hasOriginal: true,
      description: "Successfully completed the rigorous AI/ML Launchpad Bootcamp Program conducted by Physics Wallah (PW) in association with NSDC (National Skill Development Corporation). Validates applied expertise in machine learning algorithms, artificial intelligence models, statistical learning, and Python AI pipeline development.",
      skills: ["Machine Learning", "Artificial Intelligence", "Python", "Data Modeling", "Predictive Analytics"],
      isPlaceholder: false
    },
    {
      id: "cert-skillcourse-powerbi",
      title: "Power BI Micro Course",
      issuer: "Skill Course",
      signer: "Satish Dhawale (Founder of Skill Course)",
      date: "18/12/2025",
      certId: "SC-B22A7DDD69",
      verifyUrl: "https://www.skillcourse.in",
      category: "analytics",
      badge: "ISO 9001:2015 Certified",
      type: "Certificate of Completion",
      image: "assets/certificates/skillcourse_powerbi_microcourse.png",
      pdfUrl: "assets/certificates/skillcourse_powerbi_microcourse.pdf",
      hasOriginal: true,
      registrationNo: "INQ/AN-20622/127512/1025",
      description: "Successfully completed the Power BI Micro Course at Skill Course. Validates core competencies in interactive business dashboard construction, DAX measures (CALCULATE, SUMX, RANKX), data modeling, star schema design, and KPI reporting.",
      skills: ["Power BI", "DAX", "Data Modeling", "Business Intelligence", "KPI Dashboards"],
      isPlaceholder: false
    },
    {
      id: "cert-hackerrank-sql",
      title: "SQL (Basic) Skill Certification",
      issuer: "HackerRank",
      signer: "Harishankaran K (CTO, HackerRank)",
      date: "07 Mar, 2026",
      certId: "967BFB00FD4B",
      verifyUrl: "https://www.hackerrank.com/certificates/967bfb00fd4b",
      category: "sql",
      badge: "Skill Assessment Passed",
      type: "Certificate of Accomplishment",
      image: "assets/certificates/hackerrank_sql_basic.png",
      pdfUrl: "assets/certificates/hackerrank_sql_basic.pdf",
      hasOriginal: true,
      description: "Successfully passed the official HackerRank skill certification test validating advanced query writing, relational filtering, joins, aggregations, and database logic.",
      skills: ["SQL", "Relational Databases", "Complex Queries", "MySQL", "Data Aggregation"],
      isPlaceholder: false
    },
    {
      id: "cert-infosys-datascience",
      title: "Python for Data Science",
      issuer: "Infosys Springboard",
      signer: "Thirumala Arohi (EVP & Global Head ETA, Infosys Limited)",
      date: "April 27, 2025",
      certId: "INFOSYS-DS-2025-0427",
      verifyUrl: "https://verify.onwingspan.com",
      category: "python",
      badge: "Course Completion Certificate",
      type: "Course Completion",
      image: "assets/certificates/infosys_python_for_data_science.png",
      pdfUrl: "assets/certificates/infosys_python_for_data_science.pdf",
      hasOriginal: true,
      description: "Successfully completed the hands-on Python for Data Science curriculum on Infosys Springboard, applying Pandas, NumPy, and statistical analysis techniques to real-world datasets.",
      skills: ["Python", "Pandas", "NumPy", "Data Wrangling", "Statistical Analysis"],
      isPlaceholder: false
    },
    {
      id: "cert-infosys-python",
      title: "Introduction to Python",
      issuer: "Infosys Springboard",
      signer: "Thirumala Arohi (EVP & Global Head ETA, Infosys Limited)",
      date: "May 16, 2025",
      certId: "INFOSYS-PY-2025-0516",
      verifyUrl: "https://verify.onwingspan.com",
      category: "python",
      badge: "Course Completion Certificate",
      type: "Course Completion",
      image: "assets/certificates/infosys_intro_to_python.png",
      pdfUrl: "assets/certificates/infosys_intro_to_python.pdf",
      hasOriginal: true,
      description: "Completed rigorous core Python programming curriculum covering control flow, data structures, object-oriented principles, algorithmic problem-solving, and modular function development.",
      skills: ["Python Core", "Data Structures", "Functions & Modules", "OOP", "Logic Building"],
      isPlaceholder: false
    },
    {
      id: "cert-iimt-iot",
      title: "Advance Internet of Things (IoT)",
      issuer: "IIMT College of Engineering & Technoledge Eduresearch",
      signer: "Dean IIMT College & Director Technoledge Eduresearch",
      date: "09 Sep 2024 – 17 Jan 2025",
      certId: "T/IOT/712613/25",
      verifyUrl: "https://iimtindia.net",
      category: "iot",
      badge: "Govt & Industry Accredited",
      type: "Certificate of Completion",
      image: "assets/certificates/technoledge_advance_iot.png",
      pdfUrl: "assets/certificates/technoledge_advance_iot.pdf",
      hasOriginal: true,
      rollNo: "2302161630036",
      department: "CSE (AI & DS)",
      description: "4-month intensive training program covering IoT architecture, sensor telemetry, edge data collection, embedded controllers, and industrial networking in association with Technoledge Eduresearch under supervision of Dreamvessels Technologies. Recognized by GeM, ISO 9001:2015, MSME, ASME, #startupindia, and NSDC.",
      skills: ["IoT Architecture", "Sensor Telemetry", "Data Acquisition", "Embedded Systems", "Edge Analytics"],
      isPlaceholder: false
    },
    {
      id: "cert-iimt-iot-coe",
      title: "Advance Internet of Things - Centre of Excellence",
      issuer: "Centre of Excellence / IIMT & Technoledge Eduresearch",
      signer: "Director Technoledge & Dean IIMT College of Engineering",
      date: "Sep 2024 – Jan 2025",
      certId: "T/IOT/711753/25",
      verifyUrl: "https://iimtindia.net",
      category: "iot",
      badge: "Centre of Excellence Honor",
      type: "Certificate of Completion",
      image: "assets/certificates/technoledge_advance_iot_coe.png",
      pdfUrl: "assets/certificates/technoledge_advance_iot.pdf",
      hasOriginal: true,
      rollNo: "2302161630036",
      department: "CSE (AI & DS)",
      description: "Advanced IoT Centre of Excellence certification validating real-world hardware integration, telemetry parsing, and distributed edge sensor network implementation.",
      skills: ["Sensor Networks", "Edge Computing", "Hardware Integration", "Telemetry Streaming"],
      isPlaceholder: false
    },
    {
      id: "cert-leetcode-sql",
      title: "100+ SQL Queries Solved",
      issuer: "LeetCode & HackerRank",
      signer: "Database Query Problem Solving",
      date: "Active Practice",
      certId: "SQL-MASTERY-100",
      verifyUrl: "https://leetcode.com",
      category: "sql",
      badge: "Algorithm & Query Mastery",
      type: "Problem Solving Milestone",
      description: "Mastered 100+ complex database retrieval, ETL transformations, and algorithmic SQL queries covering Window Functions (ROW_NUMBER, RANK, DENSE_RANK), self-joins, CTEs, aggregations, and query optimization.",
      skills: ["100+ SQL Queries", "Window Functions", "Self Joins", "CTEs", "Subqueries", "Query Optimization"],
      isPlaceholder: false
    }
  ],

  // LinkedIn & Professional Social Presence Store
  linkedInProfile: {
    profileUrl: "https://linkedin.com/in/chintu-yadav-767909190",
    headline: "Aspiring Data Analyst | Python, SQL, Power BI, EDA | B.Tech CSE (AI & Data Science) at IIMT | Ex-Data Analyst Intern at Alfido Tech | Google Certified",
    summary: "Aspiring Data Analyst with proven experience preprocessing 50,000+ business records and engineering automated ETL scripts in Python. Skilled in SQL querying (CTEs, Window Functions, joins) and building interactive executive Power BI dashboards with DAX measures. Holds 9 verified credentials including the Google Data Analytics Professional Certificate and Physics Wallah AI/ML Bootcamp. Dedicated to converting ambiguous, noisy data into actionable business intelligence.",
    targetRoles: [
      "Data Analyst",
      "Junior Data Analyst",
      "Business Intelligence (BI) Analyst",
      "Python / SQL Data Specialist",
      "Data Analytics Intern"
    ],
    openToWork: true,
    noticePeriod: "Immediate Joiner (0 days notice)",
    workMode: "Open to Remote, Hybrid, or On-site",
    openToRelocate: true,
    preferredLocations: "Delhi NCR, Greater Noida, Bangalore, Hyderabad, Pune, Mumbai, or Remote Worldwide",
    languages: ["English (Professional Working)", "Hindi (Native / Bilingual)"]
  },

  // Expanded AI Voice Assistant Knowledge Base & Interview Q&A
  aiKnowledgeBase: {
    elevatorPitch: "I'm Chintu Kumar, a Computer Science undergraduate specializing in Artificial Intelligence and Data Science at IIMT Engineering College. I transform noisy, disorganized data into clean, automated pipelines and executive Power BI dashboards. Through my internship at Alfido Tech and hands-on projects, I've cleaned over 50,000 records, solved 100+ SQL queries, and earned 9 verified industry certifications including Google Data Analytics and Physics Wallah AI/ML Bootcamp.",
    whyHire: [
      "Practical Execution: Preprocessed 50,000+ real records and automated pipelines cutting manual preprocessing time by 40%.",
      "Full Data Lifecycle: Proficient from raw extraction (SQL/Python) to ETL, EDA, and executive visualization (Power BI/DAX).",
      "Verified Competence: 9 authentic certificates (Google, HackerRank, Infosys, Physics Wallah, Skill Course) and 100+ solved SQL challenges.",
      "Immediate Impact: Ready to start immediately with strong collaborative skills and relentless curiosity."
    ],
    strengths: [
      "End-to-End Data Pipeline Proficiency: From raw dirty CSVs to automated Python cleaning and SQL transformations.",
      "Executive Dashboard Design: Star schema modeling, DAX measures (CALCULATE, SUMX), and intuitive visual storytelling.",
      "Rigorous Verification: 9 authentic certificates, 100+ SQL queries solved, and continuous learning.",
      "Agile Collaboration & Communication: Experienced in presenting findings to cross-functional stakeholders."
    ],
    weaknesses: [
      "Detail Obsession: Sometimes spends extra time perfecting visual micro-interactions and chart styling; addresses this using timeboxing and agile priority sprints.",
      "Cloud Scale Experience: Actively expanding from local PostgreSQL/MySQL and Power BI into cloud platforms like Google BigQuery and Snowflake."
    ],
    careerVision: "To work as a high-performing Data Analyst in a data-forward organization, optimizing automated pipelines and designing self-service business intelligence dashboards, ultimately progressing to a Data Architect or BI Solutions Lead.",
    dailyWorkflow: "1. Problem Definition: Understand business KPIs and questions.\n2. Data Ingestion & Audit: Assess nulls, types, duplicates, and outliers.\n3. Preprocessing: Automated cleaning with Pandas, NumPy, and SQL.\n4. EDA & Segmentation: Discover correlations, RFM tiers, and behavioral anomalies.\n5. Visualization: Interactive Power BI dashboards with DAX measures.\n6. Storytelling: Present actionable insights and measurable ROI to stakeholders.",
    faqs: [
      {
        topic: "Data Cleaning Technique",
        q: "How do you clean and preprocess data?",
        a: "I assess missing data mechanisms (MCAR, MAR, MNAR), impute skewed variables with median and categorical with mode/unknown, clip outliers using Interquartile Range (Q1 - 1.5*IQR to Q3 + 1.5*IQR), eliminate duplicate rows, standardize datetime formats, and build reusable Python functions."
      },
      {
        topic: "SQL Concepts",
        q: "What are Window Functions and why use them?",
        a: "Window functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG) perform calculations across rows related to the current row without collapsing them like GROUP BY does, perfect for running totals, top-N per category, and moving averages."
      },
      {
        topic: "Power BI DAX",
        q: "What is the difference between CALCULATE and SUM in DAX?",
        a: "SUM aggregates numbers in the existing filter context. CALCULATE modifies the filter context, allowing you to add, override, or clear filters for complex KPIs like YTD revenue and market share percentages."
      },
      {
        topic: "Customer Segmentation",
        q: "What is RFM analysis?",
        a: "RFM segments customers by Recency (days since last purchase), Frequency (number of orders), and Monetary value (total spend). In my project of 10,000+ transactions, it isolated high-value Champions (top ~20% driving 60%+ revenue) and at-risk churn tiers."
      }
    ]
  },

  // Real-time visitor alert settings to notify the portfolio owner
  visitorAlert: {
    enabled: true,
    ownerEmail: "yadavchintu0012@gmail.com",
    cooldownMinutes: 30, // Prevents email flood if a visitor refreshes multiple times
    enableEmailAlerts: true,
    // Instant phone push notifications via ntfy (NO activation links, 100% free)
    ntfy: {
      enabled: true,
      topic: "chintu_portfolio_alerts_7763"
    },
    telegram: {
      enabled: false, // Set to true to receive instant push alerts on your phone
      botToken: "",  // Your Telegram Bot Token from @BotFather
      chatId: ""     // Your Chat ID from @userinfobot
    },
    discord: {
      enabled: false,
      webhookUrl: ""
    }
  }
};

