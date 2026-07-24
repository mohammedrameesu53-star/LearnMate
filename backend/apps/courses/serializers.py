# pyrefly: ignore [missing-import]
from rest_framework import serializers

from .models import (
    Course,
    Module,
    Lesson,
    LessonResource,
    Enrollment,
    LessonProgress,
)

class CourseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Course
        fields = "__all__"
        read_only_fields = ["mentor"]

class ModuleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Module
        fields = "__all__"

class LessonSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lesson
        fields = "__all__"

class LessonResourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonResource
        fields = "__all__"
        read_only_fields = ["lesson"]

class EnrollmentSerializer(serializers.ModelSerializer):

    course_title = serializers.CharField(
        source="course.title",
        read_only=True
    )

    thumbnail = serializers.ImageField(
        source="course.thumbnail",
        read_only=True
    )

    mentor = serializers.EmailField(
        source="course.mentor.email",
        read_only=True
    )

    class Meta:

        model = Enrollment

        fields = [
            "id",
            "course",
            "course_title",
            "thumbnail",
            "mentor",
            "enrolled_at",
        ]

class LessonProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonProgress
        fields = "__all__"
        
                                

