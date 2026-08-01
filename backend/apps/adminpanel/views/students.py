from django.db.models import Count
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
from apps.courses.models import Enrollment

from ..serializers.students import (
    AdminStudentListSerializer,
    AdminStudentDetailSerializer,
)

class AdminStudentListAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        students = (
            User.objects
            .filter(role="student")
            .annotate(
                total_courses=Count("enrollments", distinct=True)
            )
            .order_by("-created_at")
        )

        serializer = AdminStudentListSerializer(
            students,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

class AdminStudentDetailAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, student_id):

        try:

            student = User.objects.get(
                id=student_id,
                role="student"
            )

        except User.DoesNotExist:

            return Response(
                {
                    "message": "Student not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AdminStudentDetailSerializer(student)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )        

class AdminStudentStatusAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, student_id):

        try:

            student = User.objects.get(
                id=student_id,
                role="student"
            )

        except User.DoesNotExist:

            return Response(
                {
                    "message": "Student not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        student.is_active = not student.is_active
        student.save(update_fields=["is_active"])

        return Response(
            {
                "message": (
                    "Student activated successfully."
                    if student.is_active
                    else "Student suspended successfully."
                ),
                "is_active": student.is_active
            },
            status=status.HTTP_200_OK
        )        

class AdminStudentDeleteAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, student_id):

        try:

            student = User.objects.get(
                id=student_id,
                role="student"
            )

        except User.DoesNotExist:

            return Response(
                {
                    "message": "Student not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        student.delete()

        return Response(
            {
                "message": "Student deleted successfully."
            },
            status=status.HTTP_200_OK
        )        