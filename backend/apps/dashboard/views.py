from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsAdmin, IsMentor, IsStudent
from .models import Course, CourseEnrollment, StudentActivity, StudentStreak, Resource, Message, AIChatMessage

class StudentDashboardView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user
        
        # 1. Get or Create Streak
        streak, _ = StudentStreak.objects.get_or_create(student=user, defaults={"days": 5})

        # 2. Get or Create Enrolled Courses (with auto-seeding if empty)
        enrollments = CourseEnrollment.objects.filter(student=user, is_active=True)
        if not enrollments.exists():
            # Create default global courses if they don't exist
            c1, _ = Course.objects.get_or_create(
                 code="PHY-301",
                defaults={
                    "title": "Special Relativity & Quantum Foundations",
                    "description": "Understand spacetime structures and quantum foundations.",
                    "difficulty": "Advanced Physics II",
                    "lessons_count": 10
                }
            )
            c2, _ = Course.objects.get_or_create(
                code="PHY-302",
                defaults={
                    "title": "Electromagnetism Theory",
                    "description": "Classical electrodynamics, Maxwell equations, waves.",
                    "difficulty": "Theoretical Physics",
                    "lessons_count": 8
                }
            )
            c3, _ = Course.objects.get_or_create(
                code="PHY-102",
                defaults={
                    "title": "Classical Mechanics & Dynamics",
                    "description": "Lagrangian mechanics, central force motion, rigid bodies.",
                    "difficulty": "Core Physics",
                    "lessons_count": 12
                }
            )
            
            # Create enrollments
            CourseEnrollment.objects.create(student=user, course=c1, progress=75)
            CourseEnrollment.objects.create(student=user, course=c2, progress=40)
            CourseEnrollment.objects.create(student=user, course=c3, progress=90)
            
            enrollments = CourseEnrollment.objects.filter(student=user, is_active=True)

        # 3. Get or Create Student Activities
        activities = StudentActivity.objects.filter(student=user)
        if not activities.exists():
            StudentActivity.objects.create(
                student=user,
                activity_name="Lorentz Factor Problem Set",
                category="Assignment",
                status="COMPLETED",
                timestamp="2 hours ago",
                score="98%"
            )
            StudentActivity.objects.create(
                student=user,
                activity_name="Time Dilation Basics (Video)",
                category="Lesson",
                status="COMPLETED",
                timestamp="Yesterday",
                score="-"
            )
            StudentActivity.objects.create(
                student=user,
                activity_name="Weekly Physics Check-in",
                category="Quiz",
                status="PENDING",
                timestamp="3 days ago",
                score="82%"
            )
            activities = StudentActivity.objects.filter(student=user)

        # 4. Get Recommendations (courses user is not enrolled in)
        enrolled_course_ids = enrollments.values_list('course_id', flat=True)
        recommendations = Course.objects.exclude(id__in=enrolled_course_ids)
        
        # If no recommendation exist, create some recommended courses
        if not recommendations.exists():
            rec1, _ = Course.objects.get_or_create(
                code="PHY-401",
                defaults={
                    "title": "Quantum Electrodynamics",
                    "description": "Relativistic quantum field theory of electrodynamics.",
                    "difficulty": "Intermediate",
                    "lessons_count": 8
                }
            )
            rec2, _ = Course.objects.get_or_create(
                code="PHY-201",
                defaults={
                    "title": "Astrophysics & Cosmology",
                    "description": "Introduction to stellar physics, galaxies, and the universe.",
                    "difficulty": "Beginner",
                    "lessons_count": 12
                }
            )
            recommendations = Course.objects.exclude(id__in=enrolled_course_ids)

        # 5. Get or Create Resources
        resources = Resource.objects.all()
        if not resources.exists():
            Resource.objects.create(name="Special Relativity Formula Sheet", size="2.4 MB", file_type="PDF Document")
            Resource.objects.create(name="Lorentz Factor Problem Guide", size="8.1 MB", file_type="PDF Workbook")
            Resource.objects.create(name="Quantum Mechanics Core Lectures", size="15.3 MB", file_type="Presentation Slides")
            Resource.objects.create(name="Physics II Lab Manual", size="4.7 MB", file_type="PDF Document")
            resources = Resource.objects.all()

        # 6. Get or Create Messages
        msgs = Message.objects.filter(sender=user)
        if not msgs.exists():
            Message.objects.create(
                sender=user,
                receiver_name="Dr. Sarah Chen",
                text=f"Hi {user.username}, I reviewed your last problem set and noticed you got 98%. Excellent job on that hard Lorentz relativity transformations question!",
                timestamp="12:45",
                is_read=True,
                initials="SC"
            )
            msgs = Message.objects.filter(sender=user)

        # 7. Get or Create AI Chat messages
        ai_msgs = AIChatMessage.objects.filter(student=user).order_by('timestamp')
        if not ai_msgs.exists():
            AIChatMessage.objects.create(
                student=user,
                sender="ai",
                text=f"Hello {user.username}! I am your AI Tutor. Ready to master Einstein's Relativity today? Ask me any questions!"
            )
            ai_msgs = AIChatMessage.objects.filter(student=user).order_by('timestamp')

        # 8. Format current course (e.g. PHY-301)
        current_enrollment = enrollments.filter(course__code="PHY-301").first()
        if not current_enrollment:
            current_enrollment = enrollments.first()

        current_course_data = {
            "title": current_enrollment.course.title,
            "description": current_enrollment.course.description,
            "code": current_enrollment.course.code,
            "difficulty": current_enrollment.course.difficulty,
            "lessons_count": current_enrollment.course.lessons_count,
            "progress": current_enrollment.progress
        } if current_enrollment else None

        # 9. Format Response
        return Response({
            "streak": streak.days,
            "current_course": current_course_data,
            "enrolled_courses": [
                {
                    "title": e.course.title,
                    "description": e.course.description,
                    "code": e.course.code,
                    "difficulty": e.course.difficulty,
                    "lessons_count": e.course.lessons_count,
                    "progress": e.progress
                } for e in enrollments
            ],
            "recent_activity": [
                {
                    "activity_name": a.activity_name,
                    "category": a.category,
                    "status": a.status,
                    "timestamp": a.timestamp,
                    "score": a.score
                } for a in activities
            ],
            "recommendations": [
                {
                    "title": r.title,
                    "description": r.description,
                    "code": r.code,
                    "difficulty": r.difficulty,
                    "lessons_count": r.lessons_count
                } for r in recommendations
            ],
            "resources": [
                {
                    "name": res.name,
                    "size": res.size,
                    "file_type": res.file_type
                } for res in resources
            ],
            "messages": [
                {
                    "receiver_name": m.receiver_name,
                    "text": m.text,
                    "timestamp": m.timestamp,
                    "is_read": m.is_read,
                    "initials": m.initials
                } for m in msgs
            ],
            "ai_chat_messages": [
                {
                    "sender": m.sender,
                    "text": m.text
                } for m in ai_msgs
            ]
        })

