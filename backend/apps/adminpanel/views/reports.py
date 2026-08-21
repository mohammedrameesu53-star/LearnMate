# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework.permissions import IsAuthenticated
# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from apps.accounts.permissions import IsAdmin
# pyrefly: ignore [missing-import]
from apps.accounts.models import User
# pyrefly: ignore [missing-import]
from apps.courses.models import (
    Course,
    Enrollment,
)

from django.db.models import Count


class AdminReportsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        recent_users = (
            User.objects
            .order_by("-created_at")[:5]
        )

        recent_courses = (
            Course.objects
            .select_related("mentor")
            .order_by("-created_at")[:5]
        )

        top_courses = (
            Course.objects
            .annotate(
                total_students=Count("enrollments")
            )
            .order_by("-total_students")[:5]
        )

        return Response(
            {
                "recent_users": [
                    {
                        "id": user.id,
                        "name": user.get_full_name() or user.username,
                        "email": user.email,
                        "role": user.role,
                        "created_at": user.created_at,
                    }
                    for user in recent_users
                ],

                "recent_courses": [
                    {
                        "id": course.id,
                        "title": course.title,
                        "mentor": {
                            "id": course.mentor.id,
                            "name": course.mentor.get_full_name() or course.mentor.username,
                            "email": course.mentor.email,
                        },
                        "status": course.status,
                        "level": course.level,
                        "created_at": course.created_at,
                    }
                    for course in recent_courses
                ],

                "top_courses": [
                    {
                        "id": course.id,
                        "title": course.title,
                        "students": course.total_students,
                    }
                    for course in top_courses
                ],

                "total_enrollments": Enrollment.objects.count(),

                "completed_enrollments": Enrollment.objects.filter(
                    is_completed=True
                ).count(),

                "active_enrollments": Enrollment.objects.filter(
                    is_active=True
                ).count(),
            },
            status=status.HTTP_200_OK,
        )

        # apps.adminpanel.views.reports.py