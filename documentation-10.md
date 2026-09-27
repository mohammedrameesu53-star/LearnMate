import os
import sys
import html
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render 'Page X of Y' on all pages
    except the cover page, along with professional running headers and footers.
    """
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
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress on cover page

        self.saveState()
        
        # Header (Top)
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0f172a")) # Slate 900
        self.drawString(54, 11 * inch - 36, "LearnMate")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b")) # Slate 500
        self.drawString(102, 11 * inch - 36, "|   Enterprise System Architecture & Engineering Documentation")
        
        self.setStrokeColor(colors.HexColor("#e2e8f0")) # Slate 200
        self.setLineWidth(0.75)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Footer (Bottom)
        self.line(54, 45, 8.5 * inch - 54, 45)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawRightString(8.5 * inch - 54, 32, page_text)
        self.drawString(54, 32, "LearnMate LMS Platform — Production System Blueprint v2.0")
        
        self.restoreState()


def build_pdf(filename="LearnMate_Full_Project_Documentation.pdf"):
    pdf_path = os.path.abspath(filename)
    
    # Page setup: letter = 612 x 792 pt. 45pt margins -> 522 pt usable width, 702 pt usable height
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=45,
        rightMargin=45,
        topMargin=48,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()

    # Palette
    c_primary = colors.HexColor("#0f172a")     # Slate 900
    c_secondary = colors.HexColor("#1e293b")   # Slate 800
    c_accent = colors.HexColor("#2563eb")      # Blue 600
    c_accent_dark = colors.HexColor("#1d4ed8") # Blue 700
    c_teal = colors.HexColor("#0f766e")        # Teal 700
    c_amber = colors.HexColor("#b45309")       # Amber 700
    c_rose = colors.HexColor("#be123c")        # Rose 700
    c_text = colors.HexColor("#334155")        # Slate 700
    c_muted = colors.HexColor("#64748b")       # Slate 500
    c_border = colors.HexColor("#cbd5e1")      # Slate 300
    c_bg_light = colors.HexColor("#f8fafc")    # Slate 50
    c_bg_code = colors.HexColor("#0f172a")     # Dark Slate Code
    c_card_bg = colors.HexColor("#f1f5f9")     # Slate 100

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=c_primary,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=c_muted,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16,
        textColor=c_primary,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=c_accent,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=c_secondary,
        spaceBefore=5,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=11.2,
        textColor=c_text,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.8,
        textColor=c_text,
        leftIndent=10,
        firstLineIndent=-6,
        spaceAfter=2.5
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=6.5,
        leading=8.3,
        textColor=colors.HexColor("#38bdf8"),
        spaceAfter=0
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10.5,
        textColor=c_secondary
    )

    tbl_header_style = ParagraphStyle(
        'TblHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white
    )

    tbl_cell_style = ParagraphStyle(
        'TblCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.0,
        leading=9.5,
        textColor=c_text
    )

    tbl_cell_bold = ParagraphStyle(
        'TblCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.0,
        leading=9.5,
        textColor=c_primary
    )

    tbl_cell_code = ParagraphStyle(
        'TblCellCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.5,
        leading=8.5,
        textColor=c_accent_dark
    )

    story = []

    def p(text, style=body_style):
        return Paragraph(text, style)

    def code_box(code_text, col_width=522):
        safe_code = html.escape(code_text).replace('\n', '<br/>').replace(' ', '&nbsp;')
        p_code = Paragraph(f"<font face='Courier' color='#38bdf8'>{safe_code}</font>", code_style)
        t = Table([[p_code]], colWidths=[col_width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), c_bg_code),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#1e293b")),
        ]))
        return t

    def callout_box(title, message, bg_color=colors.HexColor("#eff6ff"), border_color=colors.HexColor("#3b82f6"), title_color=c_accent, col_width=522):
        content = [
            Paragraph(f"<b><font color='{title_color.hexval()}'>{title}</font></b>", h3_style),
            Spacer(1, 1),
            Paragraph(message, callout_style)
        ]
        t = Table([[content]], colWidths=[col_width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_color),
            ('BOX', (0, 0), (-1, -1), 0.75, border_color),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        return t

    def section_divider():
        return HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceBefore=4, spaceAfter=6)

    # =========================================================================
    # PAGE 1: COVER & EXECUTIVE OVERVIEW
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(Paragraph("LearnMate", title_style))
    story.append(Paragraph("AI-Powered Learning Management System &amp; Real-Time Collaboration Platform", ParagraphStyle('CoverH2', parent=title_style, fontSize=14, leading=18, textColor=c_accent)))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Master Technical Documentation, System Blueprint, API Reference &amp; Developer Onboarding Manual", subtitle_style))
    story.append(section_divider())
    story.append(Spacer(1, 2))

    meta_data = [
        [
            Paragraph("<b>Version:</b> 2.0.0 (Production Release)", tbl_cell_bold),
            Paragraph("<b>Architecture:</b> Decoupled Microservices &amp; ASGI", tbl_cell_bold),
        ],
        [
            Paragraph("<b>Backend Core:</b> Django 6.0 + DRF + Daphne", tbl_cell_style),
            Paragraph("<b>Frontend SPA:</b> React 19 + Vite 8 + Tailwind v4", tbl_cell_style),
        ],
        [
            Paragraph("<b>AI / RAG Service:</b> FastAPI + ChromaDB + Groq", tbl_cell_style),
            Paragraph("<b>Async / Queues:</b> Celery 5.4 + Redis 6379", tbl_cell_style),
        ],
        [
            Paragraph("<b>Media Cloud:</b> AWS S3 (Presigned URLs)", tbl_cell_style),
            Paragraph("<b>Database:</b> PostgreSQL 16 / SQLite 3", tbl_cell_style),
        ],
        [
            Paragraph("<b>Real-Time:</b> Django Channels 4.0 (WebSockets)", tbl_cell_style),
            Paragraph("<b>Target Audience:</b> Full-Stack Engineers &amp; DevOps", tbl_cell_style),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[260, 262])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_card_bg),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6))

    exec_summary_text = (
        "<b>Authoritative Engineering Blueprint:</b><br/>"
        "This document is the exhaustive technical specification for <b>LearnMate</b>. "
        "It details the end-to-end architecture, database schema, authentication &amp; MFA pipelines, "
        "REST API endpoints, bidirectional WebSocket communication, the RAG AI Tutoring engine (FastAPI, ChromaDB, Groq LLM, "
        "automated Whisper/YouTube speech transcription), Celery background tasks, AWS S3 cloud security, production Nginx/SSL deployment, "
        "and a complete <b>Developer Onboarding Guide</b> for rapid engineering orientation."
    )
    story.append(callout_box("DOCUMENT SCOPE &amp; SYSTEM GOALS", exec_summary_text, bg_color=colors.HexColor("#f0fdf4"), border_color=colors.HexColor("#22c55e"), title_color=c_teal))
    story.append(Spacer(1, 6))

    toc_data = [
        [Paragraph("<b>TABLE OF CONTENTS</b>", tbl_header_style), Paragraph("<b>SECTION</b>", tbl_header_style)],
        [Paragraph("1. Executive Project Overview &amp; Business Problem", tbl_cell_bold), Paragraph("Section 1", tbl_cell_style)],
        [Paragraph("2. Implemented Features vs Planned Roadmap", tbl_cell_bold), Paragraph("Section 2", tbl_cell_style)],
        [Paragraph("3. Technology Stack &amp; Architectural Specifications", tbl_cell_bold), Paragraph("Section 3", tbl_cell_style)],
        [Paragraph("4. End-to-End System Architecture &amp; Service Topology", tbl_cell_bold), Paragraph("Section 4", tbl_cell_style)],
        [Paragraph("5. Complete Project Directory Structure &amp; File Manifest", tbl_cell_bold), Paragraph("Section 5", tbl_cell_style)],
        [Paragraph("6. Database Architecture &amp; Relational ER Schema", tbl_cell_bold), Paragraph("Section 6", tbl_cell_style)],
        [Paragraph("7. Authentication, Multi-Factor Auth (MFA/TOTP) &amp; Security", tbl_cell_bold), Paragraph("Section 7", tbl_cell_style)],
        [Paragraph("8. Backend Core Architecture (Django 6 &amp; DRF)", tbl_cell_bold), Paragraph("Section 8", tbl_cell_style)],
        [Paragraph("9. AI Microservice &amp; RAG Tutoring Pipeline (FastAPI + ChromaDB)", tbl_cell_bold), Paragraph("Section 9", tbl_cell_style)],
        [Paragraph("10. Speech Transcription, Translation &amp; Vector Embeddings", tbl_cell_bold), Paragraph("Section 10", tbl_cell_style)],
        [Paragraph("11. Real-time WebSockets Messaging (Channels + Redis)", tbl_cell_bold), Paragraph("Section 11", tbl_cell_style)],
        [Paragraph("12. Asynchronous Workers &amp; Periodic Scheduling (Celery + Redis)", tbl_cell_bold), Paragraph("Section 12", tbl_cell_style)],
        [Paragraph("13. Frontend Architecture &amp; Client State (React 19 + Vite)", tbl_cell_bold), Paragraph("Section 13", tbl_cell_style)],
        [Paragraph("14. Cloud Media Storage &amp; AWS S3 Signed URL Architecture", tbl_cell_bold), Paragraph("Section 14", tbl_cell_style)],
        [Paragraph("15. Comprehensive HTTP REST API Reference", tbl_cell_bold), Paragraph("Section 15", tbl_cell_style)],
        [Paragraph("16. Environment Configuration &amp; Secret Management", tbl_cell_bold), Paragraph("Section 16", tbl_cell_style)],
        [Paragraph("17. Production Deployment, Nginx, Systemd, Domain &amp; SSL", tbl_cell_bold), Paragraph("Section 17", tbl_cell_style)],
        [Paragraph("18. Testing, Verification, QA &amp; Health Checks", tbl_cell_bold), Paragraph("Section 18", tbl_cell_style)],
        [Paragraph("19. Troubleshooting Manual &amp; Common Failure Modes", tbl_cell_bold), Paragraph("Section 19", tbl_cell_style)],
        [Paragraph("20. Developer Onboarding: Rapid Codebase Bootstrap Guide", tbl_cell_bold), Paragraph("Section 20", tbl_cell_style)],
    ]
    toc_table = Table(toc_data, colWidths=[428, 94])
    toc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(toc_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: SECTION 1 & SECTION 2
    # =========================================================================
    story.append(Paragraph("1. Executive Project Overview &amp; Business Value", h1_style))
    story.append(section_divider())
    story.append(p(
        "<b>LearnMate</b> is a production-grade, multi-role Learning Management System (LMS) and collaborative real-time "
        "ecosystem engineered to bridge the communication and learning gap between <b>Students</b>, <b>Mentors</b>, and "
        "<b>Platform Administrators</b>. Unlike traditional static learning platforms, LearnMate blends core course authoring "
        "and video delivery with cutting-edge <b>Retrieval-Augmented Generation (RAG) AI Tutoring</b> grounded directly in lesson "
        "lecture transcripts, high-throughput bidirectional WebSockets chat, and automated asynchronous learner engagement workflows."
    ))
    story.append(p("<b>Key Business Problems Solved:</b>"))
    story.append(p("• <b>Eliminate Passive Learning Isolation:</b> Embeds an AI Tutor directly inside the video lesson player that answers questions with strict factual grounding in the exact lecture content.", bullet_style))
    story.append(p("• <b>Frictionless Multilingual Accessibility:</b> Automatically extracts audio from YouTube lectures or uploaded video files, transcribes speech with Faster-Whisper, detects non-English languages, and translates the transcript to English via Groq LLMs before vectorization.", bullet_style))
    story.append(p("• <b>Real-Time Mentor-Student Connectivity:</b> Live 1-on-1 direct messaging and batch cohort discussions running on persistent ASGI WebSockets with typing indicators and online presence tracking.", bullet_style))
    story.append(p("• <b>Automated Retention &amp; Inactivity Nudges:</b> Automated Celery Beat background jobs track student progress, detect inactivity beyond 72 hours, and dispatch personalized email nudges via Brevo SMTP.", bullet_style))
    story.append(p("• <b>Enterprise Security &amp; Media Protection:</b> Zero unauthenticated direct access to lesson videos or PDFs. AWS S3 private storage with time-limited presigned URLs (1-hour expiration) combined with JWT authentication and RFC 6238 TOTP Multi-Factor Authentication.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("2. Implemented Features vs Planned Roadmap", h1_style))
    story.append(section_divider())
    
    feat_data = [
        [Paragraph("<b>Domain / Module</b>", tbl_header_style), Paragraph("<b>Implemented &amp; Verified Features (Live in v2.0)</b>", tbl_header_style), Paragraph("<b>Status</b>", tbl_header_style)],
        [
            Paragraph("<b>Student Portal</b>", tbl_cell_bold),
            Paragraph("• Course discovery catalog with search and level filters<br/>"
                      "• Single-click enrollment with progress tracker<br/>"
                      "• Custom video lesson player with module navigation sidebar<br/>"
                      "• Contextual AI Tutor slide-out drawer grounded in lesson transcripts<br/>"
                      "• PDF/Document resource downloader with AWS S3 signed URLs<br/>"
                      "• Real-time 1-on-1 chat with assigned mentors and cohort group chats<br/>"
                      "• Continue Learning quick-resume shortcut and completion certificate emails", tbl_cell_style),
            Paragraph("<font color='#16a34a'><b>LIVE</b></font>", tbl_cell_style)
        ],
        [
            Paragraph("<b>Mentor Studio</b>", tbl_cell_bold),
            Paragraph("• Course creator studio (Title, Description, Level, Thumbnail)<br/>"
                      "• Multi-level syllabus editor: Course &rarr; Modules &rarr; Lessons &rarr; Resources<br/>"
                      "• Video ingest: YouTube URL parsing or direct video file upload to AWS S3<br/>"
                      "• Automated background transcription (Whisper) &amp; RAG vectorization<br/>"
                      "• Student enrollment rosters &amp; granular lesson-by-lesson progress tracking<br/>"
                      "• Cohort analytics &amp; direct messaging with enrolled students", tbl_cell_style),
            Paragraph("<font color='#16a34a'><b>LIVE</b></font>", tbl_cell_style)
        ],
        [
            Paragraph("<b>Admin Control</b>", tbl_cell_bold),
            Paragraph("• Global analytical dashboard (User counts, Course counts, Enrollments)<br/>"
                      "• User moderation: Block/unblock students and mentors, role promotion<br/>"
                      "• Course publication review workflow: Approve (Publish), Reject (Draft)<br/>"
                      "• System-wide analytical reports and audit logs", tbl_cell_style),
            Paragraph("<font color='#16a34a'><b>LIVE</b></font>", tbl_cell_style)
        ],
        [
            Paragraph("<b>AI &amp; RAG Engine</b>", tbl_cell_bold),
            Paragraph("• Dedicated FastAPI microservice on Port 8001 with shared secret auth<br/>"
                      "• Word-level sliding window chunker (400 words, 50-word overlap)<br/>"
                      "• SentenceTransformers <i>all-MiniLM-L6-v2</i> dense vector embeddings<br/>"
                      "• ChromaDB vector store with metadata filtering by <i>course_id</i><br/>"
                      "• Groq <i>openai/gpt-oss-120b</i> high-speed LLM generation with strict course grounding<br/>"
                      "• Multilingual Whisper transcription + Groq translation pipeline", tbl_cell_style),
            Paragraph("<font color='#16a34a'><b>LIVE</b></font>", tbl_cell_style)
        ],
        [
            Paragraph("<b>Real-time Chat</b>", tbl_cell_bold),
            Paragraph("• Django Channels 4.0 ASGI WebSocket consumers with JWT authentication<br/>"
                      "• Redis Channel Layer for pub/sub message distribution<br/>"
                      "• Direct 1-on-1 chat rooms with read receipts &amp; typing indicators<br/>"
                      "• Batch cohort group messaging with persistent history", tbl_cell_style),
            Paragraph("<font color='#16a34a'><b>LIVE</b></font>", tbl_cell_style)
        ],
        [
            Paragraph("<b>Planned Roadmap</b>", tbl_cell_bold),
            Paragraph("• Interactive Quiz and Auto-Graded Assignment Engine<br/>"
                      "• Stripe / Razorpay Payment Gateway integration for paid premium courses<br/>"
                      "• WebRTC Live 1-on-1 video mentoring sessions &amp; screen sharing<br/>"
                      "• Gamification badges, leaderboards, and PDF certificate generation", tbl_cell_style),
            Paragraph("<font color='#d97706'><b>PLANNED</b></font>", tbl_cell_style)
        ]
    ]
    feat_table = Table(feat_data, colWidths=[95, 363, 64])
    feat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(feat_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: SECTION 3: TECHNOLOGY STACK
    # =========================================================================
    story.append(Paragraph("3. Technology Stack &amp; Architectural Specifications", h1_style))
    story.append(section_divider())
    story.append(p("The following table enumerates all production technologies, exact versions, and architectural responsibilities:"))

    stack_data = [
        [Paragraph("<b>Component / Layer</b>", tbl_header_style), Paragraph("<b>Technology</b>", tbl_header_style), Paragraph("<b>Version</b>", tbl_header_style), Paragraph("<b>Architectural Responsibility</b>", tbl_header_style)],
        [Paragraph("<b>Frontend SPA</b>", tbl_cell_bold), Paragraph("React 19", tbl_cell_style), Paragraph("19.2.0", tbl_cell_code), Paragraph("Component hierarchy, hooks, state reactivity, UI rendering", tbl_cell_style)],
        [Paragraph("<b>Build Tooling</b>", tbl_cell_bold), Paragraph("Vite", tbl_cell_style), Paragraph("8.0.0", tbl_cell_code), Paragraph("Fast ESM dev server, optimized production bundling", tbl_cell_style)],
        [Paragraph("<b>Client Routing</b>", tbl_cell_bold), Paragraph("React Router DOM", tbl_cell_style), Paragraph("7.13.0", tbl_cell_code), Paragraph("Declarative routing &amp; Role-based route guards (RBAC)", tbl_cell_style)],
        [Paragraph("<b>Styling</b>", tbl_cell_bold), Paragraph("Tailwind CSS", tbl_cell_style), Paragraph("v4.0.0", tbl_cell_code), Paragraph("Modern utility design, responsive grid, dark/light themes", tbl_cell_style)],
        [Paragraph("<b>HTTP Client</b>", tbl_cell_bold), Paragraph("Axios", tbl_cell_style), Paragraph("1.18.0", tbl_cell_code), Paragraph("REST API client with 401 JWT token auto-refresh interceptor", tbl_cell_style)],
        [Paragraph("<b>Backend Web Core</b>", tbl_cell_bold), Paragraph("Python &amp; Django", tbl_cell_style), Paragraph("3.10+ / 6.0.5", tbl_cell_code), Paragraph("Relational ORM, business logic, settings, security middleware", tbl_cell_style)],
        [Paragraph("<b>REST API Engine</b>", tbl_cell_bold), Paragraph("Django REST Framework", tbl_cell_style), Paragraph("3.17.0", tbl_cell_code), Paragraph("Model serializers, permission classes, viewsets", tbl_cell_style)],
        [Paragraph("<b>Auth &amp; Tokens</b>", tbl_cell_bold), Paragraph("SimpleJWT + PyOTP", tbl_cell_style), Paragraph("5.3+ / 2.9+", tbl_cell_code), Paragraph("HMAC-SHA256 JWT tokens, OTP verification, RFC 6238 TOTP MFA", tbl_cell_style)],
        [Paragraph("<b>ASGI / WebSockets</b>", tbl_cell_bold), Paragraph("Daphne &amp; Channels", tbl_cell_style), Paragraph("4.1+ / 4.2+", tbl_cell_code), Paragraph("Async protocol router, WebSocket consumer lifecycles", tbl_cell_style)],
        [Paragraph("<b>Channel Layer</b>", tbl_cell_bold), Paragraph("Redis + channels_redis", tbl_cell_style), Paragraph("7.x / 4.2+", tbl_cell_code), Paragraph("Distributed WebSocket pub/sub message broker &amp; room groups", tbl_cell_style)],
        [Paragraph("<b>Task Queue</b>", tbl_cell_bold), Paragraph("Celery &amp; Celery Beat", tbl_cell_style), Paragraph("5.4.0", tbl_cell_code), Paragraph("Non-blocking background email dispatch, Whisper transcription, cron", tbl_cell_style)],
        [Paragraph("<b>AI Service</b>", tbl_cell_bold), Paragraph("FastAPI &amp; Uvicorn", tbl_cell_style), Paragraph("0.115+ / 0.30+", tbl_cell_code), Paragraph("Dedicated high-performance RAG &amp; embedding microservice (Port 8001)", tbl_cell_style)],
        [Paragraph("<b>Vector Store</b>", tbl_cell_bold), Paragraph("Chroma DB", tbl_cell_style), Paragraph("0.5.5+", tbl_cell_code), Paragraph("Persistent vector store with cosine matching &amp; course metadata filters", tbl_cell_style)],
        [Paragraph("<b>Embedding Model</b>", tbl_cell_bold), Paragraph("SentenceTransformers", tbl_cell_style), Paragraph("all-MiniLM-L6-v2", tbl_cell_code), Paragraph("384-dimensional dense vectors for semantic lecture retrieval", tbl_cell_style)],
        [Paragraph("<b>Speech-to-Text</b>", tbl_cell_bold), Paragraph("Faster-Whisper", tbl_cell_style), Paragraph("1.0+ (small/int8)", tbl_cell_code), Paragraph("High-speed speech transcription for YouTube and uploaded video audio", tbl_cell_style)],
        [Paragraph("<b>LLM Inference</b>", tbl_cell_bold), Paragraph("Groq Cloud API", tbl_cell_style), Paragraph("gpt-oss-120b", tbl_cell_code), Paragraph("Sub-second ultra-fast LLM generation for RAG synthesis &amp; translation", tbl_cell_style)],
        [Paragraph("<b>Database</b>", tbl_cell_bold), Paragraph("PostgreSQL / SQLite", tbl_cell_style), Paragraph("16.x / 3.x", tbl_cell_code), Paragraph("ACID compliant relational persistence with foreign keys &amp; indexing", tbl_cell_style)],
        [Paragraph("<b>Cloud Storage</b>", tbl_cell_bold), Paragraph("AWS S3 + boto3", tbl_cell_style), Paragraph("1.35+", tbl_cell_code), Paragraph("Private encrypted bucket with 1-hour presigned URL authorization", tbl_cell_style)],
    ]
    stack_table = Table(stack_data, colWidths=[95, 95, 80, 252])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2.2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.2),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(stack_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: SECTION 4: SYSTEM ARCHITECTURE & TOPOLOGY
    # =========================================================================
    story.append(Paragraph("4. End-to-End System Architecture &amp; Topology", h1_style))
    story.append(section_divider())
    story.append(p(
        "LearnMate is built on a <b>Decoupled Microservice &amp; Asynchronous Pipeline Architecture</b>. "
        "The system isolates high-throughput web traffic, persistent WebSocket connections, compute-heavy AI tasks, "
        "and transactional background queues into specialized, decoupled processes."
    ))

    arch_ascii = (
        "+----------------------------------------------------------------------------------------------------------------+\n"
        "|                                       CLIENT APPLICATION LAYER (PORT 5173 / 80)                                |\n"
        "|     React 19 SPA (Vite) | React Router 7 (RBAC Guards) | Tailwind CSS v4 | Axios JWT Interceptors (Port 5173)   |\n"
        "+----------------------------------------------------------------------------------------------------------------+\n"
        "           | HTTP REST (Authorization: Bearer <JWT>)                       | Native WebSockets (ws:// / wss://)\n"
        "           v                                                               v\n"
        "+----------------------------------------------------------------------------------------------------------------+\n"
        "|                                  ASGI & WEB GATEWAY (Daphne Port 8000)                                         |\n"
        "|  ProtocolTypeRouter:                                                                                           |\n"
        "|    - http      -> Django WSGI/ASGI REST Framework Endpoints (/api/...)                                         |\n"
        "|    - websocket -> JWTAuthMiddleware -> URLRouter (/ws/chat/<room_id>/, /ws/group/<group_id>/)                  |\n"
        "+----------------------------------------------------------------------------------------------------------------+\n"
        "     |                        | (Enqueue Tasks)                         | (Channel Layer Pub/Sub)\n"
        "     |                        v                                         v\n"
        "     | PostgreSQL (5432)   +-------------------------------------------------------------------------------------+\n"
        "     | [Relational Store]  |                       REDIS IN-MEMORY BROKER (Port 6379)                            |\n"
        "     |                     |  - DB 0: Celery Task Broker & Result Store                                          |\n"
        "     |                     |  - Channel Layer: Django Channels Distributed Message Bus                           |\n"
        "     |                     +-------------------------------------------------------------------------------------+\n"
        "     |                                        |                                        |\n"
        "     |                                        v                                        v\n"
        "     |                     +--------------------------------------+ +--------------------------------------------+\n"
        "     |                     |        CELERY WORKER PROCESS         | |            CELERY BEAT SCHEDULER           |\n"
        "     |                     | - Async Brevo SMTP Emails (OTP/Nudge)| | - Cron: Inactivity Reminders (72h)         |\n"
        "     |                     | - Faster-Whisper Speech Transcribe   | | - Cron: Retry Stuck Embeddings (10m)       |\n"
        "     |                     | - Groq Multilingual Translation      | +--------------------------------------------+\n"
        "     |                     +--------------------------------------+\n"
        "     |                                        |\n"
        "     v (Proxied RAG HTTP POST /rag-chat)      v (HTTP POST /embed with X-Internal-Secret)\n"
        "+----------------------------------------------------------------------------------------------------------------+\n"
        "|                            FASTAPI AI & VECTOR MICROSERVICE (Uvicorn Port 8001)                                |\n"
        "|  - Security: Header Verification (X-Internal-Secret: <INTERNAL_API_SECRET>)                                    |\n"
        "|  - Chunker: 400-word sliding window (50-word overlap)                                                          |\n"
        "|  - Embedding Engine: SentenceTransformers all-MiniLM-L6-v2 (384-dimensional dense vectors)                     |\n"
        "|  - Vector Store: ChromaDB PersistentClient (./chroma_data - metadata filtered by course_id)                    |\n"
        "|  - Synthesis: Groq Cloud LLM (openai/gpt-oss-120b) with strict course context prompt grounding                 |\n"
        "+----------------------------------------------------------------------------------------------------------------+\n"
        "     |                                                                   |\n"
        "     v (Presigned Uploads & Downloads)                                   v (Sub-second LLM Calls)\n"
        "+-----------------------------------------+                 +----------------------------------------------------+\n"
        "|   AWS S3 CLOUD STORAGE (Private Bucket) |                 |            GROQ HIGH-SPEED INFERENCE CLOUD         |\n"
        "| - Course Thumbnails, Lesson Video Files |                 | - Llama-3.3 / GPT-OSS-120b RAG Synthesis           |\n"
        "| - Downloadable PDF Lesson Resources     |                 | - Multilingual Translation to English              |\n"
        "+-----------------------------------------+                 +----------------------------------------------------+"
    )
    story.append(code_box(arch_ascii))

    story.append(Spacer(1, 4))
    story.append(p("<b>Key Architectural Invariants:</b>"))
    story.append(p("1. <b>Zero Direct Client Access to Vector DB / AI Engine:</b> The React client never contacts FastAPI (Port 8001) directly. All requests pass through Django DRF (`/api/ai/chat/`) which authenticates the JWT user and injects the shared `X-Internal-Secret` header.", bullet_style))
    story.append(p("2. <b>Non-Blocking Media Pipeline:</b> Audio extraction, Faster-Whisper transcription, and ChromaDB vector embedding run strictly inside background Celery worker threads. Mentors receive instantaneous HTTP 201 responses while lesson status transitions from `pending` &rarr; `processing` &rarr; `completed`.", bullet_style))
    story.append(p("3. <b>Course-Isolated Semantic Vector Spaces:</b> ChromaDB queries enforce a strict `where={'course_id': course_id}` filter, preventing context leaks across different courses.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: SECTION 5: DIRECTORY STRUCTURE
    # =========================================================================
    story.append(Paragraph("5. Complete Project Directory Structure &amp; File Manifest", h1_style))
    story.append(section_divider())
    story.append(p("The LearnMate codebase is organized into three clean root directories: `backend/`, `ai-service/`, and `frontend/`."))

    repo_tree = (
        "learnmate-2/\n"
        "+-- backend/                           # Django 6 & DRF Core Backend\n"
        "|   +-- core/                          # Root configuration package\n"
        "|   |   +-- settings.py                # Global settings (DB, JWT, AWS S3, Celery, Channels)\n"
        "|   |   +-- urls.py                    # Root API routing (/api/accounts, /api/courses, etc.)\n"
        "|   |   +-- asgi.py                    # Daphne ASGI router (HTTP + WebSocket JWTAuth)\n"
        "|   |   +-- wsgi.py                    # Standard WSGI entrypoint\n"
        "|   |   +-- celery.py                  # Celery worker application initialization\n"
        "|   +-- apps/\n"
        "|   |   +-- accounts/                  # User entity, SimpleJWT auth, OTP emails, TOTP MFA\n"
        "|   |   |   +-- models.py              # User (AbstractUser), OTP models\n"
        "|   |   |   +-- views.py               # Register, SendOTP, VerifyOTP, Login, MFA views\n"
        "|   |   |   +-- serializers.py          # User & Auth payload serializers\n"
        "|   |   |   +-- urls.py                # /api/accounts/*\n"
        "|   |   +-- profiles/                  # Student & Mentor extended metadata\n"
        "|   |   |   +-- models.py              # StudentProfile, MentorProfile (OneToOne User)\n"
        "|   |   |   +-- views.py & serializers.py\n"
        "|   |   |   +-- urls.py                # /api/profile/*\n"
        "|   |   +-- courses/                   # Course catalog, syllabus, enrollments, progress\n"
        "|   |   |   +-- models.py              # Course, Module, Lesson, LessonResource, Enrollment, LessonProgress\n"
        "|   |   |   +-- views.py               # Mentor CRUD, Student Enrollment, Player, Statistics\n"
        "|   |   |   +-- tasks.py               # Celery tasks: send_mail, Whisper transcription, embed_lesson\n"
        "|   |   |   +-- services/transcription.py # yt-dlp + Faster-Whisper + Groq translation pipeline\n"
        "|   |   |   +-- urls.py                # /api/courses/*\n"
        "|   |   +-- chat/                      # Real-time messaging & WebSocket consumers\n"
        "|   |   |   +-- models.py              # ChatRoom, Message, GroupChat, GroupMember, GroupMessage\n"
        "|   |   |   +-- consumers.py           # ChatConsumer (1-on-1), GroupConsumer (Batch WebSocket)\n"
        "|   |   |   +-- middleware.py          # JWTAuthMiddleware (WebSocket handshake auth)\n"
        "|   |   |   +-- routing.py             # ws/chat/<room_id>/ and ws/group/<group_id>/\n"
        "|   |   |   +-- urls.py                # /api/chat/*\n"
        "|   |   +-- adminpanel/                # Administrator analytics, user/course moderation\n"
        "|   |   |   +-- views/                 # dashboard.py, users.py, courses.py, mentors.py, reports.py\n"
        "|   |   |   +-- urls.py                # /api/adminpanel/*\n"
        "|   |   +-- ai/                        # Django-to-FastAPI RAG gateway proxy\n"
        "|   |       +-- views.py               # AIChatView (Proxies RAG requests with secret header)\n"
        "|   |       +-- urls.py                # /api/ai/chat/\n"
        "|   +-- manage.py\n"
        "|   +-- requirements.txt\n"
        "|   +-- .env                           # Database, AWS S3, Brevo, Groq, Secret Keys\n"
        "|\n"
        "+-- ai-service/                        # Dedicated FastAPI RAG Microservice\n"
        "|   +-- main.py                        # FastAPI routes (/embed, /lesson/{id}, /rag-chat, /health)\n"
        "|   +-- services/\n"
        "|   |   +-- embeddings.py              # SentenceTransformers all-MiniLM-L6-v2 chunking & vectorization\n"
        "|   |   +-- vectorstore.py             # ChromaDB PersistentClient collection manager\n"
        "|   |   +-- rag.py                     # Groq LLM grounded synthesis pipeline\n"
        "|   +-- chroma_data/                   # Local persistent Chroma vector database directory\n"
        "|   +-- requirements.txt\n"
        "|   +-- .env                           # GROQ_API_KEY, INTERNAL_API_SECRET\n"
        "|\n"
        "+-- frontend/                          # React 19 Single Page Application\n"
        "    +-- package.json\n"
        "    +-- vite.config.js\n"
        "    +-- index.html\n"
        "    +-- src/\n"
        "        +-- App.jsx                    # Central route tree with ProtectedRoute RBAC guards\n"
        "        +-- api.js                     # Axios instance + 401 automatic JWT token refresh\n"
        "        +-- context/\n"
        "        |   +-- AuthContext.jsx        # Global user state, login, logout, profile loading\n"
        "        |   +-- ThemeContext.jsx       # Theme state provider\n"
        "        +-- components/\n"
        "        |   +-- ProtectedRoute.jsx     # Role-based route guard\n"
        "        |   +-- DashboardLayout.jsx    # Standard shell with Sidebar & Topbar\n"
        "        |   +-- Sidebar.jsx & Topbar.jsx # Role-aware navigation & profile controls\n"
        "        +-- pages/\n"
        "            +-- auth/                  # Login.jsx, Register.jsx, ForgotPassword.jsx\n"
        "            +-- dashboards/\n"
        "                +-- student/           # StudentDashboardOverview, StudentCourses, StudentLessonViewer...\n"
        "                +-- mentor/            # MentorDashboardOverview, CourseSyllabusEditor, CourseStudents...\n"
        "                +-- admin/             # AdminDashboardOverview, AdminCourses, AdminUsers, AdminReports..."
    )
    story.append(code_box(repo_tree))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: SECTION 6: DATABASE SCHEMA
    # =========================================================================
    story.append(Paragraph("6. Database Architecture &amp; Relational ER Schema", h1_style))
    story.append(section_divider())
    story.append(p(
        "LearnMate uses a relational PostgreSQL schema designed for strict referential integrity, relational cascades, "
        "and optimal query performance across course hierarchies, enrollments, and real-time messaging."
    ))

    schema_data = [
        [Paragraph("<b>Model Name</b>", tbl_header_style), Paragraph("<b>Key Fields &amp; Types</b>", tbl_header_style), Paragraph("<b>Relationships &amp; Constraints</b>", tbl_header_style)],
        [
            Paragraph("<b>accounts.User</b><br/>(AbstractUser)", tbl_cell_bold),
            Paragraph("• <code>id</code> (UUIDField, PK, default=uuid4)<br/>"
                      "• <code>email</code> (EmailField, unique=True, USERNAME_FIELD)<br/>"
                      "• <code>username</code> (CharField, max_length=150)<br/>"
                      "• <code>role</code> (admin | mentor | student, default=student)<br/>"
                      "• <code>is_verified</code> (BooleanField, default=False)<br/>"
                      "• <code>mfa_enabled</code> (BooleanField, default=False)<br/>"
                      "• <code>mfa_secret</code> (CharField, max_length=255, nullable)", tbl_cell_style),
            Paragraph("Central entity referenced across all apps.<br/>Unique constraint on <code>email</code>.<br/>Custom auth model configured in <code>AUTH_USER_MODEL</code>.", tbl_cell_style)
        ],
        [
            Paragraph("<b>accounts.OTP</b>", tbl_cell_bold),
            Paragraph("• <code>user</code> (ForeignKey &rarr; User, on_delete=CASCADE)<br/>"
                      "• <code>code</code> (CharField, length=6)<br/>"
                      "• <code>otp_type</code> (email_verification | login | password_reset)<br/>"
                      "• <code>is_used</code> (BooleanField, default=False)<br/>"
                      "• <code>created_at</code> (DateTimeField, auto_now_add=True)", tbl_cell_style),
            Paragraph("Single-use numeric passcodes for email confirmation and 2-step logins. 5-minute validity window.", tbl_cell_style)
        ],
        [
            Paragraph("<b>profiles.StudentProfile &amp;<br/>MentorProfile</b>", tbl_cell_bold),
            Paragraph("• <b>StudentProfile:</b> <code>user</code> (OneToOne), <code>bio</code>, <code>grade</code>, <code>learning_goal</code><br/>"
                      "• <b>MentorProfile:</b> <code>user</code> (OneToOne), <code>specialization</code>, <code>experience</code> (int)", tbl_cell_style),
            Paragraph("1-to-1 extension tables linked directly to <code>User.id</code> with cascading deletion.", tbl_cell_style)
        ],
        [
            Paragraph("<b>courses.Course</b>", tbl_cell_bold),
            Paragraph("• <code>id</code> (AutoField, PK)<br/>"
                      "• <code>title</code> (CharField, max 255), <code>description</code> (TextField)<br/>"
                      "• <code>thumbnail</code> (ImageField &rarr; AWS S3 / course_thumbnails/)<br/>"
                      "• <code>mentor</code> (ForeignKey &rarr; User, related_name='courses')<br/>"
                      "• <code>level</code> (beginner | intermediate | advanced)<br/>"
                      "• <code>duration</code> (CharField), <code>status</code> (draft | published | rejected)", tbl_cell_style),
            Paragraph("Root course entity. Moderated by admins before transition to <code>published</code>.", tbl_cell_style)
        ],
        [
            Paragraph("<b>courses.Module</b>", tbl_cell_bold),
            Paragraph("• <code>course</code> (ForeignKey &rarr; Course, related_name='modules')<br/>"
                      "• <code>title</code> (CharField), <code>description</code> (TextField)<br/>"
                      "• <code>order</code> (PositiveIntegerField)", tbl_cell_style),
            Paragraph("Hierarchical syllabus section. Ordered ascending by <code>order</code>.", tbl_cell_style)
        ],
        [
            Paragraph("<b>courses.Lesson</b>", tbl_cell_bold),
            Paragraph("• <code>module</code> (ForeignKey &rarr; Module, related_name='lessons')<br/>"
                      "• <code>title</code>, <code>description</code>, <code>duration</code>, <code>order</code><br/>"
                      "• <code>lesson_type</code> (video | pdf | quiz | assignment)<br/>"
                      "• <code>source_type</code> (youtube | upload)<br/>"
                      "• <code>video_url</code> (URLField), <code>video_file</code> (FileField &rarr; S3)<br/>"
                      "• <code>is_preview</code> (BooleanField, default=False)<br/>"
                      "• <code>transcript</code> (TextField, English for RAG)<br/>"
                      "• <code>original_transcript</code> (TextField, spoken language)<br/>"
                      "• <code>transcript_status</code> (pending | processing | completed | failed)<br/>"
                      "• <code>embedding_status</code> (pending | completed | failed)", tbl_cell_style),
            Paragraph("Core learning unit. Houses both video links/files, dual transcripts, and vector status flags.", tbl_cell_style)
        ],
        [
            Paragraph("<b>courses.LessonResource</b>", tbl_cell_bold),
            Paragraph("• <code>lesson</code> (ForeignKey &rarr; Lesson, related_name='resources')<br/>"
                      "• <code>title</code> (CharField), <code>resource_type</code> (pdf | doc | img | zip | link)<br/>"
                      "• <code>file</code> (FileField &rarr; AWS S3 / lesson_resources/)<br/>"
                      "• <code>external_url</code> (URLField, nullable)", tbl_cell_style),
            Paragraph("Attached study notes and code downloads. Protected by S3 presigned URLs.", tbl_cell_style)
        ],
        [
            Paragraph("<b>courses.Enrollment &amp;<br/>LessonProgress</b>", tbl_cell_bold),
            Paragraph("• <b>Enrollment:</b> <code>student</code> (FK User), <code>course</code> (FK Course), <code>is_completed</code>, <code>enrolled_at</code><br/>"
                      "• <b>LessonProgress:</b> <code>student</code> (FK User), <code>lesson</code> (FK Lesson), <code>is_completed</code>, <code>completed_at</code>", tbl_cell_style),
            Paragraph("Unique constraints: <code>(student, course)</code> and <code>(student, lesson)</code>. Enforces single enrollment.", tbl_cell_style)
        ],
        [
            Paragraph("<b>chat.ChatRoom, Message,<br/>GroupChat, GroupMessage</b>", tbl_cell_bold),
            Paragraph("• <b>ChatRoom:</b> <code>user1</code> (FK), <code>user2</code> (FK) [unique_together]<br/>"
                      "• <b>Message:</b> <code>room</code> (FK), <code>sender</code> (FK), <code>receiver</code> (FK), <code>message</code>, <code>is_read</code><br/>"
                      "• <b>GroupChat:</b> <code>name</code>, <code>created_by</code> (FK), <code>group_type</code><br/>"
                      "• <b>GroupMember:</b> <code>group</code> (FK), <code>user</code> (FK)<br/>"
                      "• <b>GroupMessage:</b> <code>group</code> (FK), <code>sender</code> (FK), <code>message</code>", tbl_cell_style),
            Paragraph("Relational persistence layer for all direct and group WebSocket chats.", tbl_cell_style)
        ],
    ]
    schema_table = Table(schema_data, colWidths=[105, 245, 172])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(schema_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 7: SECTION 7: AUTHENTICATION, MFA & SECURITY
    # =========================================================================
    story.append(Paragraph("7. Authentication, Multi-Factor Auth (MFA/TOTP) &amp; Security", h1_style))
    story.append(section_divider())
    story.append(p(
        "LearnMate enforces a multi-layered security model combining <b>Email OTP Verification</b>, "
        "<b>JSON Web Tokens (SimpleJWT)</b>, and <b>RFC 6238 TOTP Multi-Factor Authentication</b>."
    ))

    story.append(Paragraph("7.1 Registration &amp; Email Verification Sequence", h2_style))
    story.append(p("1. User submits <code>{ username, email, password, role }</code> to <code>POST /api/accounts/register/</code>.", bullet_style))
    story.append(p("2. Backend saves <code>User</code> record with <code>is_verified=False</code> and creates an <code>OTP</code> record (type='email_verification').", bullet_style))
    story.append(p("3. Celery / SMTP dispatches a 6-digit verification code to the user's email address.", bullet_style))
    story.append(p("4. User submits the code to <code>POST /api/accounts/verify-otp/</code>. Backend marks <code>is_verified=True</code> and invalidates the OTP.", bullet_style))

    story.append(Paragraph("7.2 Login Flow (2-Step Credential + MFA Verification)", h2_style))
    story.append(p("1. User submits <code>{ email, password }</code> to <code>POST /api/accounts/login/</code>.", bullet_style))
    story.append(p("2. If valid, backend generates an OTP and sends it via email, returning <code>{ message: 'OTP sent to email' }</code>.", bullet_style))
    story.append(p("3. User inputs code to <code>POST /api/accounts/verify-mfa/</code>. Backend verifies the code and returns SimpleJWT token pair:", bullet_style))
    
    jwt_box_text = (
        "// Successful Login Response Payload:\n"
        "{\n"
        '  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",   // Valid for 1 Hour\n'
        '  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // Valid for 7 Days\n'
        '  "role": "student",\n'
        '  "email": "student@example.com",\n'
        '  "user_id": "8f14e45f-9a1b-4d78-b112-9c3f0b31e9c2"\n'
        "}"
    )
    story.append(code_box(jwt_box_text))

    story.append(Paragraph("7.3 Axios 401 Silent Token Refresh Interceptor (`frontend/src/api.js`)", h2_style))
    story.append(p(
        "The React frontend automatically attaches `Authorization: Bearer <access_token>` to all outgoing REST calls. "
        "If a request receives an HTTP 401 response, Axios pauses outgoing traffic, posts the stored `refresh_token` to "
        "<code>/api/accounts/token/refresh/</code>, updates `localStorage`, and retries the original request seamlessly without user disruption."
    ))

    story.append(Paragraph("7.4 Authenticator App 2FA (RFC 6238 TOTP)", h2_style))
    story.append(p(
        "Users can enable Authenticator App 2FA (Google Authenticator, Authy, 1Password). "
        "The server generates a base32 cryptographic seed via `pyotp.random_base32()`, stores it in `User.mfa_secret`, and verifies 6-digit rolling codes via <code>POST /api/accounts/verify-mfa-setup/</code>."
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 8: SECTION 8 & 9: BACKEND ARCHITECTURE & AI RAG PIPELINE
    # =========================================================================
    story.append(Paragraph("8. Backend Core Architecture (Django 6 &amp; DRF)", h1_style))
    story.append(section_divider())
    story.append(p(
        "The Django backend is modularized into specialized apps under `backend/apps/`. "
        "Each app contains dedicated `models.py`, `serializers.py`, `views.py`, `urls.py`, and where applicable, `tasks.py` and `consumers.py`."
    ))

    story.append(Paragraph("9. AI Microservice &amp; RAG Tutoring Pipeline (FastAPI + ChromaDB)", h1_style))
    story.append(section_divider())
    story.append(p(
        "Located in `ai-service/`, the AI engine runs as an independent FastAPI microservice on <b>Port 8001</b>. "
        "It provides isolated, high-speed vector embeddings, persistent vector storage, and grounded RAG answer synthesis."
    ))

    rag_flow = (
        "                    LEARNMATE RETRIEVAL-AUGMENTED GENERATION (RAG) PIPELINE\n\n"
        "1. INGESTION & VECTORIZATION PIPELINE (Triggered on Lesson Video/Transcript Upload):\n"
        "   [Video File / YouTube URL]\n"
        "          |\n"
        "          v (Celery Task: generate_lesson_transcript)\n"
        "   [Faster-Whisper STT / YT-Transcript] ---> [Detected Language != 'en'] ---> [Groq Translation]\n"
        "                                                                                     |\n"
        "          +--------------------------------------------------------------------------+\n"
        "          |\n"
        "          v (Celery Task: embed_lesson_transcript -> HTTP POST http://localhost:8001/embed)\n"
        "   [Word Chunker (400 words, 50-word overlap)]\n"
        "          |\n"
        "          v\n"
        "   [SentenceTransformers 'all-MiniLM-L6-v2' (384-dimensional dense vectors)]\n"
        "          |\n"
        "          v\n"
        "   [ChromaDB Persistent Store: lesson_transcripts collection | metadata={'course_id', 'lesson_id'}]\n\n"
        "2. REAL-TIME STUDENT QUERY & SYNTHESIS PIPELINE:\n"
        "   [Student in Lesson Viewer] ---> [Types Question in AI Tutor Slide-over Drawer]\n"
        "          |\n"
        "          v (HTTP POST /api/ai/chat/ with { message, course_id } + Bearer JWT)\n"
        "   [Django AIChatView Gateway] ---> [Injects X-Internal-Secret] ---> [FastAPI /rag-chat]\n"
        "          |\n"
        "          v\n"
        "   [Vector Query: query_similar_chunks(embedding, course_id=course_id, top_k=5)]\n"
        "          |\n"
        "          v\n"
        "   [Grounding Prompt Construction with Course Excerpts]\n"
        "          |\n"
        "          v\n"
        "   [Groq Cloud LLM (openai/gpt-oss-120b, temperature=0.3)]\n"
        "          |\n"
        "          v\n"
        "   [Strictly Grounded, Factually Accurate Answer Returned to Student in < 800ms]"
    )
    story.append(code_box(rag_flow))

    story.append(Spacer(1, 4))
    story.append(callout_box(
        "INTERNAL MICROSERVICE SECURITY",
        "FastAPI endpoints (<code>/embed</code>, <code>/lesson/{id}</code>, <code>/rag-chat</code>) enforce strict header verification "
        "via <code>verify_internal_secret</code> dependency. Requests without a valid <code>X-Internal-Secret</code> header receive an immediate HTTP 401 Unauthorized response, ensuring external users cannot query or tamper with vector data directly.",
        bg_color=colors.HexColor("#fffbeb"),
        border_color=colors.HexColor("#f59e0b"),
        title_color=c_amber
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 9: SECTION 10 & 11: TRANSCRIPTION & REAL-TIME WEBSOCKETS
    # =========================================================================
    story.append(Paragraph("10. Speech Transcription, Translation &amp; Vector Embeddings", h1_style))
    story.append(section_divider())
    story.append(p(
        "The transcription pipeline in `apps.courses.services.transcription` provides bulletproof speech-to-text processing for both YouTube lectures and uploaded video files:"
    ))
    story.append(p("1. <b>YouTube Captions Check:</b> Attempts to fetch manual or auto-generated YouTube captions using `youtube_transcript_api`. Validates speech density: if words-per-minute is less than 60 (sparse/broken captions), it discards them and falls back to Faster-Whisper.", bullet_style))
    story.append(p("2. <b>Whisper Audio Extraction:</b> Downloads the audio track using `yt-dlp` to a temporary directory and transcribes with `faster_whisper.WhisperModel('small', device='cpu', compute_type='int8')`.", bullet_style))
    story.append(p("3. <b>Language Detection &amp; Groq Translation:</b> Uses `langdetect` on the raw transcript. If the detected language is non-English (e.g. Malayalam, Spanish, Hindi), it sends the transcript to Groq LLM with a system prompt instructing exact pedagogical translation to English. Stores `original_transcript` and English `transcript`.", bullet_style))
    story.append(p("4. <b>Automated Vectorization:</b> Dispatches `embed_lesson_transcript.delay(lesson.id)` to chunk and store embeddings in ChromaDB.", bullet_style))

    story.append(Spacer(1, 4))

    story.append(Paragraph("11. Real-time WebSockets Messaging (Channels + Redis)", h1_style))
    story.append(section_divider())
    story.append(p(
        "Bidirectional real-time communication is powered by <b>Django Channels 4.0</b>, <b>Daphne ASGI</b>, and <b>Redis Channel Layer</b> (`channels_redis`)."
    ))

    ws_data = [
        [Paragraph("<b>Feature / Protocol</b>", tbl_header_style), Paragraph("<b>WebSocket Specification &amp; Implementation Details</b>", tbl_header_style)],
        [
            Paragraph("<b>Endpoints</b>", tbl_cell_bold),
            Paragraph("• Direct 1-on-1 Chat: <code>ws://&lt;host&gt;/ws/chat/&lt;room_id&gt;/?token=&lt;jwt&gt;</code><br/>"
                      "• Batch Group Chat: <code>ws://&lt;host&gt;/ws/group/&lt;group_id&gt;/?token=&lt;jwt&gt;</code>", tbl_cell_style)
        ],
        [
            Paragraph("<b>Authentication</b>", tbl_cell_bold),
            Paragraph("<code>JWTAuthMiddleware</code> parses the JWT access token from the WebSocket query string or headers, validates the signature via <code>UntypedToken</code>, and sets <code>scope['user']</code>.", tbl_cell_style)
        ],
        [
            Paragraph("<b>Room Isolation</b>", tbl_cell_bold),
            Paragraph("Each room binds to a deterministic Redis group (e.g. <code>chat_12</code> or <code>group_4</code>). Only verified participants can connect; unauthorized connection attempts are closed with code 4003.", tbl_cell_style)
        ],
        [
            Paragraph("<b>Event Types</b>", tbl_cell_bold),
            Paragraph("• <code>message</code>: Persists to DB (<code>Message</code> model) and broadcasts <code>chat_message</code> payload.<br/>"
                      "• <code>typing</code>: Broadcasts real-time typing indicators to peer participants.<br/>"
                      "• <code>user_online</code>: Notifies subscribers when a peer connects.", tbl_cell_style)
        ],
        [
            Paragraph("<b>Fallback &amp; History</b>", tbl_cell_bold),
            Paragraph("Historical messages are loaded via HTTP REST (<code>GET /api/chat/rooms/&lt;id&gt;/messages/</code>) upon room mount, followed by immediate WebSocket subscription for live updates.", tbl_cell_style)
        ]
    ]
    ws_table = Table(ws_data, colWidths=[120, 402])
    ws_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(ws_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 10: SECTION 12, 13, 14: CELERY, FRONTEND, AWS S3
    # =========================================================================
    story.append(Paragraph("12. Asynchronous Workers &amp; Scheduling (Celery + Redis)", h1_style))
    story.append(section_divider())
    story.append(p(
        "Celery executes background tasks asynchronously with Redis (`redis://127.0.0.1:6379/0`) acting as the message broker and result backend."
    ))

    celery_data = [
        [Paragraph("<b>Task Name</b>", tbl_header_style), Paragraph("<b>Trigger / Schedule</b>", tbl_header_style), Paragraph("<b>Functional Responsibility</b>", tbl_header_style)],
        [
            Paragraph("<code>generate_lesson_transcript</code>", tbl_cell_code),
            Paragraph("Triggered on Lesson Create / Update", tbl_cell_style),
            Paragraph("Downloads audio via yt-dlp, runs Faster-Whisper, translates non-English speech via Groq, saves transcripts, and triggers embedding.", tbl_cell_style)
        ],
        [
            Paragraph("<code>embed_lesson_transcript</code>", tbl_cell_code),
            Paragraph("Triggered after transcript completion", tbl_cell_style),
            Paragraph("Sends transcript text to FastAPI <code>/embed</code> with max 3 retries on transient connection failures.", tbl_cell_style)
        ],
        [
            Paragraph("<code>retry_stuck_embeddings</code>", tbl_cell_code),
            Paragraph("Celery Beat cron (every 10 min)", tbl_cell_style),
            Paragraph("Safety net: finds lessons whose transcript finished &gt;10 min ago but embedding never completed, and re-queues them.", tbl_cell_style)
        ],
        [
            Paragraph("<code>send_inactivity_reminders</code>", tbl_cell_code),
            Paragraph("Celery Beat cron (daily)", tbl_cell_style),
            Paragraph("Identifies active student enrollments with &gt;72h of inactivity and dispatches motivational reminder emails.", tbl_cell_style)
        ],
        [
            Paragraph("<code>send_course_completion_email</code>", tbl_cell_code),
            Paragraph("Triggered on 100% course completion", tbl_cell_style),
            Paragraph("Dispatches course completion congratulations email to the student.", tbl_cell_style)
        ],
    ]
    celery_table = Table(celery_data, colWidths=[150, 110, 262])
    celery_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(celery_table)

    story.append(Spacer(1, 4))

    story.append(Paragraph("13. Frontend Architecture &amp; Client State (React 19 + Vite)", h1_style))
    story.append(section_divider())
    story.append(p("The React 19 frontend is structured around role-based modularity, global context providers, and responsive Tailwind v4 design:"))
    story.append(p("• <b>`AuthContext.jsx`:</b> Manages global authentication, JWT tokens in `localStorage`, user role decoding, and fetches student/mentor profile details on initial boot.", bullet_style))
    story.append(p("• <b>`ProtectedRoute.jsx`:</b> Evaluates `user.role` against `allowedRoles` (e.g. `['student']`, `['mentor']`, `['admin']`). Redirects unauthenticated visitors to `/login` and role-mismatched users to their respective home dashboards.", bullet_style))
    story.append(p("• <b>Dashboard Layout:</b> Unified shell with responsive collapsible `Sidebar.jsx`, active route indicators, and `Topbar.jsx` user status menu.", bullet_style))

    story.append(Spacer(1, 4))

    story.append(Paragraph("14. Cloud Media Storage &amp; AWS S3 Signed URLs", h1_style))
    story.append(section_divider())
    story.append(p(
        "All course thumbnails, uploaded lesson video files, and student downloadable resources are stored in an encrypted private AWS S3 bucket "
        "(<code>learnmate-videos-storagebox</code>). The bucket rejects all direct public HTTP reads. "
        "Django generates time-limited presigned URLs (1-hour validity via `AWS_QUERYSTRING_EXPIRE = 3600`) when serialized for authenticated students and mentors."
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 11: SECTION 15: REST API REFERENCE
    # =========================================================================
    story.append(Paragraph("15. Comprehensive HTTP REST API Reference", h1_style))
    story.append(section_divider())
    story.append(p("The Django REST Framework backend exposes clean RESTful endpoints under `/api/`:"))

    api_endpoints_data = [
        [Paragraph("<b>Method &amp; Endpoint</b>", tbl_header_style), Paragraph("<b>Auth &amp; Role</b>", tbl_header_style), Paragraph("<b>Description &amp; Request / Response Notes</b>", tbl_header_style)],
        # Accounts
        [Paragraph("<code>POST /api/accounts/register/</code>", tbl_cell_code), Paragraph("Public", tbl_cell_style), Paragraph("Registers new user (email, username, password, role). Dispatches email verification OTP.", tbl_cell_style)],
        [Paragraph("<code>POST /api/accounts/verify-otp/</code>", tbl_cell_code), Paragraph("Public", tbl_cell_style), Paragraph("Verifies 6-digit email OTP. Sets <code>is_verified=True</code>.", tbl_cell_style)],
        [Paragraph("<code>POST /api/accounts/login/</code>", tbl_cell_code), Paragraph("Public", tbl_cell_style), Paragraph("Validates credentials and dispatches login OTP to user email.", tbl_cell_style)],
        [Paragraph("<code>POST /api/accounts/verify-mfa/</code>", tbl_cell_code), Paragraph("Public", tbl_cell_style), Paragraph("Verifies login OTP. Returns <code>{ access, refresh, role, email }</code>.", tbl_cell_style)],
        [Paragraph("<code>POST /api/accounts/token/refresh/</code>", tbl_cell_code), Paragraph("Public", tbl_cell_style), Paragraph("Rotates expired JWT access token using stored refresh token.", tbl_cell_style)],
        [Paragraph("<code>POST /api/accounts/forgot-password/</code>", tbl_cell_code), Paragraph("Public", tbl_cell_style), Paragraph("Dispatches password reset OTP to user email.", tbl_cell_style)],
        [Paragraph("<code>POST /api/accounts/reset-password/</code>", tbl_cell_code), Paragraph("Public", tbl_cell_style), Paragraph("Resets user password with valid OTP code.", tbl_cell_style)],
        
        # Profile
        [Paragraph("<code>GET /api/profile/student/</code>", tbl_cell_code), Paragraph("JWT (Student)", tbl_cell_style), Paragraph("Returns student profile (bio, grade, learning goals).", tbl_cell_style)],
        [Paragraph("<code>GET /api/profile/mentor/</code>", tbl_cell_code), Paragraph("JWT (Mentor)", tbl_cell_style), Paragraph("Returns mentor profile (specialization, experience).", tbl_cell_style)],
        
        # Courses - Student
        [Paragraph("<code>GET /api/courses/</code>", tbl_cell_code), Paragraph("JWT", tbl_cell_style), Paragraph("Lists all approved, published courses in the public catalog.", tbl_cell_style)],
        [Paragraph("<code>GET /api/courses/student/&lt;id&gt;/</code>", tbl_cell_code), Paragraph("JWT (Student)", tbl_cell_style), Paragraph("Course details with modules, lessons, and enrollment status.", tbl_cell_style)],
        [Paragraph("<code>POST /api/courses/student/&lt;id&gt;/enroll/</code>", tbl_cell_code), Paragraph("JWT (Student)", tbl_cell_style), Paragraph("Enrolls authenticated student in the specified course.", tbl_cell_style)],
        [Paragraph("<code>GET /api/courses/student/my-courses/</code>", tbl_cell_code), Paragraph("JWT (Student)", tbl_cell_style), Paragraph("Lists enrolled courses with completion percentages.", tbl_cell_style)],
        [Paragraph("<code>POST /api/courses/lessons/&lt;id&gt;/complete/</code>", tbl_cell_code), Paragraph("JWT (Student)", tbl_cell_style), Paragraph("Marks lesson complete. Dispatches completion email if 100%.", tbl_cell_style)],
        [Paragraph("<code>GET /api/courses/student/courses/&lt;id&gt;/progress/</code>", tbl_cell_code), Paragraph("JWT (Student)", tbl_cell_style), Paragraph("Calculates percentage completed and completed lesson ID list.", tbl_cell_style)],
        
        # Courses - Mentor
        [Paragraph("<code>POST /api/courses/create/</code>", tbl_cell_code), Paragraph("JWT (Mentor)", tbl_cell_style), Paragraph("Creates a new draft course with title, description, level, thumbnail.", tbl_cell_style)],
        [Paragraph("<code>GET /api/courses/my-courses/</code>", tbl_cell_code), Paragraph("JWT (Mentor)", tbl_cell_style), Paragraph("Lists all courses authored by the authenticated mentor.", tbl_cell_style)],
        [Paragraph("<code>POST /api/courses/modules/create/</code>", tbl_cell_code), Paragraph("JWT (Mentor)", tbl_cell_style), Paragraph("Adds a module to a course syllabus.", tbl_cell_style)],
        [Paragraph("<code>POST /api/courses/lessons/create/</code>", tbl_cell_code), Paragraph("JWT (Mentor)", tbl_cell_style), Paragraph("Adds a lesson (YouTube URL or file upload). Triggers Whisper STT task.", tbl_cell_style)],
        [Paragraph("<code>GET /api/courses/mentor/dashboard/</code>", tbl_cell_code), Paragraph("JWT (Mentor)", tbl_cell_style), Paragraph("Mentor overview stats: total students, courses, active enrollments.", tbl_cell_style)],
        [Paragraph("<code>GET /api/courses/mentor/courses/&lt;id&gt;/students/</code>", tbl_cell_code), Paragraph("JWT (Mentor)", tbl_cell_style), Paragraph("List of all enrolled students with individual progress percentages.", tbl_cell_style)],
        
        # Admin Panel
        [Paragraph("<code>GET /api/adminpanel/admin/</code>", tbl_cell_code), Paragraph("JWT (Admin)", tbl_cell_style), Paragraph("System-wide metrics: total users, courses, active enrollments.", tbl_cell_style)],
        [Paragraph("<code>GET /api/adminpanel/courses/pending/</code>", tbl_cell_code), Paragraph("JWT (Admin)", tbl_cell_style), Paragraph("Lists courses waiting for publication approval.", tbl_cell_style)],
        [Paragraph("<code>POST /api/adminpanel/courses/&lt;id&gt;/publish/</code>", tbl_cell_code), Paragraph("JWT (Admin)", tbl_cell_style), Paragraph("Approves and publishes course to public student catalog.", tbl_cell_style)],
        [Paragraph("<code>GET /api/adminpanel/users/</code>", tbl_cell_code), Paragraph("JWT (Admin)", tbl_cell_style), Paragraph("List, filter, and moderate platform users.", tbl_cell_style)],
        
        # AI & Chat
        [Paragraph("<code>POST /api/ai/chat/</code>", tbl_cell_code), Paragraph("JWT", tbl_cell_style), Paragraph("Payload: <code>{ message, course_id }</code>. Proxies query to FastAPI RAG service.", tbl_cell_style)],
        [Paragraph("<code>GET /api/chat/rooms/</code>", tbl_cell_code), Paragraph("JWT", tbl_cell_style), Paragraph("Lists user's 1-on-1 direct message conversation rooms.", tbl_cell_style)],
        [Paragraph("<code>GET /api/chat/rooms/&lt;id&gt;/messages/</code>", tbl_cell_code), Paragraph("JWT", tbl_cell_style), Paragraph("Retrieves historical messages for direct chat room.", tbl_cell_style)],
        [Paragraph("<code>GET /api/chat/groups/</code>", tbl_cell_code), Paragraph("JWT", tbl_cell_style), Paragraph("Lists user's cohort group chat channels.", tbl_cell_style)],
    ]
    api_table = Table(api_endpoints_data, colWidths=[170, 75, 277])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 1.8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1.8),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(api_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 12: SECTION 16: ENVIRONMENT CONFIGURATION
    # =========================================================================
    story.append(Paragraph("16. Environment Configuration &amp; Secret Management", h1_style))
    story.append(section_divider())
    story.append(p("The following configuration files must be established in their respective root directories:"))

    story.append(Paragraph("16.1 Backend Environment Configuration (`backend/.env`)", h2_style))
    backend_env_text = (
        "# Database Credentials (PostgreSQL)\n"
        "DB_NAME=learnmate_db\n"
        "DB_USER=postgres\n"
        "DB_PASSWORD=your_secure_db_password\n"
        "DB_HOST=localhost\n"
        "DB_PORT=5432\n\n"
        "# Django Security & Settings\n"
        "SECRET_KEY=django-insecure-your-production-secret-key-here\n"
        "DEBUG=False\n\n"
        "# Transactional SMTP Email Service (Brevo / SendGrid)\n"
        "EMAIL_HOST=smtp-relay.brevo.com\n"
        "EMAIL_PORT=587\n"
        "EMAIL_HOST_USER=your_brevo_smtp_user@smtp-brevo.com\n"
        "EMAIL_HOST_PASSWORD=xsmtpsib-your-smtp-master-key\n"
        "EMAIL_USE_TLS=True\n"
        "DEFAULT_FROM_EMAIL=no-reply@learnmate.com\n\n"
        "# AI Microservice & LLM API Keys\n"
        "GROQ_API_KEY=gsk_your_groq_production_api_key\n"
        "INTERNAL_API_SECRET=e288669e46a85594a53b62dd5ecc986822de12499d9acc5d7d034391e3e47b29\n\n"
        "# AWS S3 Encrypted Media Bucket\n"
        "AWS_ACCESS_KEY_ID=AKIA_YOUR_AWS_KEY_ID\n"
        "AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key\n"
        "AWS_STORAGE_BUCKET_NAME=learnmate-videos-storagebox\n"
        "AWS_S3_REGION_NAME=us-east-1"
    )
    story.append(code_box(backend_env_text))

    story.append(Spacer(1, 4))

    story.append(Paragraph("16.2 AI Service Environment Configuration (`ai-service/.env`)", h2_style))
    ai_env_text = (
        "GROQ_API_KEY=gsk_your_groq_production_api_key\n"
        "INTERNAL_API_SECRET=e288669e46a85594a53b62dd5ecc986822de12499d9acc5d7d034391e3e47b29"
    )
    story.append(code_box(ai_env_text))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 13: SECTION 17: PRODUCTION DEPLOYMENT, NGINX & SSL
    # =========================================================================
    story.append(Paragraph("17. Production Deployment, Nginx, Systemd, Domain &amp; SSL (HTTPS)", h1_style))
    story.append(section_divider())
    story.append(p(
        "For production hosting on Ubuntu Linux (e.g. AWS EC2, DigitalOcean, or Linode), "
        "the architecture runs Daphne ASGI, FastAPI, Celery, and Redis behind an Nginx reverse proxy with automated Let's Encrypt SSL."
    ))

    story.append(Paragraph("17.1 Production Nginx Configuration (`/etc/nginx/sites-available/learnmate`)", h2_style))
    nginx_conf = (
        "server {\n"
        "    server_name api.learnmate.com learnmate.com;\n\n"
        "    # Frontend Production Build (Static React Files)\n"
        "    location / {\n"
        "        root /var/www/learnmate/frontend/dist;\n"
        "        index index.html;\n"
        "        try_files $uri $uri/ /index.html;\n"
        "    }\n\n"
        "    # Django HTTP REST APIs\n"
        "    location /api/ {\n"
        "        proxy_pass http://127.0.0.1:8000;\n"
        "        proxy_set_header Host $host;\n"
        "        proxy_set_header X-Real-IP $remote_addr;\n"
        "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n"
        "        proxy_set_header X-Forwarded-Proto $scheme;\n"
        "    }\n\n"
        "    # Django Channels WebSocket Connections\n"
        "    location /ws/ {\n"
        "        proxy_pass http://127.0.0.1:8000;\n"
        "        proxy_http_version 1.1;\n"
        "        proxy_set_header Upgrade $http_upgrade;\n"
        "        proxy_set_header Connection \"Upgrade\";\n"
        "        proxy_set_header Host $host;\n"
        "        proxy_read_timeout 86400;\n"
        "    }\n"
        "}"
    )
    story.append(code_box(nginx_conf))

    story.append(Paragraph("17.2 Domain &amp; Automated Let's Encrypt SSL Setup", h2_style))
    ssl_commands = (
        "# 1. Install Certbot for Nginx\n"
        "sudo apt update && sudo apt install -y certbot python3-certbot-nginx\n\n"
        "# 2. Request and install SSL certificate for domains\n"
        "sudo certbot --nginx -d learnmate.com -d api.learnmate.com\n\n"
        "# 3. Test automatic certificate renewal\n"
        "sudo certbot renew --dry-run"
    )
    story.append(code_box(ssl_commands))

    story.append(Paragraph("17.3 Systemd Services Architecture", h2_style))
    p_services = (
        "Four systemd service units manage background processes:\n"
        "• <b>`learnmate-daphne.service`:</b> Runs `daphne -b 127.0.0.1 -p 8000 core.asgi:application`\n"
        "• <b>`learnmate-ai.service`:</b> Runs `uvicorn main:app --host 127.0.0.1 --port 8001` in `ai-service/`\n"
        "• <b>`learnmate-celery.service`:</b> Runs `celery -A core worker --loglevel=info --concurrency=4` in `backend/`\n"
        "• <b>`learnmate-beat.service`:</b> Runs `celery -A core beat --loglevel=info` in `backend/`"
    )
    story.append(p(p_services))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 14: SECTION 18 & 19: TESTING & TROUBLESHOOTING
    # =========================================================================
    story.append(Paragraph("18. Testing, Verification, QA &amp; Health Checks", h1_style))
    story.append(section_divider())
    story.append(p("A complete verification checklist to validate system health across all layers:"))

    qa_data = [
        [Paragraph("<b>Subsystem</b>", tbl_header_style), Paragraph("<b>Verification Command / Action</b>", tbl_header_style), Paragraph("<b>Expected Output / Behavior</b>", tbl_header_style)],
        [
            Paragraph("<b>Backend Health</b>", tbl_cell_bold),
            Paragraph("<code>python manage.py check</code><br/><code>python manage.py test</code>", tbl_cell_code),
            Paragraph("<code>System check identified no issues (0 silenced).</code>", tbl_cell_style)
        ],
        [
            Paragraph("<b>AI Service Health</b>", tbl_cell_bold),
            Paragraph("<code>curl -i http://127.0.0.1:8001/health</code>", tbl_cell_code),
            Paragraph("<code>HTTP/1.1 200 OK &rarr; {\"status\":\"ok\"}</code>", tbl_cell_style)
        ],
        [
            Paragraph("<b>Redis Broker</b>", tbl_cell_bold),
            Paragraph("<code>redis-cli ping</code>", tbl_cell_code),
            Paragraph("<code>PONG</code>", tbl_cell_style)
        ],
        [
            Paragraph("<b>Celery Tasks</b>", tbl_cell_bold),
            Paragraph("<code>celery -A core inspect active</code>", tbl_cell_code),
            Paragraph("Lists running Celery worker nodes without exceptions.", tbl_cell_style)
        ],
        [
            Paragraph("<b>Frontend Build</b>", tbl_cell_bold),
            Paragraph("<code>npm run build</code> in <code>frontend/</code>", tbl_cell_code),
            Paragraph("Zero TypeScript / JSX errors; builds optimized static bundle.", tbl_cell_style)
        ],
    ]
    qa_table = Table(qa_data, colWidths=[100, 205, 217])
    qa_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2.2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.2),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(qa_table)

    story.append(Spacer(1, 4))

    story.append(Paragraph("19. Troubleshooting Manual &amp; Common Failure Modes", h1_style))
    story.append(section_divider())

    trouble_data = [
        [Paragraph("<b>Symptom / Issue</b>", tbl_header_style), Paragraph("<b>Root Cause</b>", tbl_header_style), Paragraph("<b>Remediation Step</b>", tbl_header_style)],
        [
            Paragraph("WebSocket connects then immediately closes (4003)", tbl_cell_bold),
            Paragraph("Invalid, expired, or missing JWT token during WS handshake.", tbl_cell_style),
            Paragraph("Ensure React passes <code>?token=&lt;access_token&gt;</code> in WS URL or refreshes expired token first.", tbl_cell_style)
        ],
        [
            Paragraph("AI Tutor returns <i>'AI service unavailable'</i> (503)", tbl_cell_bold),
            Paragraph("FastAPI service on Port 8001 is down or <code>INTERNAL_API_SECRET</code> mismatch.", tbl_cell_style),
            Paragraph("Verify FastAPI is running (<code>curl http://127.0.0.1:8001/health</code>) and secrets in both <code>.env</code> files match.", tbl_cell_style)
        ],
        [
            Paragraph("Lesson stays stuck on <code>transcript_status='pending'</code>", tbl_cell_bold),
            Paragraph("Celery worker process is not active or crashed during Whisper processing.", tbl_cell_style),
            Paragraph("Start Celery worker: <code>celery -A core worker --loglevel=info</code>. Check Celery logs.", tbl_cell_style)
        ],
        [
            Paragraph("S3 Video / Resource returns 403 Forbidden", tbl_cell_bold),
            Paragraph("Presigned URL expired (&gt;1h) or incorrect AWS S3 credentials.", tbl_cell_style),
            Paragraph("Verify AWS credentials in <code>backend/.env</code> and ensure media URLs are freshly serialized.", tbl_cell_style)
        ],
        [
            Paragraph("CORS errors on frontend REST API calls", tbl_cell_bold),
            Paragraph("Missing <code>corsheaders</code> in Django settings or unallowed origin.", tbl_cell_style),
            Paragraph("Verify <code>CORS_ALLOW_ALL_ORIGINS = True</code> or add origin to <code>CORS_ALLOWED_ORIGINS</code>.", tbl_cell_style)
        ],
    ]
    trouble_table = Table(trouble_data, colWidths=[130, 155, 237])
    trouble_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2.2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.2),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(trouble_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 15: SECTION 20: DEVELOPER ONBOARDING MANUAL
    # =========================================================================
    story.append(Paragraph("20. Developer Onboarding: Rapid Codebase Bootstrap Guide", h1_style))
    story.append(section_divider())
    story.append(p(
        "Welcome to the LearnMate engineering team! This final section is your step-by-step onboarding guide to bootstrap your local development environment in under 10 minutes."
    ))

    story.append(Paragraph("Step 1: Clone Repository &amp; Configure Prerequisites", h2_style))
    story.append(p("Ensure you have <b>Python 3.10+</b>, <b>Node.js 18+</b>, <b>PostgreSQL</b>, and <b>Redis Server</b> installed on your machine.", bullet_style))

    story.append(Paragraph("Step 2: Bootstrap Django Backend", h2_style))
    dev_backend_cmds = (
        "# 1. Navigate to backend directory and create virtual environment\n"
        "cd backend\n"
        "python -m venv venv\n"
        "source venv/bin/activate    # On Windows: venv\\Scripts\\activate\n\n"
        "# 2. Install dependencies\n"
        "pip install -r requirements.txt\n\n"
        "# 3. Configure backend/.env (copy sample values from Section 16)\n"
        "# 4. Apply database migrations & create superuser\n"
        "python manage.py migrate\n"
        "python manage.py createsuperuser\n\n"
        "# 5. Run Daphne ASGI development server (Port 8000)\n"
        "python manage.py runserver"
    )
    story.append(code_box(dev_backend_cmds))

    story.append(Paragraph("Step 3: Launch Background Workers (Redis &amp; Celery)", h2_style))
    dev_worker_cmds = (
        "# In a separate terminal tab: Start Redis Server\n"
        "redis-server\n\n"
        "# In another terminal tab (with backend venv activated):\n"
        "celery -A core worker --loglevel=info --concurrency=2\n\n"
        "# In another terminal tab (for periodic cron schedulers):\n"
        "celery -A core beat --loglevel=info"
    )
    story.append(code_box(dev_worker_cmds))

    story.append(Paragraph("Step 4: Bootstrap FastAPI AI &amp; RAG Microservice", h2_style))
    dev_ai_cmds = (
        "cd ai-service\n"
        "python -m venv venv\n"
        "source venv/bin/activate    # On Windows: venv\\Scripts\\activate\n"
        "pip install -r requirements.txt\n\n"
        "# Launch FastAPI microservice on Port 8001\n"
        "uvicorn main:app --port 8001 --reload"
    )
    story.append(code_box(dev_ai_cmds))

    story.append(Paragraph("Step 5: Bootstrap React Frontend", h2_style))
    dev_front_cmds = (
        "cd frontend\n"
        "npm install\n\n"
        "# Launch Vite development server on Port 5173\n"
        "npm run dev"
    )
    story.append(code_box(dev_front_cmds))

    story.append(Spacer(1, 4))
    story.append(callout_box(
        "DEVELOPER CHEAT SHEET: KEY CODE LOCATIONS",
        "• <b>Authentication Logic:</b> <code>backend/apps/accounts/views.py</code><br/>"
        "• <b>Syllabus &amp; Video Ingestion:</b> <code>backend/apps/courses/views.py</code> &amp; <code>tasks.py</code><br/>"
        "• <b>Speech Transcription &amp; Translation:</b> <code>backend/apps/courses/services/transcription.py</code><br/>"
        "• <b>RAG Chunking &amp; Embeddings:</b> <code>ai-service/services/embeddings.py</code> &amp; <code>vectorstore.py</code><br/>"
        "• <b>WebSocket Consumers:</b> <code>backend/apps/chat/consumers.py</code><br/>"
        "• <b>Frontend Router &amp; Guards:</b> <code>frontend/src/App.jsx</code> &amp; <code>components/ProtectedRoute.jsx</code><br/>"
        "• <b>Axios Interceptor:</b> <code>frontend/src/api.js</code>",
        bg_color=colors.HexColor("#f0fdf4"),
        border_color=colors.HexColor("#22c55e"),
        title_color=c_teal
    ))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF Successfully Generated: {pdf_path}")

if __name__ == "__main__":
    build_pdf()