class StudentAIChatView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user
        messages = AIChatMessage.objects.filter(student=user).order_by('timestamp')
        if not messages.exists():
            AIChatMessage.objects.create(
                student=user,
                sender="ai",
                text=f"Hello {user.username}! I am your AI Tutor. Ready to master Einstein's Relativity today? Ask me any questions!"
            )
            messages = AIChatMessage.objects.filter(student=user).order_by('timestamp')
            
        return Response([
            {
                "sender": m.sender,
                "text": m.text
            } for m in messages
        ])

    def post(self, request):
        user = request.user
        text = request.data.get("text", "")
        if not text:
            return Response({"error": "Text is required"}, status=400)
            
        # Save user message
        AIChatMessage.objects.create(
            student=user,
            sender="user",
            text=text
        )
        
        # Generate simulated response
        ai_response = "That is a fascinating question! Let's break it down using the Lorentz factor equation γ = 1 / sqrt(1 - v²/c²)..."
        if "mass" in text.lower():
            ai_response = "In special relativity, mass and energy are equivalent, expressed by Einstein's famous equation E = mc²."
        elif "time" in text.lower():
            ai_response = "Time dilation means that a clock moving relative to an observer will be measured to tick slower than a clock at rest in the observer's own frame of reference."
        elif "streak" in text.lower():
            ai_response = "Keep studying physics every day to maintain your learning streak!"
            
        # Save AI response
        AIChatMessage.objects.create(
            student=user,
            sender="ai",
            text=ai_response
        )
        
        # Get all messages
        messages = AIChatMessage.objects.filter(student=user).order_by('timestamp')
        return Response([
            {
                "sender": m.sender,
                "text": m.text
            } for m in messages
        ])

class StudentMessagesView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user
        messages = Message.objects.filter(sender=user)
        if not messages.exists():
            Message.objects.create(
                sender=user,
                receiver_name="Dr. Sarah Chen",
                text=f"Hi {user.username}, I reviewed your last problem set and noticed you got 98%. Excellent job on that hard Lorentz relativity transformations question!",
                timestamp="12:45",
                is_read=True,
                initials="SC"
            )
            messages = Message.objects.filter(sender=user)
            
        return Response([
            {
                "receiver_name": m.receiver_name,
                "text": m.text,
                "timestamp": m.timestamp,
                "is_read": m.is_read,
                "initials": m.initials
            } for m in messages
        ])

    def post(self, request):
        user = request.user
        text = request.data.get("text", "")
        receiver_name = request.data.get("receiver_name", "Dr. Sarah Chen")
        initials = request.data.get("initials", "SC")
        
        if not text:
            return Response({"error": "Text is required"}, status=400)
            
        msg = Message.objects.create(
            sender=user,
            receiver_name=receiver_name,
            text=text,
            timestamp="Just now",
            is_read=True,
            initials=initials
        )
        
        return Response({
            "receiver_name": msg.receiver_name,
            "text": msg.text,
            "timestamp": msg.timestamp,
            "is_read": msg.is_read,
            "initials": msg.initials
        })

class MentorDashboardView(APIView):
    permission_classes = [IsMentor]

    def get(self, request):
        return Response(
            {
                "name": request.user.username,
                "role": request.user.role,
                "message": "Mentor Dashboard"
            }
        )
        
class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response(
            {
                "name": request.user.username,
                "role": request.user.role,
                "message": "Admin Dashboard"
            }
        )