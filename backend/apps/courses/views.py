from django.shortcuts import render

# Create your views here.
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework.permissions import IsAuthenticated
# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Course,Module,Lesson,LessonResource,Enrollment,LessonProgress
from .serializers import CourseSerializer,ModuleSerializer,LessonSerializer,LessonResourceSerializer,EnrollmentSerializer

# Mentor Course CRUD.
# *************************************************


# Course CRUD
class CreateCourseView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.role != "mentor":

            return Response(
                {
                    "error": "Only mentors can create courses."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CourseSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                mentor=request.user
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )   


class MyCoursesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "mentor":

            return Response(
                {
                    "error": "Only mentors can access this."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        courses = Course.objects.filter(
            mentor=request.user
        ).order_by("-created_at")

        serializer = CourseSerializer(
            courses,
            many=True
        )

        return Response(serializer.data)        


class CourseDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):

        try:

            course = Course.objects.get(
                id=course_id
            )

        except Course.DoesNotExist:

            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if (
            request.user.role == "mentor" and
            course.mentor != request.user
        ):

            return Response(
                {
                    "error": "You do not have permission to access this course."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CourseSerializer(course)

        return Response(serializer.data)


class UpdateCourseView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, course_id):

        try:
            course = Course.objects.get(
                id=course_id
            )

        except Course.DoesNotExist:

            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CourseSerializer(
            course,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class DeleteCourseView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, course_id):

        try:

            course = Course.objects.get(
                id=course_id
            )

        except Course.DoesNotExist:

            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        course.delete()

        return Response(
            {
                "message": "Course deleted successfully."
            },
            status=status.HTTP_200_OK
        )        







# Module CRUD

class CreateModuleView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        course_id = request.data.get("course")

        try:

            course = Course.objects.get(
                id=course_id
            )

        except Course.DoesNotExist:

            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ModuleSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                course=course
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )        


class ModuleListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):

        try:

            course = Course.objects.get(
                id=course_id
            )

        except Course.DoesNotExist:

            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        modules = Module.objects.filter(
            course=course
        ).order_by("order")

        serializer = ModuleSerializer(
            modules,
            many=True
        )

        return Response(serializer.data)


class UpdateModuleView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, module_id):

        try:

            module = Module.objects.get(
                id=module_id
            )

        except Module.DoesNotExist:

            return Response(
                {
                    "error": "Module not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != module.course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ModuleSerializer(
            module,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )        

class DeleteModuleView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, module_id):

        try:

            module = Module.objects.get(
                id=module_id
            )

        except Module.DoesNotExist:

            return Response(
                {
                    "error": "Module not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != module.course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        module.delete()

        return Response(
            {
                "message": "Module deleted successfully."
            },
            status=status.HTTP_200_OK
        )        

# Lesson CRUD

class CreateLessonView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        module_id = request.data.get("module")

        try:

            module = Module.objects.get(
                id=module_id
            )

        except Module.DoesNotExist:

            return Response(
                {
                    "error": "Module not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != module.course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LessonSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                module=module
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class LessonListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, module_id):

        try:

            module = Module.objects.get(
                id=module_id
            )

        except Module.DoesNotExist:

            return Response(
                {
                    "error": "Module not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != module.course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        lessons = Lesson.objects.filter(
            module=module
        ).order_by("order")

        serializer = LessonSerializer(
            lessons,
            many=True
        )

        return Response(serializer.data) 


class UpdateLessonView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, lesson_id):

        try:

            lesson = Lesson.objects.get(
                id=lesson_id
            )

        except Lesson.DoesNotExist:

            return Response(
                {
                    "error": "Lesson not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != lesson.module.course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LessonSerializer(
            lesson,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class DeleteLessonView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, lesson_id):

        try:

            lesson = Lesson.objects.get(
                id=lesson_id
            )

        except Lesson.DoesNotExist:

            return Response(
                {
                    "error": "Lesson not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != lesson.module.course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        lesson.delete()

        return Response(
            {
                "message": "Lesson deleted successfully."
            },
            status=status.HTTP_200_OK
        )

# Lesson Resources

class LessonResourceView(APIView):

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, lesson_id):

        try:
            lesson = Lesson.objects.select_related(
                "module",
                "module__course"
            ).get(id=lesson_id)

        except Lesson.DoesNotExist:

            return Response(
                {"error": "Lesson not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        course = lesson.module.course

        # Mentor who owns the course
        if request.user == course.mentor:

            pass

        # Student must be enrolled
        elif request.user.role == "student":

            enrolled = Enrollment.objects.filter(
                student=request.user,
                course=course,
                is_active=True
            ).exists()

            if not enrolled:

                return Response(
                    {
                        "error": "You are not enrolled in this course."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        # Everyone else
        else:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        resources = LessonResource.objects.filter(
            lesson=lesson
        ).order_by("created_at")

        serializer = LessonResourceSerializer(
            resources,
            many=True
        )

        return Response(serializer.data)


    def post(self, request, lesson_id):

        try:
            lesson = Lesson.objects.get(id=lesson_id)

        except Lesson.DoesNotExist:
            return Response(
                {"error": "Lesson not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != lesson.module.course.mentor:
            return Response(
                {"error": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LessonResourceSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                lesson=lesson
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class LessonResourceDetailView(APIView):

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, resource_id):

        try:
            resource = LessonResource.objects.get(
                id=resource_id
            )

        except LessonResource.DoesNotExist:

            return Response(
                {"error": "Resource not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != resource.lesson.module.course.mentor:

            return Response(
                {"error": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LessonResourceSerializer(
            resource,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def delete(self, request, resource_id):

        try:
            resource = LessonResource.objects.get(
                id=resource_id
            )

        except LessonResource.DoesNotExist:

            return Response(
                {"error": "Resource not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != resource.lesson.module.course.mentor:

            return Response(
                {"error": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN
            )

        resource.delete()

        return Response(
            {
                "message": "Resource deleted successfully."
            },
            status=status.HTTP_200_OK
        )




class PublishCourseAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, course_id):

        try:
            course = Course.objects.get(
                id=course_id
            )

        except Course.DoesNotExist:

            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if course.status == "published":

            return Response(
                {
                    "message": "Course is already published."
                }
            )

        # ---------- Future Validations ----------
        #
        # Check course has modules
        # Check modules have lessons
        # Check thumbnail exists
        # Check description exists
        #
        # ----------------------------------------

        course.status = "published"
        course.save()

        return Response(
            {
                "message": "Course published successfully."
            }
        )


class UnpublishCourseAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, course_id):

        try:
            course = Course.objects.get(
                id=course_id
            )

        except Course.DoesNotExist:

            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if course.status == "draft":

            return Response(
                {
                    "message": "Course is already unpublished."
                }
            )

        course.status = "draft"
        course.save()

        return Response(
            {
                "message": "Course unpublished successfully."
            }
        )


# Student Learning Module
# *********************************

class PublishedCourseListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        courses = Course.objects.filter(
            status="published"
        ).order_by("-created_at")

        serializer = CourseSerializer(
            courses,
            many=True
        )

        return Response(serializer.data)        


class StudentCourseDetailsAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):

        course = get_object_or_404(
            Course,
            id=course_id,
            status="published"
        )

        serializer = CourseSerializer(course)

        data = serializer.data

        data["modules_count"] = course.modules.count()

        data["lessons_count"] = sum(
            module.lessons.count()
            for module in course.modules.all()
        )

        data["is_enrolled"] = Enrollment.objects.filter(
            student=request.user,
            course=course
        ).exists()

        return Response(data)   


class EnrollmentAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):

        course = get_object_or_404(
            Course,
            id=course_id,
            status="published"
        )

        if request.user.role != "student":

            return Response(
                {
                    "error": "Only students can enroll."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if Enrollment.objects.filter(
            student=request.user,
            course=course
        ).exists():

            return Response(
                {
                    "error": "You are already enrolled in this course."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment = Enrollment.objects.create(
            student=request.user,
            course=course
        )

        return Response(
            {
                "message": "Enrollment successful.",
                "enrollment_id": enrollment.id
            },
            status=status.HTTP_201_CREATED
        )            


class MyCoursesAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "student":

            return Response(
                {
                    "error": "Only students can access this endpoint."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        enrollments = Enrollment.objects.filter(
            student=request.user
        ).select_related(
            "course",
            "course__mentor"
        )

        serializer = EnrollmentSerializer(
            enrollments,
            many=True
        )

        return Response(serializer.data)


class ModuleListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):

        try:
            course = Course.objects.get(
                id=course_id,
                status="published"
            )

        except Course.DoesNotExist:

            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user.role == "student":

            if not Enrollment.objects.filter(
                student=request.user,
                course=course,
                is_active=True
            ).exists():

                return Response(
                    {
                        "error": "You are not enrolled in this course."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        elif request.user != course.mentor:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        modules = Module.objects.filter(
            course=course
        ).order_by("order")

        serializer = ModuleSerializer(
            modules,
            many=True
        )

        return Response(serializer.data)


class LessonListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, module_id):

        try:
            module = Module.objects.select_related("course").get(
                id=module_id
            )

        except Module.DoesNotExist:

            return Response(
                {
                    "error": "Module not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        course = module.course

        if request.user.role == "student":

            enrolled = Enrollment.objects.filter(
                student=request.user,
                course=course,
                is_active=True
            ).exists()

            if not enrolled:

                return Response(
                    {
                        "error": "You are not enrolled in this course."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        elif request.user == course.mentor:

            pass

        else:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        lessons = Lesson.objects.filter(
            module=module
        ).order_by("order")

        serializer = LessonSerializer(
            lessons,
            many=True
        )

        return Response(serializer.data)



class LessonDetailsAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):

        try:

            lesson = Lesson.objects.select_related(
                "module",
                "module__course"
            ).get(
                id=lesson_id
            )

        except Lesson.DoesNotExist:

            return Response(
                {
                    "error": "Lesson not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        course = lesson.module.course

        if request.user.role == "student":

            enrolled = Enrollment.objects.filter(
                student=request.user,
                course=course,
                is_active=True
            ).exists()

            if not enrolled:

                return Response(
                    {
                        "error": "You are not enrolled in this course."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        elif request.user == course.mentor:

            pass

        else:

            return Response(
                {
                    "error": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LessonSerializer(
            lesson
        )

        return Response(serializer.data)


class MarkLessonCompleteAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):

        try:
            lesson = Lesson.objects.select_related(
                "module",
                "module__course"
            ).get(id=lesson_id)

        except Lesson.DoesNotExist:

            return Response(
                {
                    "error": "Lesson not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        course = lesson.module.course

        # Only students can complete lessons
        if request.user.role != "student":

            return Response(
                {
                    "error": "Only students can complete lessons."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Student must be enrolled
        enrolled = Enrollment.objects.filter(
            student=request.user,
            course=course,
            is_active=True
        ).exists()

        if not enrolled:

            return Response(
                {
                    "error": "You are not enrolled in this course."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        progress, created = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson
        )

        if progress.is_completed:
            return Response(
                {
                    "message": "Lesson already completed."
                },
                status=status.HTTP_200_OK
            )        

        progress.is_completed = True
        progress.completed_at = timezone.now()
        progress.save()

        return Response(
            {
                "message": "Lesson marked as completed.",
                "lesson_id": lesson.id,
                "completed": True,
                "completed_at": progress.completed_at
            },
            status=status.HTTP_200_OK
        ) 


class CourseProgressAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):

        try:

            course = Course.objects.get(
                id=course_id,
                status="published"
            )

        except Course.DoesNotExist:

            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Student only
        if request.user.role != "student":

            return Response(
                {
                    "error": "Only students can view course progress."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Enrollment check
        enrolled = Enrollment.objects.filter(
            student=request.user,
            course=course,
            is_active=True
        ).exists()

        if not enrolled:

            return Response(
                {
                    "error": "You are not enrolled in this course."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        total_lessons = Lesson.objects.filter(
            module__course=course
        ).count()

        completed_lessons = LessonProgress.objects.filter(
            student=request.user,
            lesson__module__course=course,
            is_completed=True
        ).count()

        if total_lessons == 0:

            progress_percentage = 0

        else:

            progress_percentage = round(
                (completed_lessons / total_lessons) * 100,
                2
            )

        return Response({

            "course_id": course.id,

            "course_title": course.title,

            "total_lessons": total_lessons,

            "completed_lessons": completed_lessons,

            "progress_percentage": progress_percentage,

        })               


class ContinueLearningAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):

        try:

            course = Course.objects.get(
                id=course_id,
                status="published"
            )

        except Course.DoesNotExist:

            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user.role != "student":

            return Response(
                {
                    "error": "Only students can access this API."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        enrolled = Enrollment.objects.filter(
            student=request.user,
            course=course,
            is_active=True
        ).exists()

        if not enrolled:

            return Response(
                {
                    "error": "You are not enrolled in this course."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        lessons = Lesson.objects.filter(
            module__course=course
        ).order_by(
            "module__order",
            "order"
        )

        for lesson in lessons:

            completed = LessonProgress.objects.filter(
                student=request.user,
                lesson=lesson,
                is_completed=True
            ).exists()

            if not completed:

                serializer = LessonSerializer(lesson)

                return Response(serializer.data)

        return Response(
            {
                "message": "Course completed."
            }
        )        


class CourseCompletionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):

        try:
            course = Course.objects.get(
                id=course_id,
                status="published"
            )

        except Course.DoesNotExist:

            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user.role != "student":

            return Response(
                {
                    "error": "Only students can complete courses."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            enrollment = Enrollment.objects.get(
                student=request.user,
                course=course,
                is_active=True
            )

        except Enrollment.DoesNotExist:

            return Response(
                {
                    "error": "You are not enrolled in this course."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if enrollment.is_completed:

            return Response(
                {
                    "message": "Course already completed."
                }
            )

        total_lessons = Lesson.objects.filter(
            module__course=course
        ).count()

        completed_lessons = LessonProgress.objects.filter(
            student=request.user,
            lesson__module__course=course,
            is_completed=True
        ).count()

        if completed_lessons != total_lessons:

            return Response(
                {
                    "error": "Complete all lessons before finishing the course."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment.is_completed = True
        enrollment.completed_at = timezone.now()
        enrollment.save()

        return Response(
            {
                "message": "Congratulations! Course completed successfully.",
                "completed_at": enrollment.completed_at,
            }
        )        