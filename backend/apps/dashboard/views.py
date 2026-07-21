from django.shortcuts import render
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import] 
from rest_framework.permissions import IsAuthenticated
# pyrefly: ignore
from apps.accounts.permissions import IsAdmin, IsMentor, IsStudent
# pyrefly: ignore
from apps.accounts.models import User
from .models import Course, LessonProgress, Lesson , CourseEnrollment
from .serializers import RecentUserSerializer ,CourseDetailSerializer
# pyrefly: ignore
from rest_framework import status

class CourseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        """Returns the full chapter and lesson tree for a specific course"""
        try:
            course = Course.objects.get(id=course_id)
            serializer = CourseDetailSerializer(course)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Course.DoesNotExist:
            return Response({"message": "Course not found"}, status=status.HTTP_404_NOT_FOUND)


class CompleteLessonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        """Marks a specific lesson as completed by the authenticated student"""
        try:
            lesson = Lesson.objects.get(id=lesson_id)
            progress, created = LessonProgress.objects.get_or_create(
                student=request.user,
                lesson=lesson
            )
            progress.is_completed = True
            progress.save()
            
            # TODO: Here you can check if the overall course progress hit 100%.
            # If yes, trigger your immediate Celery task:
            # send_course_completion_email.delay(request.user.id, lesson.chapter.course.id)

            return Response({"message": "Lesson marked as completed successfully"}, status=status.HTTP_200_OK)
        except Lesson.DoesNotExist:
            return Response({"message": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)



class StudentDashboardView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user
        

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
            "recommendations": [
                {
                    "title": r.title,
                    "description": r.description,
                    "code": r.code,
                    "difficulty": r.difficulty,
                    "lessons_count": r.lessons_count
                } for r in recommendations
            ],
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
        total_users = User.objects.count()
        total_students = User.objects.filter(role="student").count()
        total_mentors = User.objects.filter(role="mentor").count()
        total_admins = User.objects.filter(role="admin").count()
        verified_users = User.objects.filter(is_verified=True).count()
        unverified_users = User.objects.filter(is_verified=False).count()
        mfa_enabled_users = User.objects.filter(mfa_enabled=True).count()
        recent_users = User.objects.order_by("-created_at")[:5]
        serializer = RecentUserSerializer(recent_users,many=True)

        return Response({

    "statistics": {

        "total_users": total_users,

        "total_students": total_students,

        "total_mentors": total_mentors,

        "total_admins": total_admins,

        "verified_users": verified_users,

        "unverified_users": unverified_users,

        "mfa_enabled_users": mfa_enabled_users,

    },

    "recent_users": serializer.data

})