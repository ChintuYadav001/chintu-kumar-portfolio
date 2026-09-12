import os
import shutil

def generate_pdf():
    assets_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')
    os.makedirs(assets_dir, exist_ok=True)
    pdf_path = os.path.join(assets_dir, 'Chintu_Kumar_Data_Analyst_Resume.pdf')
    master_path = os.path.join(assets_dir, 'Chintu_Kumar_Data_Analyst_Resume_Master.pdf')

    if os.path.exists(master_path):
        shutil.copyfile(master_path, pdf_path)
        print(f"Preserved authentic 1-page ATS Resume at: {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")
        return

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=22,
        alignment=1, # Center
        textColor=colors.HexColor('#0f172a')
    )

    subhead_style = ParagraphStyle(
        'DocSubhead',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        alignment=1,
        textColor=colors.HexColor('#0284c7')
    )

    contact_style = ParagraphStyle(
        'DocContact',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        alignment=1,
        textColor=colors.HexColor('#475569')
    )

    metrics_style = ParagraphStyle(
        'DocMetrics',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        alignment=1,
        textColor=colors.HexColor('#0369a1')
    )

    sec_header_style = ParagraphStyle(
        'DocSectionHeader',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=7,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'DocBody',
        fontName='Helvetica',
        fontSize=8.2,
        leading=11,
        textColor=colors.HexColor('#334155')
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        fontName='Helvetica',
        fontSize=8.2,
        leading=10.5,
        textColor=colors.HexColor('#334155'),
        leftIndent=10
    )

    story = []

    # 1. Candidate Header
    story.append(Paragraph("CHINTU KUMAR", title_style))
    story.append(Paragraph("Aspiring Data Analyst | Python | SQL | Power BI | Excel", subhead_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("yadavchintu0012@gmail.com &nbsp;|&nbsp; +91 7763917713 &nbsp;|&nbsp; linkedin.com/in/chintu-yadav-767909190 &nbsp;|&nbsp; github.com/ChintuYadav001", contact_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("<b>100+ SQL Queries Solved &nbsp;•&nbsp; 10,000+ Records Analyzed &nbsp;•&nbsp; 3 End-to-End Analytics Projects &nbsp;•&nbsp; 50,000+ Raw Rows Cleaned</b>", metrics_style))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=4))

    # 2. Career Objective
    story.append(Paragraph("CAREER OBJECTIVE", sec_header_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#0284c7'), spaceAfter=3))
    story.append(Paragraph("B.Tech Computer Science (AI & DS) student with a strong foundation in Python, SQL, Excel, and Power BI. Skilled in data cleaning, exploratory data analysis (EDA), data visualization, and dashboard development. Seeking a Data Analyst opportunity to apply analytical skills, solve business problems, and contribute to data-driven decision-making.", body_style))

    # 3. Technical Skills
    story.append(Paragraph("TECHNICAL SKILLS", sec_header_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#0284c7'), spaceAfter=3))
    
    skills_data = [
        [Paragraph("<b>• Programming Languages:</b>", body_style), Paragraph("Python, SQL", body_style)],
        [Paragraph("<b>• Python Libraries:</b>", body_style), Paragraph("Pandas, NumPy, Matplotlib, Seaborn", body_style)],
        [Paragraph("<b>• Data Analysis:</b>", body_style), Paragraph("Exploratory Data Analysis (EDA), Data Cleaning, Data Wrangling, Statistical Analysis", body_style)],
        [Paragraph("<b>• Data Visualization & BI:</b>", body_style), Paragraph("Power BI (Dashboards, DAX: CALCULATE, SUMX, RANKX), MS Excel (Pivot Tables, VLOOKUP, INDEX-MATCH)", body_style)],
        [Paragraph("<b>• Database Management:</b>", body_style), Paragraph("MySQL (Joins, Subqueries, Aggregate Functions, Window Functions), Data Modeling, ETL Basics", body_style)],
        [Paragraph("<b>• Business Analytics:</b>", body_style), Paragraph("KPI Analysis, Business Intelligence, Dashboarding, Statistical Analysis, Data Interpretation", body_style)],
        [Paragraph("<b>• Tools & Technologies:</b>", body_style), Paragraph("Jupyter Notebook, Excel, Power BI, Git/GitHub", body_style)],
        [Paragraph("<b>• Core Strengths:</b>", body_style), Paragraph("Problem Solving, Analytical Thinking, Communication, Team Collaboration", body_style)]
    ]
    
    skill_table = Table(skills_data, colWidths=[150, 400])
    skill_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(skill_table)

    # 4. Professional Experience
    story.append(Paragraph("EXPERIENCE", sec_header_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#0284c7'), spaceAfter=3))
    
    exp_header = Table([
        [Paragraph("<b>Data Analyst Intern</b> | Alfido Tech (Remote)", body_style),
         Paragraph("<b>Aug 2026 – Oct 2026</b>", ParagraphStyle('RightDate', parent=body_style, alignment=2))]
    ], colWidths=[380, 170])
    exp_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2)
    ]))
    story.append(exp_header)
    
    story.append(Paragraph("• Cleaned and preprocessed <b>5+ raw datasets (50,000+ rows total)</b> using Python (Pandas, NumPy), fixing missing values, duplicates, and outliers to improve data quality by an estimated 30%.", bullet_style))
    story.append(Paragraph("• Performed feature engineering and exploratory data analysis (EDA) across 5 business datasets to identify KPIs, trends, and actionable insights, presented to a 4-person project team.", bullet_style))
    story.append(Paragraph("• Built <b>10+ visualizations and summary reports</b> using Matplotlib and Seaborn, translating raw data into clear, decision-ready insights for stakeholders.", bullet_style))
    story.append(Paragraph("• Automated repetitive data-cleaning steps with reusable Python functions, cutting manual processing time by roughly <b>40%</b>.", bullet_style))

    # 5. Projects
    story.append(Paragraph("PROJECTS", sec_header_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#0284c7'), spaceAfter=3))
    
    # Project 1
    story.append(Paragraph("<b>Customer Behavior & RFM Segmentation Analysis</b> | <i>Python, Pandas, NumPy, Matplotlib, Seaborn</i>", body_style))
    story.append(Paragraph("• Cleaned and analyzed <b>10,000+ customer transaction records</b>, engineering RFM (Recency, Frequency, Monetary) features to segment customers into 5 value tiers.", bullet_style))
    story.append(Paragraph("• Identified high-value and at-risk segments (<b>~20% of customers driving 60%+ of revenue</b>), surfacing retention opportunities for targeted marketing.", bullet_style))
    story.append(Spacer(1, 2))

    # Project 2
    story.append(Paragraph("<b>Sales Performance Analysis</b> | <i>Python, SQL, Pandas, Matplotlib, Seaborn, Power BI</i>", body_style))
    story.append(Paragraph("• Wrote complex SQL queries (joins, aggregations, window functions) to extract and summarize sales, revenue, and profit across regions and categories using the <b>Superstore dataset (9,800+ records)</b>.", bullet_style))
    story.append(Paragraph("• Built an interactive <b>Power BI dashboard (5+ visuals)</b> highlighting top products and seasonal trends, surfacing 3+ actionable improvement areas.", bullet_style))
    story.append(Spacer(1, 2))

    # Project 3
    story.append(Paragraph("<b>Website Traffic Analysis</b> | <i>Python, Pandas, NumPy, Matplotlib, Seaborn</i>", body_style))
    story.append(Paragraph("• Cleaned and analyzed website traffic data spanning thousands of sessions, covering users, bounce rate, and average session duration.", bullet_style))
    story.append(Paragraph("• Identified top 5 landing/exit pages and referral sources, recommending changes projected to improve conversion and engagement.", bullet_style))

    # 6. Education
    story.append(Paragraph("EDUCATION", sec_header_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#0284c7'), spaceAfter=3))
    
    edu_data = [
        [Paragraph("<b>B.Tech, Computer Science (AI & DS)</b> | IIMT Engineering College (AKTU) &nbsp;[CGPA: 7.2 | Roll: 2302161630036]", body_style),
         Paragraph("2023 – 2027", ParagraphStyle('RightDate', parent=body_style, alignment=2))],
        [Paragraph("<b>Class XII (CBSE)</b> | Paramount Academy &nbsp;[Percentage: 67.6%]", body_style),
         Paragraph("2023", ParagraphStyle('RightDate', parent=body_style, alignment=2))],
        [Paragraph("<b>Class X (CBSE)</b> | Paramount Academy &nbsp;[Percentage: 65.4%]", body_style),
         Paragraph("2021", ParagraphStyle('RightDate', parent=body_style, alignment=2))]
    ]
    edu_table = Table(edu_data, colWidths=[420, 130])
    edu_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2)
    ]))
    story.append(edu_table)

    # 7. Achievements & Certifications
    story.append(Paragraph("ACHIEVEMENTS & CERTIFICATIONS", sec_header_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#0284c7'), spaceAfter=3))
    story.append(Paragraph("• <b>Google Data Analytics Professional Certificate</b> – Google & Coursera (ID: EP3O21XSWB7Z, Jun 2026).", bullet_style))
    story.append(Paragraph("• <b>AI/ML Launchpad Bootcamp</b> – Physics Wallah (PW) & NSDC (Cert: f88d59a0-c12b-474b-b0e7-092097a0fbd8, Jun 2026).", bullet_style))
    story.append(Paragraph("• <b>Power BI Micro Course</b> – Skill Course (ID: SC-B22A7DDD69, ISO 9001:2015, Completed: 18/12/2025).", bullet_style))
    story.append(Paragraph("• <b>SQL (Basic) Skill Certification</b> – HackerRank (Credential ID: 967BFB00FD4B, Earned: 07 Mar 2026).", bullet_style))
    story.append(Paragraph("• <b>Python for Data Science</b> – Infosys Springboard (Issued: April 27, 2025, verify.onwingspan.com).", bullet_style))
    story.append(Paragraph("• <b>Advance Internet of Things (IoT)</b> – IIMT College of Engineering & Technoledge (Cert: T/IOT/712613/25).", bullet_style))
    story.append(Paragraph("• Solved <b>100+ SQL queries and challenges on LeetCode & HackerRank</b>, strengthening query optimization.", bullet_style))

    # Build PDF
    doc.build(story)
    print(f"Successfully generated PDF at: {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")

if __name__ == '__main__':
    generate_pdf()
