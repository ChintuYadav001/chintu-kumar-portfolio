# Chintu Kumar - Data Analyst Portfolio & Credentials

A modern, high-performance developer and analytics portfolio built with a strictly decoupled, modular architecture. Everything is organized into separate, maintainable modules without any external build-step overhead or framework dependencies.

---

## 📁 Architecture & File Structure

```
d:/antigrevity_project/
├── index.html                   # Semantic HTML5 structure
├── README.md                    # Setup, modular architecture & customization guide
├── css/
│   ├── main.css                 # Master aggregator importing all CSS modules
│   ├── variables.css            # Design tokens, color palettes (Dark/Light mode), spacing
│   ├── base.css                 # CSS reset, typography, containers & button components
│   ├── animations.css           # Keyframes, floating orbs & scroll reveal transitions
│   ├── navbar.css               # Glassmorphic navigation bar, theme toggle & mobile drawer
│   ├── hero.css                 # Data Analytics Command Center widget with live sparklines
│   ├── about.css                # About section layout & interactive stats counter cards
│   ├── timeline.css             # Career experience and education milestone timeline
│   ├── skills.css               # Categorized skills grid & animated progress bars
│   ├── projects.css             # Filterable project showcase cards with authentic analytics SVGs
│   ├── certificates.css         # Verified credentials, badges & future certificate slots
│   ├── certificateModal.css     # [NEW] Full-sized visual certificate lightbox & category filters
│   ├── resume.css               # ATS paper sheet styling, action bar, and print rules (@media print)
│   ├── contact.css              # Direct contact cards & interactive form
│   ├── webgl-3d.css             # [NEW] 3D canvas overlay, HUD controls, 3D badge lighting
│   ├── modal.css                # Accessible project quick-view modal dialog
│   ├── toast.css                # Floating notification alerts
│   └── footer.css               # Footer layout, copyright & back-to-top button
└── js/
    ├── vendor/
    │   └── three.min.js         # [NEW] High-performance Three.js r128 engine (local + offline resilient)
    ├── main.js                  # Application entry point orchestrating all modules
    ├── data/
    │   └── portfolioData.js     # Centralized data store (profile, projects, skills, timeline, certificates)
    └── modules/
        ├── scene3d.js           # [NEW] Interactive 3D Hero Cyber Data Core with inertia drag & rings
        ├── background3d.js      # [NEW] Full-screen ambient 3D particle constellation canvas
        ├── tilt3d.js            # Interactive 3D cursor perspective physics & specular glare
        ├── icons.js             # Zero-dependency SVG icon system
        ├── theme.js             # Dark/Light theme switcher with localStorage persistence
        ├── navigation.js        # Sticky header, mobile drawer toggle & scroll-spy
        ├── typing.js            # Smooth typewriter effect for hero section titles
        ├── statsCounter.js      # Animated number counter on scroll into view
        ├── timeline.js          # Experience vs Education tab switching and rendering
        ├── skills.js            # Dynamic skill cards and category filter tabs
        ├── projects.js          # Project category filtering & modal detail launcher
        ├── certificates.js      # Credentials grid & category filtering
        ├── certificateModal.js  # Full-sized credential viewer modal & ID copy
        ├── resume.js            # Interactive ATS resume controller (Print PDF, Copy ATS text, Download)
        ├── modal.js             # Modal dialog controller with backdrop blur & ESC key support
        ├── contactForm.js       # Client-side validation, clipboard copying & submit state
        ├── toast.js             # Toast notification emitter
        └── scrollReveal.js      # IntersectionObserver scroll reveal animation handler
```

---

## 📜 Verified Certificates Included

1. **Google Data Analytics Professional Certificate** – Google & Coursera | Credential ID: `EP3O21XSWB7Z` | Date: `Jun 30, 2026` | Verification: `https://coursera.org/verify/professional-cert/EP3O21XSWB7Z`
2. **AI/ML Launchpad Bootcamp** – Physics Wallah (PW) & NSDC | Cert ID: `f88d59a0-c12b-474b-b0e7-092097a0fbd8` | Date: `29th June 2026` | Founder: `Alakh Pandey`
3. **Power BI Micro Course** – Skill Course | Cert ID: `SC-B22A7DDD69` | Date: `18/12/2025` | ISO 9001:2015 Reg: `INQ/AN-20622/127512/1025` | Founder: `Satish Dhawale`
4. **Python for Data Science** – Infosys Springboard | Issued: `April 27, 2025` | Verification: `verify.onwingspan.com`
5. **Introduction to Python** – Infosys Springboard | Issued: `May 16, 2025` | Verification: `verify.onwingspan.com`
6. **Advance Internet of Things (IoT)** – IIMT College of Engineering & Technoledge Eduresearch | Cert No: `T/IOT/712613/25` | Roll No: `2302161630036` | Duration: `Sep 2024 – Jan 2025` | Accredited by GeM, ISO, MSME, ASME, NSDC
7. **Advance Internet of Things (IoT) [Centre of Excellence]** – IIMT College of Engineering & Technoledge Eduresearch | Cert No: `T/IOT/711753/25` | Roll No: `2302161630036`
8. **SQL (Basic)** – HackerRank | Credential ID: `967BFB00FD4B` | Earned: `07 Mar, 2026`
9. **100+ SQL Queries Solved** – LeetCode &amp; HackerRank

---

## 🚀 How to Run Locally

```powershell
# From the project root (d:\antigrevity_project)
python -m http.server 8080
```

Then open your browser and navigate to:
```
http://localhost:8080
```
