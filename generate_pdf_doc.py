import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # Skip page number on cover page
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header line & text
        self.drawString(54, 11 * inch - 36, "LearnMate — Technical Architecture & Full Project Documentation")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
        
        # Footer line & text
        self.line(54, 45, 8.5 * inch - 54, 45)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 30, page_text)
        self.drawString(54, 30, "Confidential — LearnMate Engineering System Specification")
        self.restoreState()

def build_pdf(filename="LearnMate_Full_Project_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#1e293b")  # Slate 800
    accent_color = colors.HexColor("#2563eb")   # Blue 600
    subtext_color = colors.HexColor("#475569")  # Slate 600
    code_bg = colors.HexColor("#f8fafc")

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=accent_color,
        alignment=0,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=subtext_color,
        alignment=0,
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=primary_color,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=accent_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=primary_color,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0f172a"),
        backColor=code_bg,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#1e293b")
    )

    story = []

    # ================= COVER PAGE =================
    story.append(Spacer(1, 40))
    story.append(Paragraph("LearnMate", title_style))
    story.append(Paragraph("Full Technical Project Documentation & Architecture Blueprint", ParagraphStyle(
        'CoverDocType', parent=title_style, fontSize=18, leading=22, textColor=primary_color
    )))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "A Multi-Role AI-Powered Learning Management System & Real-Time Collaborative Platform with RAG Microservice, WebSockets, and Celery Distributed Task Scheduling.",
        subtitle_style
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_color, spaceBefore=10, spaceAfter=20))

    meta_table_data = [
        [Paragraph("<b>Document Version:</b>", body_style), Paragraph("2.0.0 (Production Master)", body_style)],
        [Paragraph("<b>Status:</b>", body_style), Paragraph("Feature Complete & Live", body_style)],
        [Paragraph("<b>Target Audience:</b>", body_style), Paragraph("Developers, Architects, Evaluators & AI Agents", body_style)],
        [Paragraph("<b>Primary Backend:</b>", body_style), Paragraph("Django 6.0 REST Framework & Daphne ASGI", body_style)],
        [Paragraph("<b>AI Service:</b>", body_style), Paragraph("FastAPI RAG Microservice with Chroma DB", body_style)],
        [Paragraph("<b>Real-time Engine:</b>", body_style), Paragraph("Django Channels with Redis Channel Layer", body_style)],
        [Paragraph("<b>Async Worker:</b>", body_style), Paragraph("Celery + Celery Beat with Redis Broker", body_style)],
        [Paragraph("<b>Frontend Client:</b>", body_style), Paragraph("React 19, Vite 8, Tailwind CSS v4", body_style)],
        [Paragraph("<b>Date:</b>", body_style), Paragraph("August 2026", body_style)],
    ]
    meta_table = Table(meta_table_data, colWidths=[150, 350])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 40))
    story.append(Paragraph("<b>Table of Contents Overview:</b>", h3_style))
    toc_items = [
        "1. Executive Overview & System Architecture",
        "2. Technology Stack & Directory Structure",
        "3. Database Schema & Data Models (Entity Relationships)",
        "4. Authentication, Security, OTP & TOTP MFA Pipeline",
        "5. Backend Deep Dive (Django REST Framework & Daphne)",
        "6. AI Microservice & RAG Engine (FastAPI + Chroma DB)",
        "7. Real-Time WebSockets Communication Protocol",
        "8. Background Worker & Asynchronous Task Pipeline (Celery + Redis)",
        "9. Frontend Architecture (React 19 + Vite + Tailwind CSS)",
        "10. Comprehensive REST API Reference (All Modules)",
        "11. Local Deployment, Environment Configuration & Verification"
    ]
    for item in toc_items:
        story.append(Paragraph(f"• {item}", bullet_style))

    story.append(PageBreak())

    # ================= SECTION 1: EXECUTIVE OVERVIEW =================
    story.append(Paragraph("1. Executive Overview & System Architecture", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "<b>LearnMate</b> is an enterprise-grade, role-based Learning Management System (LMS) and collaborative real-time platform. It facilitates seamless interactions between <b>Students</b>, <b>Mentors</b>, and <b>Platform Administrators</b>. Beyond standard course delivery, LearnMate features an integrated AI Tutor grounded in video transcripts via Retrieval-Augmented Generation (RAG) and instant bidirectional messaging via WebSockets.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Core Architecture Flow:</b><br/>"
        "• <b>Client Layer:</b> React 19 Single Page Application communicates via HTTP REST (Axios with auto-refresh JWT interceptor) and WebSockets (Native WebSocket API).<br/>"
        "• <b>API & Business Layer:</b> Django REST Framework hosted on Daphne ASGI handles authentication, course catalog, syllabus editing, student enrollment, progress tracking, and admin moderation.<br/>"
        "• <b>Real-time Layer:</b> Daphne ASGI server + Redis Channel Layer routes direct and group messages.<br/>"
        "• <b>AI Intelligence Layer:</b> Dedicated FastAPI microservice chunks transcripts, indexes high-dimensional vector embeddings in Chroma DB, and retrieves context for LLM grounded responses.<br/>"
        "• <b>Async Worker Layer:</b> Celery Worker and Celery Beat handle non-blocking email dispatch (OTPs, notifications) and scheduled inactivity nudges over Redis.",
        body_style
    ))

    # ================= SECTION 2: TECH STACK =================
    story.append(Spacer(1, 8))
    story.append(Paragraph("2. Technology Stack & Directory Organization", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=8))
    
    tech_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Technology", table_header_style), Paragraph("Version / Role", table_header_style)],
        [Paragraph("Frontend", table_cell_style), Paragraph("React, Vite, Tailwind CSS", table_cell_style), Paragraph("React 19, Vite 8, Tailwind v4, Lucide Icons", table_cell_style)],
        [Paragraph("Routing & State", table_cell_style), Paragraph("React Router DOM & Context API", table_cell_style), Paragraph("Role-based protected route layouts, AuthContext", table_cell_style)],
        [Paragraph("Backend Core", table_cell_style), Paragraph("Python, Django, DRF", table_cell_style), Paragraph("Python 3.10+, Django 6.0.x, DRF 3.17.x", table_cell_style)],
        [Paragraph("Realtime Server", table_cell_style), Paragraph("Daphne ASGI + Channels", table_cell_style), Paragraph("Django Channels 4.x, channels_redis", table_cell_style)],
        [Paragraph("Task Queue", table_cell_style), Paragraph("Celery + Celery Beat", table_cell_style), Paragraph("Celery 5.x with Redis broker", table_cell_style)],
        [Paragraph("AI Microservice", table_cell_style), Paragraph("FastAPI + Uvicorn", table_cell_style), Paragraph("Port 8001 RAG pipeline", table_cell_style)],
        [Paragraph("Vector Store", table_cell_style), Paragraph("Chroma DB", table_cell_style), Paragraph("Persistent vector store with chunk embeddings", table_cell_style)],
        [Paragraph("Database", table_cell_style), Paragraph("PostgreSQL / SQLite", table_cell_style), Paragraph("Relational ORM with indexed foreign keys", table_cell_style)],
    ]
    tech_table = Table(tech_data, colWidths=[100, 160, 240])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), accent_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(tech_table)

    # ================= SECTION 3: DATABASE MODELS =================
    story.append(Spacer(1, 10))
    story.append(Paragraph("3. Database Schema & Data Models", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=8))
    
    models_info = [
        ("User (apps/accounts/models.py)", "UUID primary key, email (unique login identifier), username, role ('admin'|'mentor'|'student'), is_verified (bool), mfa_enabled (bool), mfa_secret (TOTP key), timestamps."),
        ("OTP (apps/accounts/models.py)", "user (FK), code (6-digit char), otp_type ('email_verification'|'login'|'password_reset'), is_used (bool), created_at (auto_now_add)."),
        ("StudentProfile & MentorProfile (apps/profiles/models.py)", "StudentProfile: OneToOne with User, bio, grade, learning_goal. MentorProfile: OneToOne with User, specialization, experience years."),
        ("Course (apps/courses/models.py)", "title, description, thumbnail (ImageField), mentor (FK User), level ('beginner'|'intermediate'|'advanced'), duration, status ('draft'|'published'|'rejected'), timestamps."),
        ("Module & Lesson (apps/courses/models.py)", "Module: course (FK), title, description, order. Lesson: module (FK), title, description, lesson_type ('video'|'pdf'|'quiz'|'assignment'), video_url, duration, order, is_preview, transcript, original_transcript, transcript_status."),
        ("LessonResource & Enrollment (apps/courses/models.py)", "LessonResource: lesson (FK), title, resource_type, file, external_url. Enrollment: student (FK User), course (FK Course), enrolled_at, is_completed, completed_at, is_active. Constraint: Unique(student, course)."),
        ("LessonProgress (apps/courses/models.py)", "student (FK User), lesson (FK Lesson), is_completed (bool), completed_at. Constraint: Unique(student, lesson)."),
        ("ChatRoom & Message (apps/chat/models.py)", "ChatRoom: user1 (FK), user2 (FK), Unique(user1, user2). Message: room (FK), sender (FK), receiver (FK), message (text), is_read (bool), created_at."),
        ("GroupChat & GroupMessage (apps/chat/models.py)", "GroupChat: name, created_by (FK), group_type ('student_batch'|'mentor_group'). GroupMember: group (FK), user (FK). GroupMessage: group (FK), sender (FK), message, timestamp.")
    ]
    for model_name, desc in models_info:
        story.append(Paragraph(f"<b>• {model_name}</b>: {desc}", bullet_style))

    story.append(PageBreak())

    # ================= SECTION 4: AUTH & SECURITY =================
    story.append(Paragraph("4. Authentication, Security & MFA Pipeline", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "LearnMate enforces a strict defense-in-depth security model utilizing JWT token pairs and two-factor mechanisms:",
        body_style
    ))
    story.append(Paragraph(
        "<b>1. Email OTP Verification Flow:</b><br/>"
        "During registration, an account is marked inactive/unverified until a 6-digit cryptographic OTP sent via SMTP email is verified at <code>/api/accounts/verify-otp/</code>.<br/>"
        "<b>2. Login & MFA Verification Flow:</b><br/>"
        "Initial login credentials check at <code>/api/accounts/login-otp/</code> issues a time-expiring login OTP. On verification via <code>/api/accounts/verify-login-otp/</code>, short-lived Access and long-lived Refresh JWT tokens are signed and returned.<br/>"
        "<b>3. TOTP Authenticator (Google Authenticator / PyOTP):</b><br/>"
        "Users can enable RFC 6238 TOTP two-factor auth. The server generates a unique secret, renders a QR code for mobile scanner apps, and requires verification at <code>/api/accounts/mfa/verify/</code>.<br/>"
        "<b>4. Automated Client-Side Token Rotation:</b><br/>"
        "The Axios client interceptor transparently catches HTTP 401s, calls the refresh token endpoint, updates storage, and retries failed requests without interrupting the user.",
        body_style
    ))

    # ================= SECTION 5: AI RAG ENGINE =================
    story.append(Spacer(1, 10))
    story.append(Paragraph("5. AI Microservice & RAG Engine (FastAPI + Chroma DB)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "The AI Microservice operates as an autonomous FastAPI service on port 8001 providing course-grounded conversational tutoring:",
        body_style
    ))
    story.append(Paragraph(
        "<b>• Transcript Ingestion & Chunking:</b> When mentors upload lesson transcripts, the backend triggers <code>POST http://localhost:8001/embed</code>. Transcripts are segmented into semantically coherent overlapping windows.<br/>"
        "<b>• Vector Embeddings & Indexing:</b> Text chunks are encoded into dense numerical vectors and stored in Chroma DB collections indexed by <code>course_id</code> and <code>lesson_id</code>.<br/>"
        "<b>• Semantic Similarity Search:</b> When students ask queries in the course viewer, <code>POST http://localhost:8001/rag-chat</code> retrieves the top-K matching transcript excerpts.<br/>"
        "<b>• Grounded Synthesis:</b> The retrieved context and question are injected into an LLM prompt, ensuring the AI answers exclusively based on verified course curriculum.",
        body_style
    ))

    # ================= SECTION 6: REAL-TIME WEBSOCKETS =================
    story.append(Spacer(1, 10))
    story.append(Paragraph("6. Real-Time WebSockets Communication Protocol", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "Real-time bidirectional chat is handled by Django Channels consumers through Daphne ASGI and Redis Channel Layers:",
        body_style
    ))
    story.append(Paragraph(
        "<b>• 1-on-1 Direct Chat:</b> <code>ws://localhost:8000/ws/chat/&lt;receiver_id&gt;/</code> establishes an isolated channel room dynamically keyed by sorted participant UUIDs.<br/>"
        "<b>• Group Batch Chat:</b> <code>ws://localhost:8000/ws/group-chat/&lt;group_id&gt;/</code> connects all enrolled members of a cohort or student batch for broadcast discussions.<br/>"
        "<b>• Message Persistence:</b> Incoming WebSocket payloads are automatically validated, stored in the relational database for offline replay, and broadcasted to active room subscribers in real-time.",
        body_style
    ))

    # ================= SECTION 7: ASYNC WORKERS =================
    story.append(Spacer(1, 10))
    story.append(Paragraph("7. Asynchronous Task Worker & Scheduler (Celery + Redis)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "To guarantee high responsiveness and sub-50ms API latencies, heavy operations are offloaded to Celery:",
        body_style
    ))
    story.append(Paragraph(
        "<b>• Asynchronous Transactional Emails:</b> OTP delivery, password reset codes, and enrollment confirmations execute in worker threads without blocking Django request workers.<br/>"
        "<b>• Course Completion & Certification:</b> Triggered automatically upon completion of the final lesson in an enrolled syllabus.<br/>"
        "<b>• Scheduled Celery Beat Jobs:</b> Periodic cron schedules check student engagement and send re-engagement reminders to inactive learners.",
        body_style
    ))

    story.append(PageBreak())

    # ================= SECTION 8: REST API REFERENCE =================
    story.append(Paragraph("8. Comprehensive REST API Reference", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=8))

    api_endpoints = [
        # Accounts
        ("POST", "/api/accounts/register/", "Register student/mentor account", "Public"),
        ("POST", "/api/accounts/send-otp/", "Dispatch email verification OTP", "Public"),
        ("POST", "/api/accounts/verify-otp/", "Validate email verification OTP", "Public"),
        ("POST", "/api/accounts/login-otp/", "Verify credentials & send login OTP", "Public"),
        ("POST", "/api/accounts/verify-login-otp/", "Validate login OTP & return JWT pair", "Public"),
        ("POST", "/api/accounts/forgot-password/", "Dispatch password reset OTP", "Public"),
        ("POST", "/api/accounts/reset-password/", "Reset account password with OTP", "Public"),
        ("POST", "/api/accounts/token/refresh/", "Obtain fresh access token via refresh token", "Public"),
        ("POST", "/api/accounts/mfa/enable/", "Generate TOTP secret and QR code URI", "Bearer Token"),
        ("POST", "/api/accounts/mfa/verify/", "Validate TOTP code and enable 2FA", "Bearer Token"),
        # Profiles
        ("GET/PUT", "/api/profile/student/", "Retrieve or update student bio, grade, goals", "Bearer (Student)"),
        ("GET/PUT", "/api/profile/mentor/", "Retrieve or update mentor specialization & exp", "Bearer (Mentor)"),
        # Courses (Mentor / Admin)
        ("GET/POST", "/api/courses/", "List all courses or create new course draft", "Bearer (Mentor/Admin)"),
        ("GET/PUT/DEL", "/api/courses/<id>/", "Fetch details, update metadata, or delete course", "Bearer (Mentor/Admin)"),
        ("GET/POST", "/api/courses/<id>/modules/", "List modules or add module to course", "Bearer (Mentor)"),
        ("GET/POST", "/api/courses/modules/<id>/lessons/", "List lessons or add lesson to module", "Bearer (Mentor)"),
        ("GET/PUT/DEL", "/api/courses/lessons/<id>/", "Fetch lesson, update transcript/video, delete", "Bearer (Mentor)"),
        ("GET/POST", "/api/courses/lessons/<id>/resources/", "List or upload PDF/link lesson resources", "Bearer (Mentor)"),
        # Student Course & Progress
        ("GET", "/api/courses/student/", "Catalog browse published courses with search", "Bearer (Student)"),
        ("POST", "/api/courses/student/enroll/<course_id>/", "Enroll current student into course", "Bearer (Student)"),
        ("GET", "/api/courses/student/my-courses/", "List all courses currently enrolled by user", "Bearer (Student)"),
        ("GET", "/api/courses/student/<id>/", "Student course view with syllabus structure", "Bearer (Student)"),
        ("GET", "/api/courses/student/lessons/<id>/", "Student lesson stream view with video/resources", "Bearer (Student)"),
        ("POST", "/api/courses/student/lessons/<id>/complete/", "Mark lesson completed & update progress %", "Bearer (Student)"),
        ("GET", "/api/courses/student/courses/<id>/progress/", "Fetch overall course completion percentage", "Bearer (Student)"),
        # Chat & AI
        ("GET", "/api/chat/history/<receiver_id>/", "Fetch historical 1-on-1 direct messages", "Bearer Token"),
        ("GET", "/api/chat/groups/", "List all joined cohort / batch groups", "Bearer Token"),
        ("GET", "/api/chat/groups/<id>/messages/", "Fetch historical messages from group room", "Bearer Token"),
        ("POST", "/api/ai/chat/", "Query AI tutor (proxies to FastAPI RAG service)", "Bearer Token"),
        # Admin Panel
        ("GET", "/api/adminpanel/dashboard/", "System metrics, user counts, course totals", "Bearer (Admin)"),
        ("GET/PUT", "/api/adminpanel/users/", "User management & status toggle", "Bearer (Admin)"),
        ("GET/PUT", "/api/adminpanel/mentors/", "Approve or reject mentor verification requests", "Bearer (Admin)"),
        ("GET/PUT", "/api/adminpanel/courses/", "Moderate, publish, or reject submitted courses", "Bearer (Admin)"),
        ("GET", "/api/adminpanel/reports/", "Generate platform usage & engagement reports", "Bearer (Admin)"),
    ]

    api_table_data = [
        [Paragraph("Method", table_header_style), Paragraph("Endpoint", table_header_style), Paragraph("Description", table_header_style), Paragraph("Auth", table_header_style)]
    ]
    for method, ep, desc, auth in api_endpoints:
        api_table_data.append([
            Paragraph(f"<b>{method}</b>", table_cell_style),
            Paragraph(f"<code>{ep}</code>", table_cell_style),
            Paragraph(desc, table_cell_style),
            Paragraph(auth, table_cell_style)
        ])

    api_table = Table(api_table_data, colWidths=[55, 175, 185, 85])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), accent_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(api_table)

    story.append(PageBreak())

    # ================= SECTION 9: LOCAL DEPLOYMENT =================
    story.append(Paragraph("9. Environment Setup & Execution Guidelines", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph("<b>Step 1: Start Redis Server</b>", h2_style))
    story.append(Paragraph("Ensure Redis is listening on <code>localhost:6379</code> for Django Channels, Celery tasks, and Celery Beat.", body_style))

    story.append(Paragraph("<b>Step 2: Django Backend & ASGI Server (Port 8000)</b>", h2_style))
    story.append(Paragraph(
        "<code>cd backend</code><br/>"
        "<code>python -m venv venv &amp;&amp; venv\\Scripts\\activate</code><br/>"
        "<code>pip install -r requirements.txt</code><br/>"
        "<code>python manage.py migrate</code><br/>"
        "<code>python manage.py runserver 0.0.0.0:8000</code>",
        code_style
    ))

    story.append(Paragraph("<b>Step 3: Celery Worker & Celery Beat (Background Workers)</b>", h2_style))
    story.append(Paragraph(
        "<code># In separate terminals (backend venv):</code><br/>"
        "<code>celery -A core worker --loglevel=info -P threads</code><br/>"
        "<code>python -m celery -A core beat --loglevel=info</code>",
        code_style
    ))

    story.append(Paragraph("<b>Step 4: AI RAG Microservice (Port 8001)</b>", h2_style))
    story.append(Paragraph(
        "<code>cd ai-service</code><br/>"
        "<code>uvicorn main:app --reload --port 8001</code>",
        code_style
    ))

    story.append(Paragraph("<b>Step 5: React Single Page Application (Port 5173)</b>", h2_style))
    story.append(Paragraph(
        "<code>cd frontend</code><br/>"
        "<code>npm install</code><br/>"
        "<code>npm run dev</code>",
        code_style
    ))

    story.append(Spacer(1, 15))
    story.append(Paragraph("<b>Conclusion & Architecture Guarantees</b>", h2_style))
    story.append(Paragraph(
        "LearnMate provides an enterprise-grade, highly maintainable codebase structured for horizontal scalability. With dedicated microservices for vector embeddings, asynchronous background processing, and real-time state synchronization, the platform handles intensive concurrent student learning and collaboration effortlessly.",
        body_style
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph("<i>— Generated automatically by Antigravity IDE for LearnMate</i>", ParagraphStyle(
        'FooterNote', parent=body_style, fontName='Helvetica-Oblique', textColor=subtext_color, alignment=2
    )))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "LearnMate_Full_Project_Documentation.pdf"
    build_pdf(target)
