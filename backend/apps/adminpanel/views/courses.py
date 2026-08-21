from django.db.models import Count
# pyrefly: ignore
from rest_framework.views import APIView
# pyrefly: ignore
from rest_framework.response import Response
# pyrefly: ignore
from rest_framework import status
# pyrefly: ignore
from rest_framework.permissions import IsAuthenticated
# pyrefly: ignore
from apps.accounts.permissions import IsAdmin
# pyrefly: ignore [missing-import]
from apps.courses.models import Course
# pyrefly: ignore
from apps.adminpanel.serializers.courses import AdminCourseListSerializer,AdminCourseDetailSerializer


class AdminCourseListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        courses = (
            Course.objects
            .select_related("mentor")
            .annotate(
                module_count=Count("modules", distinct=True),
                lesson_count=Count("modules__lessons", distinct=True),
            )
            .order_by("-created_at")
        )

        serializer = AdminCourseListSerializer(courses, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminCourseDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, course_id):
        try:
            course = Course.objects.select_related(
                "mentor"
            ).prefetch_related(
                "modules__lessons__resources"
            ).get(id=course_id)

            serializer = AdminCourseDetailSerializer(course)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Course.DoesNotExist:
            return Response(
                {
                    "message": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )        


class AdminCoursePublishAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, course_id):

        try:
            course = Course.objects.get(id=course_id)

        except Course.DoesNotExist:

            return Response(
                {"message": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if course.status == "published":

            return Response(
                {"message": "Course is already published."},
                status=status.HTTP_400_BAD_REQUEST
            )

        course.status = "published"
        course.save(update_fields=["status"])

        return Response(
            {"message": "Course published successfully."},
            status=status.HTTP_200_OK
        )

class AdminCourseUnpublishAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, course_id):

        try:
            course = Course.objects.get(id=course_id)

        except Course.DoesNotExist:

            return Response(
                {"message": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if course.status == "draft":

            return Response(
                {"message": "Course is already unpublished."},
                status=status.HTTP_400_BAD_REQUEST
            )

        course.status = "draft"
        course.save(update_fields=["status"])

        return Response(
            {"message": "Course unpublished successfully."},
            status=status.HTTP_200_OK
        )


class AdminCourseDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, course_id):

        try:
            course = Course.objects.get(id=course_id)

        except Course.DoesNotExist:
            return Response(
                {
                    "message": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        course_title = course.title

        course.delete()

        return Response(
            {
                "message": f'"{course_title}" deleted successfully.'
            },
            status=status.HTTP_200_OK
        ) 

class AdminPendingCourseListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        courses = (
            Course.objects
            .filter(status="draft")
            .select_related("mentor")
            .order_by("-created_at")
        )

        serializer = AdminCourseListSerializer(
            courses,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )  

class AdminPublishedCourseListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        courses = (
            Course.objects
            .filter(status="published")
            .select_related("mentor")
            .annotate(
                module_count=Count("modules", distinct=True),
                lesson_count=Count("modules__lessons", distinct=True),
            )
            .order_by("-updated_at")
        )

        serializer = AdminCourseListSerializer(courses, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)                     


class AdminCourseStatisticsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        statistics = {
            "total_courses": Course.objects.count(),
            "published_courses": Course.objects.filter(
                status="published"
            ).count(),
            "draft_courses": Course.objects.filter(
                status="draft"
            ).count(),

            "beginner_courses": Course.objects.filter(
                level="beginner"
            ).count(),

            "intermediate_courses": Course.objects.filter(
                level="intermediate"
            ).count(),

            "advanced_courses": Course.objects.filter(
                level="advanced"
            ).count(),
        }

        return Response(
            statistics,
            status=status.HTTP_200_OK
        )

# apps.adiminpanel.views.courses.py